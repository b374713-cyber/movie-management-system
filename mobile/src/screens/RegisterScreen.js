import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL, IMAGE_URL } from '../config';

export default function ReservationsScreen() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchReservations();
    }
  }, [userId]);

  const getUserId = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setUserId(userData.id);
      }
    } catch (error) {
      console.error('Error getting user:', error);
    }
  };

  const fetchReservations = async () => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`${API_URL}/reservations/${userId}`);
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      Alert.alert('Error', 'Failed to load reservations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  const cancelReservation = async (reservationId, movieTitle) => {
    Alert.alert(
      'Cancel Reservation',
      `Are you sure you want to cancel reservation for "${movieTitle}"?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/reservation/${reservationId}`);
              Alert.alert('Success', 'Reservation cancelled');
              fetchReservations(); // Refresh list
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel reservation');
            }
          }
        }
      ]
    );
  };

  const formatTimeLeft = (expiresAt) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const renderReservation = ({ item }) => {
    const timeLeft = formatTimeLeft(item.expires_at);
    const isExpiringSoon = timeLeft !== 'Expired' && parseInt(timeLeft) < 2;
    
    return (
      <View style={styles.reservationCard}>
        <View style={styles.imageContainer}>
          {item.image_url ? (
            <Image 
              source={{ uri: `http://192.168.1.109:5000${item.image_url}` }}
              style={styles.movieImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🎬</Text>
            </View>
          )}
        </View>
        
        <View style={styles.reservationInfo}>
          <Text style={styles.movieTitle}>{item.title}</Text>
          <Text style={styles.moviePrice}>💰 Price: ${item.price_week}</Text>
          
          <View style={styles.timeContainer}>
            <Text style={styles.reservedAt}>
              📅 Reserved: {new Date(item.reserved_at).toLocaleDateString()}
            </Text>
            <View style={[styles.timeLeftBadge, isExpiringSoon && styles.expiringSoon]}>
              <Text style={styles.timeLeftText}>
                ⏰ Expires in: {timeLeft}
              </Text>
            </View>
          </View>
          
          <View style={styles.pickupInfo}>
            <Text style={styles.pickupText}>📍 Pick up at store within 48 hours</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => cancelReservation(item.id, item.title)}
          >
            <Text style={styles.cancelButtonText}>Cancel Reservation</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#dc3545" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📝 My Reservations</Text>
        <Text style={styles.headerSubtitle}>
          {reservations.length} {reservations.length === 1 ? 'movie' : 'movies'} reserved
        </Text>
      </View>

      {reservations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎬</Text>
          <Text style={styles.emptyTitle}>No Reservations</Text>
          <Text style={styles.emptyText}>
            You haven't reserved any movies yet.
          </Text>
          <Text style={styles.emptySubtext}>
            Go to Movies tab and reserve your favorite movies!
          </Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          renderItem={renderReservation}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

// Add RefreshControl import at top
import { RefreshControl } from 'react-native';

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
    fontSize: 28,
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
    flexDirection: 'row',
  },
  imageContainer: {
    width: 100,
    height: 140,
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
    fontSize: 30,
  },
  reservationInfo: {
    flex: 1,
    padding: 12,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  moviePrice: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timeContainer: {
    marginBottom: 8,
  },
  reservedAt: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  timeLeftBadge: {
    backgroundColor: '#f0ad4e',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  expiringSoon: {
    backgroundColor: '#dc3545',
  },
  timeLeftText: {
    fontSize: 11,
    color: 'white',
    fontWeight: 'bold',
  },
  pickupInfo: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  pickupText: {
    fontSize: 11,
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});