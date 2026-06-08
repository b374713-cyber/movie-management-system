import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  SafeAreaView
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RatingModal from '../components/RatingModal';
import { API_URL, IMAGE_URL } from '../config';

export default function MoviesScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedMovieForRating, setSelectedMovieForRating] = useState(null);

  const genres = ['All', 'Action', 'Comedy', 'Drama', 'Romance', 'Thriller', 'Sci-Fi'];

  useEffect(() => {
    getUserId();
    fetchMovies();
  }, []);

  // Filter movies whenever movies, searchText, or selectedGenre changes
  useEffect(() => {
    filterMovies();
  }, [movies, searchText, selectedGenre]);

  const getUserId = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setUserId(userData.id);
        console.log('User ID:', userData.id);
      }
    } catch (error) {
      console.error('Error getting user:', error);
    }
  };

  const handleRateMovie = (movie) => {
    if (!userId) {
      Alert.alert('Login Required', 'Please login to rate movies');
      return;
    }
    setSelectedMovieForRating(movie);
    setShowRatingModal(true);
  };

  const fetchMovies = async () => {
    try {
      const response = await axios.get(`${API_URL}/movies`);
      console.log('Movies fetched:', response.data);
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
      Alert.alert('Error', 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const filterMovies = () => {
    let filtered = [...movies];
    
    // Filter by search text
    if (searchText.trim() !== '') {
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Filter by genre
    if (selectedGenre !== 'All') {
      filtered = filtered.filter(movie => {
        const movieGenre = movie.genre || 'Action';
        return movieGenre === selectedGenre;
      });
    }
    
    setFilteredMovies(filtered);
    console.log(`Filtered: ${filtered.length} movies (Genre: ${selectedGenre}, Search: "${searchText}")`);
  };

  const handleReserve = (movie) => {
    if (!userId) {
      Alert.alert('Login Required', 'Please login to reserve movies');
      return;
    }
    if (movie.stock === 0) {
      Alert.alert('Not Available', 'This movie is out of stock');
      return;
    }
    setSelectedMovie(movie);
    setModalVisible(true);
  };

  const confirmReservation = async () => {
    if (!userId || !selectedMovie) return;
    console.log('📱 Reserving:', { userId, movieId: selectedMovie.id });
    try {
      const response = await axios.post(`${API_URL}/reserve`, {
        userId: userId,
        movieId: selectedMovie.id
      });
      
      if (response.data.success) {
        Alert.alert('Success', `"${selectedMovie.title}" reserved for 48 hours!`);
        setModalVisible(false);
        fetchMovies();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to reserve movie');
      }
    } catch (error) {
      console.error('Reservation error:', error);
      Alert.alert('Error', 'Failed to reserve movie. Please try again.');
    }
  };

  const renderMovie = ({ item }) => (
    <View style={styles.movieCard}>
      <TouchableOpacity 
        onPress={() => handleReserve(item)}
        activeOpacity={0.9}
      >
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
          {item.stock === 0 && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}
        </View>
        <View style={styles.movieInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.movieTitle}>{item.title}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.averageRating}>{item.average_rating || item.rating || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.genreBadge}>
            <Text style={styles.genreText}>{item.genre || 'Action'}</Text>
          </View>
          <Text style={styles.movieYear}>📅 {item.release_year || 'N/A'}</Text>
          <Text style={styles.ratingCount}>📊 {item.total_ratings || 0} ratings</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>Week: ${item.price_week}</Text>
            <Text style={styles.price}>Month: ${item.price_month}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.reserveButton, item.stock === 0 && styles.disabledButton]}
            onPress={() => handleReserve(item)}
            disabled={item.stock === 0}
          >
            <Text style={styles.reserveButtonText}>
              {item.stock > 0 ? '🎬 Reserve for 48 hours' : '❌ Not Available'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.rateButton}
            onPress={() => handleRateMovie(item)}
          >
            <Text style={styles.rateButtonText}>⭐ Rate this movie</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#dc3545" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Premium Button */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>🎬 Movie Collection</Text>
          <TouchableOpacity 
            style={styles.premiumButton} 
            onPress={() => navigation.navigate('Premium')}
          >
            <Text style={styles.premiumButtonText}>👑 Premium</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Find your next favorite movie</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search by title..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Genre Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.genresContainer}
        contentContainerStyle={styles.genresContent}
      >
        {genres.map((genre) => (
          <TouchableOpacity
            key={genre}
            style={[styles.genreButton, selectedGenre === genre && styles.activeGenre]}
            onPress={() => setSelectedGenre(genre)}
          >
            <Text style={[styles.genreText, selectedGenre === genre && styles.activeGenreText]}>
              {genre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsCount}>
        <Text style={styles.resultsCountText}>
          Found {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Movies List */}
      <FlatList
        data={filteredMovies}
        renderItem={renderMovie}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎬</Text>
            <Text style={styles.emptyTitle}>No movies found</Text>
            <Text style={styles.emptySubtext}>Try a different genre or search term</Text>
          </View>
        }
      />

      {/* Reservation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Reservation</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {selectedMovie && (
              <>
                <View style={styles.modalMovieInfo}>
                  <Text style={styles.modalMovieTitle}>{selectedMovie.title}</Text>
                  <Text style={styles.modalMovieYear}>{selectedMovie.release_year}</Text>
                  <Text style={styles.modalMovieRating}>⭐ {selectedMovie.average_rating || selectedMovie.rating || 'N/A'}/10</Text>
                </View>
                <View style={styles.modalDivider} />
                <Text style={styles.modalSectionTitle}>Reservation Details</Text>
                <Text style={styles.modalText}>📀 Reserve for 48 hours</Text>
                <Text style={styles.modalSmallText}>
                  Pick up within 48 hours. If not picked up, the reservation will be cancelled automatically.
                </Text>
                <View style={styles.priceBox}>
                  <Text style={styles.priceBoxText}>Reservation Price: ${selectedMovie.price_week}</Text>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={confirmReservation}
                  >
                    <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        movie={selectedMovieForRating}
        userId={userId}
        onClose={() => {
          setShowRatingModal(false);
          setSelectedMovieForRating(null);
        }}
        onRated={() => {
          fetchMovies();
        }}
      />
    </SafeAreaView>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  premiumButton: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumButtonText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 12,
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
  searchContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  genresContainer: {
    maxHeight: 50,
  },
  genresContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  genreButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeGenre: {
    backgroundColor: '#dc3545',
  },
  genreText: {
    color: '#666',
    fontWeight: '500',
  },
  activeGenreText: {
    color: 'white',
  },
  resultsCount: {
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 5,
  },
  resultsCountText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  listContent: {
    padding: 15,
    paddingTop: 5,
    paddingBottom: 30,
  },
  movieCard: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 220,
    position: 'relative',
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
    fontSize: 50,
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  outOfStockText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  movieInfo: {
    padding: 15,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  starIcon: {
    fontSize: 12,
    marginRight: 3,
  },
  averageRating: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
  },
  ratingCount: {
    fontSize: 11,
    color: '#999',
    marginBottom: 5,
  },
  genreBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  genreText: {
    fontSize: 11,
    color: '#dc3545',
    fontWeight: '600',
  },
  movieYear: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  movieRating: {
    fontSize: 14,
    color: '#f39c12',
    marginBottom: 8,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  price: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  reserveButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  reserveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  rateButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  rateButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalClose: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  modalMovieInfo: {
    padding: 20,
    alignItems: 'center',
  },
  modalMovieTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  modalMovieYear: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  modalMovieRating: {
    fontSize: 16,
    color: '#f39c12',
    marginTop: 5,
    fontWeight: 'bold',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginHorizontal: 20,
  },
  modalText: {
    fontSize: 15,
    color: '#555',
    marginTop: 10,
    marginHorizontal: 20,
  },
  modalSmallText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    marginHorizontal: 20,
  },
  priceBox: {
    backgroundColor: '#f8f9fa',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  priceBoxText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#28a745',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});