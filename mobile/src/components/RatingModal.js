import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

export default function RatingModal({ visible, movie, userId, onClose, onRated }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
    if (visible && userId && movie) {
      fetchUserRating();
    }
  }, [visible]);

  const fetchUserRating = async () => {
    try {
      const response = await axios.get(`${API_URL}/user-rating/${userId}/${movie.id}`);
      if (response.data.rating) {
        setUserRating(response.data.rating);
        setRating(response.data.rating);
        setReview(response.data.review || '');
      }
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  };

  const submitRating = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/ratings`, {
        userId,
        movieId: movie.id,
        rating,
        review
      });
      
      Alert.alert('Success', 'Thank you for rating!');
      if (onRated) onRated();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating');
    }
    setLoading(false);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Text style={[styles.star, i <= rating ? styles.starFilled : styles.starEmpty]}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Rate {movie?.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            {userRating && (
              <Text style={styles.previousRating}>
                Your previous rating: {userRating} ★
              </Text>
            )}
            
            <View style={styles.starsContainer}>
              {renderStars()}
            </View>
            
            <TextInput
              style={styles.reviewInput}
              placeholder="Write your review (optional)..."
              placeholderTextColor="#999"
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={3}
            />
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={submitRating}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {userRating ? 'Update Rating' : 'Submit Rating'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  previousRating: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  star: {
    fontSize: 40,
    marginHorizontal: 5,
  },
  starFilled: {
    color: '#FFD700',
  },
  starEmpty: {
    color: '#ccc',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#dc3545',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});