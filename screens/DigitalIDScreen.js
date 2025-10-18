import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { AuthContext } from '../App';

export default function DigitalIDScreen({ navigation, route }) {
  const { login } = useContext(AuthContext);
  const { name, email, phone } = route.params || {};

  const handleContinue = () => {
    const userData = {
      name: name || 'John Doe',
      email: email || 'john@example.com',
      phone: phone || '+91 9876543210',
      trip_id: 'SAF-TRIP-1024',
      trip_start: '2025-10-15',
      trip_end: '2025-10-20',
    };
    
    login(userData);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Digital Tourist ID</Text>
        <Text style={styles.subtitle}>Your blockchain-secured identity</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.idCard}>
          <View style={styles.idHeader}>
            <Text style={styles.idLogo}>🛡️</Text>
            <Text style={styles.idTitle}>SAFELY</Text>
          </View>

          <View style={styles.idBody}>
            <View style={styles.idRow}>
              <Text style={styles.label}>Trip ID</Text>
              <Text style={styles.value}>SAF-TRIP-1024</Text>
            </View>
            <View style={styles.idRow}>
              <Text style={styles.label}>Traveler</Text>
              <Text style={styles.value}>{name || 'John Doe'}</Text>
            </View>
            <View style={styles.idRow}>
              <Text style={styles.label}>Duration</Text>
              <Text style={styles.value}>Oct 15 - Oct 20, 2025</Text>
            </View>
            <View style={styles.idRow}>
              <Text style={styles.label}>Status</Text>
              <Text style={[styles.value, styles.statusActive]}>Active</Text>
            </View>
            <View style={styles.hashContainer}>
              <Text style={styles.hashLabel}>Blockchain Hash</Text>
              <Text style={styles.hashValue}>0x4f3a...8d2e</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16365D',
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
  },
  idCard: {
    backgroundColor: '#16365D',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    elevation: 4,
  },
  idHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  idLogo: {
    fontSize: 24,
    marginRight: 10,
  },
  idTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
  idBody: {
    gap: 12,
  },
  idRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#FFFFFF',
    opacity: 0.7,
  },
  value: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  statusActive: {
    color: '#4CAF50',
  },
  hashContainer: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  hashLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 5,
  },
  hashValue: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFD700',
  },
  button: {
    backgroundColor: '#16365D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
});
