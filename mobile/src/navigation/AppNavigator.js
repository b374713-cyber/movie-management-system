import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView, View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import StartScreen from '../screens/StartScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MoviesScreen from '../screens/MoviesScreen';
import ReservationsScreen from '../screens/ReservationsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PremiumScreen from '../screens/PremiumScreen';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

function MainTabs() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            let iconLabel;
            
            if (route.name === 'Movies') {
              iconName = focused ? 'film' : 'film-outline';
              iconLabel = 'Movies';
            } else if (route.name === 'Reservation') {
              iconName = focused ? 'bookmark' : 'bookmark-outline';
              iconLabel = 'Reserved';
            } else if (route.name === 'History') {
              iconName = focused ? 'time' : 'time-outline';
              iconLabel = 'History';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
              iconLabel = 'Profile';
            }
            
            return (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={iconName} size={22} color={color} />
                <Text style={{ 
                  fontSize: 10, 
                  color: color, 
                  marginTop: 2,
                  fontWeight: focused ? 'bold' : 'normal'
                }}>
                  {iconLabel}
                </Text>
              </View>
            );
          },
          tabBarActiveTintColor: '#dc3545',
          tabBarInactiveTintColor: '#888',
          tabBarIndicatorStyle: { 
            backgroundColor: '#dc3545', 
            height: 3,
            borderRadius: 3,
          },
          tabBarStyle: { 
            backgroundColor: '#fff', 
            elevation: 4, 
            shadowColor: '#000', 
            shadowOpacity: 0.1, 
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 2 },
            paddingTop: 8,
            paddingBottom: 8,
            height: 70,
          },
          tabBarLabelStyle: { 
            fontSize: 0,
          },
          tabBarIconStyle: { 
            marginBottom: 0,
          },
          tabBarItemStyle: { 
            paddingVertical: 5,
          },
        })}
      >
        <Tab.Screen 
          name="Movies" 
          component={MoviesScreen} 
          options={{ tabBarLabel: 'Movies' }}
        />
        <Tab.Screen 
          name="Reservation" 
          component={ReservationsScreen} 
          options={{ tabBarLabel: 'Reserved' }}
        />
        <Tab.Screen 
          name="History" 
          component={HistoryScreen} 
          options={{ tabBarLabel: 'History' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ tabBarLabel: 'Profile' }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={MainTabs} />
        <Stack.Screen name="Premium" component={PremiumScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}