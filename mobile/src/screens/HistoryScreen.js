import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL, IMAGE_URL } from '../config';

export default function HistoryScreen() {
  const [rentals, setRentals] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchHistory();
      }
    }, [userId])
  );

  useEffect(() => {
    getUserId();
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
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/user/rentals/${userId}`);
      const allItems = response.data;
      
      const rentalItems = allItems.filter(item => 
        item.rental_type === 'week' || item.rental_type === 'month'
      );
      const purchaseItems = allItems.filter(item => 
        item.rental_type === 'purchase'
      );
      
      setRentals(rentalItems);
      setPurchases(purchaseItems);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status, rentalType) => {
    if (rentalType === 'purchase') return '#dc3545';
    switch (status) {
      case 'active': return '#28a745';
      case 'returned': return '#17a2b8';
      case 'completed': return '#6c757d';
      default: return '#ffc107';
    }
  };

  const getStatusText = (status, rentalType) => {
    if (rentalType === 'purchase') return 'Purchased';
    switch (status) {
      case 'active': return 'Currently Rented';
      case 'returned': return 'Returned';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const activeRentals = rentals.filter(r => r.status === 'active');
  const historyRentals = rentals.filter(r => r.status !== 'active');

  const renderRentalItem = ({ item }) => (
    <View style={styles.historyCard}>
      <View style={styles.cardRow}>
        {/* Movie Image */}
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
        
        {/* Movie Info */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.movieTitle}>{item.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, item.rental_type) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status, item.rental_type)}</Text>
            </View>
          </View>
          
          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🎬 Type:</Text>
              <Text style={styles.infoValue}>
                {item.rental_type === 'purchase' ? '💾 Purchased' : 
                 item.rental_type === 'week' ? 'Weekly Rental' : 'Monthly Rental'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📅 Date:</Text>
              <Text style={styles.infoValue}>{formatDate(item.start_date)}</Text>
            </View>
            {item.rental_type !== 'purchase' && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>⏰ End Date:</Text>
                <Text style={styles.infoValue}>{formatDate(item.end_date)}</Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>💰 Total Paid:</Text>
              <Text style={styles.priceValue}>${item.total_price}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPurchaseItem = ({ item }) => (
    <View style={[styles.historyCard, styles.purchaseCard]}>
      <View style={styles.cardRow}>
        {/* Movie Image */}
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
        
        {/* Movie Info */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.movieTitle}>{item.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#dc3545' }]}>
              <Text style={styles.statusText}>💾 Purchased</Text>
            </View>
          </View>
          
          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🎬 Type:</Text>
              <Text style={styles.infoValue}>Permanent Ownership</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📅 Purchase Date:</Text>
              <Text style={styles.infoValue}>{formatDate(item.start_date)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>💰 Purchase Price:</Text>
              <Text style={styles.priceValue}>${item.total_price}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>📜 My History</Text>
        <Text style={styles.headerSubtitle}>
          {activeRentals.length} active | {historyRentals.length} returned | {purchases.length} purchased
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active ({activeRentals.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            Returned ({historyRentals.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'purchased' && styles.activeTab]}
          onPress={() => setActiveTab('purchased')}
        >
          <Text style={[styles.tabText, activeTab === 'purchased' && styles.activeTabText]}>
            Purchased ({purchases.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={
          activeTab === 'active' ? activeRentals : 
          activeTab === 'history' ? historyRentals : 
          purchases
        }
        renderItem={activeTab === 'purchased' ? renderPurchaseItem : renderRentalItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#dc3545']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎬</Text>
            <Text style={styles.emptyTitle}>
              {activeTab === 'active' ? 'No Active Rentals' : 
               activeTab === 'history' ? 'No Rental History' : 
               'No Purchases Yet'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'active' ? 'Rent a movie to see it here' : 
               activeTab === 'history' ? 'Returned movies will appear here' : 
               'Buy a movie to add it to your collection'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#dc3545',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  historyCard: {
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
  purchaseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  cardRow: {
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
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
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    color: '#333',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
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
    fontSize: 18,
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
});