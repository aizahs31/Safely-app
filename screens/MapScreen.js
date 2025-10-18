import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Modal, Alert, Animated, Linking, Platform } from 'react-native';
import MapView, { Marker, Polygon, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { AuthContext } from '../App';

const DANGER_ZONES = [
  {
    id: 1,
    type: 'Restricted Zone',
    color: '#FF3B30',
    shape: 'polygon',
    coordinates: [
      { latitude: 15.4909, longitude: 73.8278 },
      { latitude: 15.4915, longitude: 73.8290 },
      { latitude: 15.4905, longitude: 73.8295 },
      { latitude: 15.4900, longitude: 73.8283 },
    ],
    center: { latitude: 15.4907, longitude: 73.8287 },
  },
  {
    id: 2,
    type: 'Danger Zone',
    color: '#FFA500',
    shape: 'circle',
    center: { latitude: 15.4950, longitude: 73.8200 },
    radius: 300,
  },
  {
    id: 3,
    type: 'Shady Area',
    color: '#FFD700',
    shape: 'polygon',
    coordinates: [
      { latitude: 15.4870, longitude: 73.8300 },
      { latitude: 15.4875, longitude: 73.8315 },
      { latitude: 15.4865, longitude: 73.8320 },
      { latitude: 15.4860, longitude: 73.8305 },
    ],
    center: { latitude: 15.4868, longitude: 73.8310 },
  },
  {
    id: 4,
    type: 'Accident Zone',
    color: '#A020F0',
    shape: 'circle',
    center: { latitude: 15.4925, longitude: 73.8255 },
    radius: 250,
  },
  {
    id: 5,
    type: 'Restricted Zone',
    color: '#FF3B30',
    shape: 'circle',
    center: { latitude: 15.4880, longitude: 73.8240 },
    radius: 200,
  },
  {
    id: 6,
    type: 'Shady Area',
    color: '#FFD700',
    shape: 'circle',
    center: { latitude: 15.4940, longitude: 73.8320 },
    radius: 180,
  },
  {
    id: 7,
    type: 'Danger Zone',
    color: '#FFA500',
    shape: 'polygon',
    coordinates: [
      { latitude: 15.4890, longitude: 73.8350 },
      { latitude: 15.4895, longitude: 73.8365 },
      { latitude: 15.4885, longitude: 73.8370 },
      { latitude: 15.4880, longitude: 73.8355 },
    ],
    center: { latitude: 15.4888, longitude: 73.8360 },
  },
];

// Add a sensible fallback region so map can render if permission is denied
const DEFAULT_REGION = {
  latitude: 15.4920,
  longitude: 73.8280,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function MapScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [location, setLocation] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('unknown'); // 'unknown' | 'granted' | 'denied'
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [sosClicks, setSosClicks] = useState(0);
  const [showSosPopup, setShowSosPopup] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showZoneAlert, setShowZoneAlert] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);
  const sosTimeoutRef = useRef(null);
  const popupScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getLocation();
    const locationInterval = setInterval(checkGeofence, 3000);
    return () => clearInterval(locationInterval);
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionStatus('granted');
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        // Permission denied: set fallback region and show modal to guide user
        setPermissionStatus('denied');
        setLocation(DEFAULT_REGION);
        setShowPermissionModal(true);
        // do not show Alert which can block flow; modal gives user control
      }
    } catch (err) {
      // On any error, fallback gracefully
      console.log('Error getting location:', err);
      setPermissionStatus('denied');
      setLocation(DEFAULT_REGION);
      setShowPermissionModal(true);
    }
  };

  const isPointInCircle = (point, center, radius) => {
    const R = 6371e3;
    const φ1 = point.latitude * Math.PI / 180;
    const φ2 = center.latitude * Math.PI / 180;
    const Δφ = (center.latitude - point.latitude) * Math.PI / 180;
    const Δλ = (center.longitude - point.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= radius;
  };

  const isPointInPolygon = (point, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].latitude, yi = polygon[i].longitude;
      const xj = polygon[j].latitude, yj = polygon[j].longitude;
      
      const intersect = ((yi > point.longitude) !== (yj > point.longitude))
        && (point.latitude < (xj - xi) * (point.longitude - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const checkGeofence = async () => {
    // Only attempt geofence checks when permission is granted and we have a real location
    if (permissionStatus !== 'granted' || !location) return;

    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      const userPoint = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation({
        ...location,
        latitude: userPoint.latitude,
        longitude: userPoint.longitude,
      });

      for (const zone of DANGER_ZONES) {
        let isInside = false;

        if (zone.shape === 'circle') {
          isInside = isPointInCircle(userPoint, zone.center, zone.radius);
        } else if (zone.shape === 'polygon') {
          isInside = isPointInPolygon(userPoint, zone.coordinates);
        }

        if (isInside && (zone.type === 'Restricted Zone' || zone.type === 'Danger Zone' || zone.type === 'Shady Area')) {
          setCurrentZone(zone);
          setShowZoneAlert(true);
          break;
        }
      }
    } catch (err) {
      // If permission revoked while running or another error occurs, stop attempting live location updates
      console.log('Geofence check failed:', err);
      return;
    }
  };

  const handleSosPress = () => {
    const newClicks = sosClicks + 1;
    setSosClicks(newClicks);

    if (sosTimeoutRef.current) {
      clearTimeout(sosTimeoutRef.current);
    }

    if (newClicks === 3) {
      Alert.alert(
        'SOS Alert Sent!',
        'Emergency services have been notified. Your location has been shared with emergency contacts.',
        [{ text: 'OK', onPress: () => setSosClicks(0) }]
      );
      setShowSosPopup(false);
    } else {
      setShowSosPopup(true);
      animatePopup();

      sosTimeoutRef.current = setTimeout(() => {
        setSosClicks(0);
        setShowSosPopup(false);
      }, 3000);
    }
  };

  const animatePopup = () => {
    popupScale.setValue(0);
    Animated.spring(popupScale, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleReport = (reportType) => {
    setShowReportModal(false);
    Alert.alert(
      'Report Submitted',
      `Thank you for reporting this ${reportType}. Your contribution helps keep other travelers safe.`
    );
  };

  const handleZoneConfirmation = (isStillDangerous) => {
    setShowZoneAlert(false);
    if (isStillDangerous !== null) {
      Alert.alert(
        'Thank You',
        'Your feedback has been recorded and will help other travelers.'
      );
    }
  };

  if (!location && permissionStatus === 'unknown') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.topHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'J'}</Text>
          </View>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'John Doe'}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.profileIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        region={location || DEFAULT_REGION}
        showsUserLocation={permissionStatus === 'granted'}
        showsMyLocationButton={false}
      >
        {DANGER_ZONES.map((zone) => {
          if (zone.shape === 'polygon') {
            return (
              <Polygon
                key={zone.id}
                coordinates={zone.coordinates}
                fillColor={`${zone.color}40`}
                strokeColor={zone.color}
                strokeWidth={2}
              />
            );
          } else if (zone.shape === 'circle') {
            return (
              <Circle
                key={zone.id}
                center={zone.center}
                radius={zone.radius}
                fillColor={`${zone.color}40`}
                strokeColor={zone.color}
                strokeWidth={2}
              />
            );
          }
        })}
      </MapView>

      {/* Permission Modal shown when permission denied */}
      <Modal
        visible={showPermissionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.alertModal, { alignItems: 'flex-start' }]}>
            <Text style={styles.alertTitle}>Location Permission Needed</Text>
            <Text style={[styles.alertMessage, { textAlign: 'left' }]}>
              Safely needs access to your location for live monitoring. You can open app settings to enable location or continue using the map without live tracking.
            </Text>

            <View style={{ flexDirection: 'row', width: '100%', marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.alertButton, { flex: 1, marginRight: 8, backgroundColor: '#16365D' }]}
                onPress={() => {
                  // Open app settings
                  setShowPermissionModal(false);
                  if (Platform.OS === 'ios' || Platform.OS === 'android') {
                    Linking.openSettings();
                  } else {
                    Alert.alert('Open Settings', 'Please enable location permissions for this app in your system settings.');
                  }
                }}
              >
                <Text style={styles.alertButtonText}>Open Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.alertButton, { flex: 1, marginLeft: 8, backgroundColor: '#999' }]}
                onPress={() => {
                  // Continue without live location
                  setShowPermissionModal(false);
                }}
              >
                <Text style={styles.alertButtonText}>Continue without Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showSosPopup && (
        <Animated.View 
          style={[
            styles.sosPinPopup,
            { transform: [{ scale: popupScale }] }
          ]}
        >
          <Text style={styles.sosPinText}>
            Click {3 - sosClicks} more {3 - sosClicks === 1 ? 'time' : 'times'}
          </Text>
        </Animated.View>
      )}

      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.controlIcon}>⚙️</Text>
          <Text style={styles.controlLabel}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => Alert.alert('Location Sharing', 'Location sharing feature coming soon!')}
        >
          <Text style={styles.controlIcon}>📍</Text>
          <Text style={styles.controlLabel}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.sosButton}
          onPress={handleSosPress}
        >
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => setShowReportModal(true)}
        >
          <Text style={styles.controlIcon}>📝</Text>
          <Text style={styles.controlLabel}>Report</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => navigation.navigate('Alerts')}
        >
          <Text style={styles.controlIcon}>🔔</Text>
          <Text style={styles.controlLabel}>Alerts</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reportModal}>
            <Text style={styles.modalTitle}>Report Area Status</Text>
            <Text style={styles.modalSubtitle}>Help keep travelers safe</Text>

            <TouchableOpacity 
              style={[styles.reportOption, { borderLeftColor: '#FFD700' }]}
              onPress={() => handleReport('Shady Area')}
            >
              <Text style={styles.reportEmoji}>⚠️</Text>
              <Text style={styles.reportText}>Shady Area</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.reportOption, { borderLeftColor: '#FFA500' }]}
              onPress={() => handleReport('Dangerous Zone')}
            >
              <Text style={styles.reportEmoji}>🚨</Text>
              <Text style={styles.reportText}>Dangerous Zone</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.reportOption, { borderLeftColor: '#A020F0' }]}
              onPress={() => handleReport('Accident')}
            >
              <Text style={styles.reportEmoji}>🚑</Text>
              <Text style={styles.reportText}>Accident Occurred</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.reportOption, { borderLeftColor: '#FF3B30' }]}
              onPress={() => handleReport('Restricted Area')}
            >
              <Text style={styles.reportEmoji}>🚫</Text>
              <Text style={styles.reportText}>Restricted Area</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowReportModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showZoneAlert}
        transparent={true}
        animationType="fade"
        onRequestClose={() => handleZoneConfirmation(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertModal}>
            <Text style={styles.alertEmoji}>⚠️</Text>
            <Text style={styles.alertTitle}>Zone Alert</Text>
            <Text style={styles.alertMessage}>
              You've entered a {currentZone?.type}. Is this area still {currentZone?.type.toLowerCase()}?
            </Text>

            <View style={styles.alertButtons}>
              <TouchableOpacity 
                style={[styles.alertButton, styles.yesButton]}
                onPress={() => handleZoneConfirmation(true)}
              >
                <Text style={styles.alertButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.alertButton, styles.noButton]}
                onPress={() => handleZoneConfirmation(false)}
              >
                <Text style={styles.alertButtonText}>No</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => handleZoneConfirmation(null)}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#16365D',
  },
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#16365D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#16365D',
  },
  profileButton: {
    padding: 8,
  },
  profileIcon: {
    fontSize: 24,
  },
  map: {
    flex: 1,
  },
  sosPinPopup: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  sosPinText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  controlIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  controlLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#16365D',
  },
  sosButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginTop: -30,
  },
  sosText: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  reportModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#16365D',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginBottom: 25,
  },
  reportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  reportEmoji: {
    fontSize: 28,
    marginRight: 15,
  },
  reportText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#16365D',
  },
  cancelButton: {
    backgroundColor: '#E5E5E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#666',
  },
  alertModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    margin: 30,
    alignItems: 'center',
  },
  alertEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  alertTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#16365D',
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  alertButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: '#FF3B30',
  },
  noButton: {
    backgroundColor: '#4CAF50',
  },
  alertButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#999',
  },
});
