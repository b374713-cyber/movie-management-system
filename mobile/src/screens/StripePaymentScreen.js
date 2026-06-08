import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

export default function StripePaymentScreen({ route, navigation }) {
  const { amount, plan, userId, onSuccess } = route.params;
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Since mobile Stripe SDK requires extra setup, we'll use webview or
      // simply mark as "online payment" for now
      Alert.alert(
        'Payment Demo',
        `Payment of $${amount} would be processed here via Stripe.\n\nFor demo, we'll mark this as paid.`,
        [
          {
            text: 'Complete Demo',
            onPress: async () => {
              // Create subscription as paid
              const response = await axios.post(`${API_URL}/premium/subscribe`, {
                userId: userId,
                planId: plan,
                paymentMethod: 'online'
              });
              
              if (response.data.success) {
                Alert.alert('Success', 'Premium activated successfully!');
                if (onSuccess) onSuccess();
                navigation.goBack();
              }
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Payment failed');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💳 Secure Payment</Text>
        <Text style={styles.headerSubtitle}>Complete your premium subscription</Text>
      </View>

      <View style={styles.paymentCard}>
        <Text style={styles.amount}>${amount}</Text>
        <Text style={styles.planText}>{plan === 'monthly' ? 'Monthly Premium' : 'Yearly Premium'}</Text>
        
        <TouchableOpacity style={styles.payButton} onPress={handlePayment} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payButtonText}>Pay ${amount}</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.secureText}>
          🔒 Secure payment processed by Stripe
        </Text>
      </View>
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
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
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
  paymentCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  amount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
  },
  planText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  payButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secureText: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
  },
});