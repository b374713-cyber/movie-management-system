import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;
  
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);
    
    // Save token to backend
    const user = await AsyncStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      await axios.post(`${API_URL}/save-push-token`, {
        userId: userData.id,
        pushToken: token
      });
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export async function scheduleReservationReminder(reservation) {
  const expiryTime = new Date(reservation.expires_at);
  const reminderTime = new Date(expiryTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
  
  if (reminderTime > new Date()) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎬 Movie Reservation Reminder',
        body: `Your reservation for "${reservation.title}" expires in 2 hours!`,
        data: { reservationId: reservation.id, screen: 'Reservations' },
      },
      trigger: reminderTime,
    });
    console.log(`📅 Scheduled reminder for ${reservation.title} at ${reminderTime}`);
  }
}

export async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🎬 Movie DB',
      body: 'This is a test notification! Your notifications are working.',
    },
    trigger: null,
  });
}

export async function showLocalNotification(title, body, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: data,
    },
    trigger: null,
  });
}