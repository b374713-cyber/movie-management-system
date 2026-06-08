import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation, route }) {
  const user = route.params?.user || { email: 'Customer' };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user.email}!</Text>
      <Text style={styles.title}>🎬 Movie DB</Text>
      <Text style={styles.subtitle}>Your personal movie collection</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => Alert.alert('Coming Soon', 'Movie browsing coming soon!')}
      >
        <Text style={styles.buttonText}>Browse Movies</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.replace('Start')}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  welcome: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 15,
    width: width * 0.7,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});