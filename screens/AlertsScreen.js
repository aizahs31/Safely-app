import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';

const DUMMY_ALERTS = [
  {
    id: 1,
    type: 'warning',
    title: 'Danger Zone Nearby',
    message: 'You are approaching a high-risk area. Stay alert.',
    time: '2 min ago',
    color: '#FFA500',
  },
  {
    id: 2,
    type: 'danger',
    title: 'Restricted Area Alert',
    message: 'Entry into this zone is prohibited. Please avoid.',
    time: '15 min ago',
    color: '#FF3B30',
  },
  {
    id: 3,
    type: 'info',
    title: 'Safety Tip',
    message: 'Keep your valuables secure in crowded areas.',
    time: '1 hour ago',
    color: '#007AFF',
  },
  {
    id: 4,
    type: 'warning',
    title: 'Shady Area Detected',
    message: 'Multiple reports of suspicious activity in this area.',
    time: '2 hours ago',
    color: '#FFD700',
  },
  {
    id: 5,
    type: 'info',
    title: 'Welcome to Safely',
    message: 'Your safety companion is now active and monitoring your location.',
    time: '3 hours ago',
    color: '#4CAF50',
  },
];

export default function AlertsScreen({ navigation }) {
  const [alerts, setAlerts] = useState(DUMMY_ALERTS);

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Safety Alerts</Text>
        <TouchableOpacity onPress={clearAllAlerts}>
          <Text style={styles.clearButton}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyText}>No alerts</Text>
            <Text style={styles.emptySubtext}>You're all caught up!</Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <View key={alert.id} style={[styles.alertCard, { borderLeftColor: alert.color }]}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertTime}>{alert.time}</Text>
              </View>
              <Text style={styles.alertMessage}>{alert.message}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#16365D',
  },
  backButton: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: 'Poppins_400Regular',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
  clearButton: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#16365D',
    flex: 1,
  },
  alertTime: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#999',
  },
  alertMessage: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#16365D',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#999',
  },
});
