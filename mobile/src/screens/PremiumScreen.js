import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL, IMAGE_URL } from '../config';

export default function PremiumScreen({ navigation }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userPremium, setUserPremium] = useState(null);

  useEffect(() => {
    getUserId();
    fetchPlans();
    fetchPremiumStatus();
  }, []);

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

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_URL}/premium/plans`);
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPremiumStatus = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`${API_URL}/premium/status/${userId}`);
      setUserPremium(response.data);
    } catch (error) {
      console.error('Error fetching premium status:', error);
    }
  };

  const handleSubscribe = async (paymentMethod) => {
    if (!selectedPlan || !userId) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/premium/subscribe`, {
        userId: userId,
        planId: selectedPlan.id,
        paymentMethod: paymentMethod
      });
      
      if (response.data.success) {
        setShowPaymentModal(false);
        
        if (paymentMethod === 'online') {
          Alert.alert('Success', response.data.message);
        } else {
          Alert.alert(
            'Subscription Created',
            `${response.data.message}\n\nInvoice: ${response.data.invoiceNumber}\nPlease pay in store to activate premium.`
          );
        }
        
        fetchPremiumStatus();
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      Alert.alert('Error', 'Failed to process subscription');
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#dc3545" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👑 Premium Membership</Text>
        <Text style={styles.headerSubtitle}>Unlock exclusive benefits</Text>
      </View>

      {/* Premium Status */}
      {userPremium?.is_premium === 1 && (
        <View style={styles.premiumCard}>
          <Text style={styles.premiumCardTitle}>✨ You are a Premium Member!</Text>
          <Text style={styles.premiumCardText}>
            Valid until: {formatDate(userPremium.premium_expiry)}
          </Text>
        </View>
      )}

      {/* Benefits */}
      <View style={styles.benefitsCard}>
        <Text style={styles.sectionTitle}>🎁 Premium Benefits</Text>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>🎬</Text>
          <Text style={styles.benefitText}>Access to exclusive movies</Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>💎</Text>
          <Text style={styles.benefitText}>Priority reservations</Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>🎁</Text>
          <Text style={styles.benefitText}>Monthly free movie ticket</Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>⭐</Text>
          <Text style={styles.benefitText}>10% discount on all rentals</Text>
        </View>
      </View>

      {/* Plans */}
      <Text style={styles.sectionTitle}>💰 Subscription Plans</Text>
      {plans.map((plan) => (
        <TouchableOpacity
          key={plan.id}
          style={[
            styles.planCard,
            selectedPlan?.id === plan.id && styles.selectedPlan
          ]}
          onPress={() => setSelectedPlan(plan)}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planPrice}>${plan.price}</Text>
          </View>
          <Text style={styles.planDescription}>{plan.description}</Text>
          {plan.id === 'yearly' && (
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save 16%</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}

      {/* Subscribe Button */}
      {selectedPlan && userPremium?.is_premium !== 1 && (
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={() => setShowPaymentModal(true)}
        >
          <Text style={styles.subscribeButtonText}>
            Subscribe to {selectedPlan.name}
          </Text>
        </TouchableOpacity>
      )}

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
              <Text style={styles.modalPlan}>
                Plan: {selectedPlan?.name} - ${selectedPlan?.price}
              </Text>
              
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => handleSubscribe('online')}
              >
                <Text style={styles.paymentOptionIcon}>💳</Text>
                <View>
                  <Text style={styles.paymentOptionTitle}>Pay Online</Text>
                  <Text style={styles.paymentOptionDesc}>Credit card / Debit card</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => handleSubscribe('cash')}
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

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Cancel anytime. No commitment.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#dc3545',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  premiumCard: {
    backgroundColor: '#FFD700',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  premiumCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  premiumCardText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  benefitsCard: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginLeft: 15,
    marginTop: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  benefitText: {
    fontSize: 16,
    color: '#555',
  },
  planCard: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 5,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlan: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
  },
  saveBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#28a745',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  saveBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  subscribeButton: {
    backgroundColor: '#dc3545',
    margin: 15,
    marginTop: 5,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: '#dc3545',
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
  modalPlan: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});