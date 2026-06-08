import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  Linking,
  AppState
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleReservationReminder } from '../services/NotificationService';
import { API_URL, IMAGE_URL } from '../config';
import { showLocalNotification } from '../services/NotificationService';

// After payment confirmation
const showPaymentSuccessNotification = () => {
  showLocalNotification(
    '💳 Payment Successful',
    'Your payment has been processed successfully! Your reservation is now confirmed.'
  );
};
export default function ReservationsScreen({ navigation }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    getUserId();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('📱 Reservations tab focused - refreshing...');
      if (userId) {
        fetchReservations();
      }
    }, [userId])
  );

  useEffect(() => {
    if (userId) {
      fetchReservations();
    }
  }, [userId]);

  // Handle app coming back from Stripe
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && pendingPaymentId) {
        console.log('App returned, checking payment status...');
        checkAndUpdatePaymentStatus(pendingPaymentId);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [pendingPaymentId]);

  const getUserId = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setUserId(userData.id);
        console.log('User ID:', userData.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error getting user:', error);
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`${API_URL}/reservations/${userId}`);
      // Show ALL active reservations (not received yet)
      const activeReservations = response.data.filter(r => r.is_received !== 1);
      console.log(`✅ Found ${activeReservations.length} active reservations`);
      setReservations(activeReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      Alert.alert('Error', 'Failed to load reservations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

 const checkAndUpdatePaymentStatus = async (reservationId) => {
  if (checkingPayment) return;
  setCheckingPayment(true);
  
  try {
    const response = await axios.get(`${API_URL}/reservation/status/${reservationId}`);
    console.log('Payment status:', response.data);
    
    if (response.data.payment_status === 'paid') {
      showPaymentSuccessNotification();
      Alert.alert('Success', 'Payment confirmed! Your reservation is now waiting for store processing.');
      setPendingPaymentId(null);
      fetchReservations();
    }
  } catch (error) {
    console.error('Error checking payment:', error);
  }
  setCheckingPayment(false);
};
  const handleCancelReservation = async (reservationId, movieTitle) => {
    Alert.alert(
      'Cancel Reservation',
      `Cancel "${movieTitle}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(`${API_URL}/reservation/${reservationId}`);
              if (response.data.success) {
                Alert.alert('Success', 'Reservation cancelled');
                fetchReservations();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel reservation');
            }
          }
        }
      ]
    );
  };

  const handlePayNow = (reservation) => {
    setSelectedReservation(reservation);
    setShowPaymentModal(true);
  };

  const handlePayment = async (paymentMethod) => {
    if (!selectedReservation || !userId) return;
    
    setPaymentLoading(true);
    try {
      if (paymentMethod === 'online') {
        setPendingPaymentId(selectedReservation.id);
        
        const response = await axios.post(`${API_URL}/create-checkout-session`, {
          reservationId: selectedReservation.id,
          amount: selectedReservation.price_week,
          movieTitle: selectedReservation.title,
          userId: userId,
          customerEmail: selectedReservation.customer_email
        });
        
        if (response.data.url) {
          await Linking.openURL(response.data.url);
        }
      } else if (paymentMethod === 'cash') {
        await axios.post(`${API_URL}/reservation/mark-cash`, {
          reservationId: selectedReservation.id
        });
        Alert.alert('Success', 'Reservation marked for cash payment. Please pay at store.');
        fetchReservations();
      }
      
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to process payment');
      setPendingPaymentId(null);
    }
    setPaymentLoading(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;
    
    if (diffMs <= 0) return 'Expired';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    
    if (diffDays > 0) {
      return `${diffDays}d ${remainingHours}h remaining`;
    }
    return `${diffHours}h remaining`;
  };

  const getStatusBadge = (paymentStatus) => {
    if (paymentStatus === 'paid') {
      return { text: '✓ Paid Online', color: '#28a745' };
    } else if (paymentStatus === 'cash') {
      return { text: '💰 Cash Pending', color: '#ffc107' };
    } else {
      return { text: '⏳ Pending', color: '#dc3545' };
    }
  };

  const renderReservation = ({ item }) => {
    const status = getStatusBadge(item.payment_status);
    const showPayButton = item.payment_status !== 'paid' && item.payment_status !== 'cash';
    
    return (
      <View style={styles.reservationCard}>
        <View style={styles.cardRow}>
          <View style={styles.imageContainer}>
            {item.image_url ? (
              <Image 
                source={{ uri: `${IMAGE_URL}${item.image_url}` }}
                style={styles.movieImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>🎬</Text>
              </View>
            )}
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.movieTitle}>{item.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                <Text style={styles.statusText}>{status.text}</Text>
              </View>
            </View>
            
            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📅 Reserved:</Text>
                <Text style={styles.infoValue}>{formatDate(item.reserved_at)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>⏰ Expires:</Text>
                <Text style={styles.infoValue}>{formatDate(item.expires_at)}</Text>
              </View>
              <View style={styles.timeRemainingBox}>
                <Text style={styles.timeRemainingText}>
                  ⏳ {getTimeRemaining(item.expires_at)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>💰 Price:</Text>
                <Text style={styles.priceText}>${item.price_week}</Text>
              </View>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelReservation(item.id, item.title)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              {showPayButton && (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => handlePayNow(item)}
                  disabled={paymentLoading}
                >
                  <Text style={styles.payButtonText}>💳 Pay Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#dc3545" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📝 My Reservations</Text>
        <Text style={styles.headerSubtitle}>
          {reservations.length} active reservation{reservations.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={reservations}
        renderItem={renderReservation}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#dc3545']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyTitle}>No Active Reservations</Text>
            <Text style={styles.emptyText}>
              All your reservations have been processed by the store
            </Text>
          </View>
        }
      />

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Payment Method</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalMovieTitle}>
                {selectedReservation?.title}
              </Text>
              <Text style={styles.modalAmount}>
                Amount: ${selectedReservation?.price_week}
              </Text>
              
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => handlePayment('online')}
                disabled={paymentLoading}
              >
                <Text style={styles.paymentOptionIcon}>💳</Text>
                <View>
                  <Text style={styles.paymentOptionTitle}>Pay Online</Text>
                  <Text style={styles.paymentOptionDesc}>Credit card / Debit card via Stripe</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => handlePayment('cash')}
                disabled={paymentLoading}
              >
                <Text style={styles.paymentOptionIcon}>💰</Text>
                <View>
                  <Text style={styles.paymentOptionTitle}>Pay Cash</Text>
                  <Text style={styles.paymentOptionDesc}>Pay at the store</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {checkingPayment && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#dc3545" />
            <Text style={styles.loadingText}>Confirming payment...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#dc3545',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  reservationCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 120,
    height: 180,
  },
  movieImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
  placeholderText: {
    fontSize: 40,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'column',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    width: 85,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    color: '#333',
  },
  timeRemainingBox: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  timeRemainingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
  },
  buttonRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  payButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#28a745',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  modalClose: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalMovieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalAmount: {
    fontSize: 16,
    textAlign: 'center',
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 10,
  },
  paymentOptionIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentOptionDesc: {
    fontSize: 12,
    color: '#666',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
  },
});