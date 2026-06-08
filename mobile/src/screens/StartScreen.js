import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function StartScreen({ navigation }) {
  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format' }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>🎬 CINEMA ZONE</Text>
          <Text style={styles.subtitle}>Your ultimate movie rental destination</Text>
          
          <View style={styles.features}>
            <Text style={styles.feature}>🎥 Thousands of Movies</Text>
            <Text style={styles.feature}>⭐ Ratings & Reviews</Text>
            <Text style={styles.feature}>📱 Mobile Ready</Text>
          </View>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>GET STARTED</Text>
          </TouchableOpacity>
          
          <Text style={styles.demoText}>
            Demo: admin@movie.com / admin123
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 40,
  },
  features: {
    marginBottom: 40,
    alignItems: 'center',
  },
  feature: {
    fontSize: 16,
    color: 'white',
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoText: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
  },
});