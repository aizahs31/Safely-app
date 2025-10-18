import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import MapView, { Polyline, Marker, Polygon, Circle } from 'react-native-maps';

const PREVIOUS_TRIP_ROUTE = [
  { latitude: 15.4890, longitude: 73.8230 },
  { latitude: 15.4895, longitude: 73.8245 },
  { latitude: 15.4905, longitude: 73.8260 },
  { latitude: 15.4910, longitude: 73.8275 },
  { latitude: 15.4920, longitude: 73.8285 },
  { latitude: 15.4930, longitude: 73.8295 },
  { latitude: 15.4940, longitude: 73.8310 },
  { latitude: 15.4945, longitude: 73.8325 },
];

const TRIP_ALERTS = [
  {
    id: 1,
    type: 'warning',
    title: 'Entered Shady Area',
    time: '10:45 AM',
    location: 'Near Beach Road',
  },
  {
    id: 2,
    type: 'danger',
    title: 'Danger Zone Alert',
    time: '11:20 AM',
    location: 'Market District',
  },
  {
    id: 3,
    type: 'info',
    title: 'Safe Zone Entered',
    time: '12:15 PM',
    location: 'Tourist Center',
  },
];

const USER_REVIEWS = [
  {
    id: 1,
    type: 'Shady Area',
    comment: 'Reported suspicious activity near the old market',
    time: '10:50 AM',
    color: '#FFD700',
  },
  {
    id: 2,
    type: 'Safe',
    comment: 'Tourist area is well-lit and secure',
    time: '12:30 PM',
    color: '#4CAF50',
  },
];

const VISITED_PLACES = [
  { latitude: 15.4890, longitude: 73.8230, name: 'Start Point' },
  { latitude: 15.4920, longitude: 73.8285, name: 'Market District' },
  { latitude: 15.4945, longitude: 73.8325, name: 'Beach Road' },
];

const DANGER_ZONES = [
  {
    id: 1,
    type: 'Shady Area',
    color: '#FFD700',
    shape: 'polygon',
    coordinates: [
      { latitude: 15.4905, longitude: 73.8260 },
      { latitude: 15.4910, longitude: 73.8270 },
      { latitude: 15.4900, longitude: 73.8275 },
      { latitude: 15.4895, longitude: 73.8265 },
    ],
  },
  {
    id: 2,
    type: 'Danger Zone',
    color: '#FFA500',
    shape: 'circle',
    center: { latitude: 15.4930, longitude: 73.8295 },
    radius: 200,
  },
];

export default function TripHistoryScreen({ navigation }) {
  const startPoint = PREVIOUS_TRIP_ROUTE[0];
  const endPoint = PREVIOUS_TRIP_ROUTE[PREVIOUS_TRIP_ROUTE.length - 1];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Trip History</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 15.4920,
              longitude: 73.8280,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
          >
            <Polyline
              coordinates={PREVIOUS_TRIP_ROUTE}
              strokeColor="#16365D"
              strokeWidth={4}
            />

            <Marker
              coordinate={startPoint}
              pinColor="#4CAF50"
              title="Start"
            />
            <Marker
              coordinate={endPoint}
              pinColor="#FF3B30"
              title="End"
            />

            {VISITED_PLACES.map((place, index) => (
              <Marker
                key={index}
                coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                title={place.name}
              >
                <View style={styles.customMarker}>
                  <Text style={styles.markerText}>📍</Text>
                </View>
              </Marker>
            ))}

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
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4.2 km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>2h 15m</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{TRIP_ALERTS.length}</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Alerts</Text>
          {TRIP_ALERTS.map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertIcon}>
                <Text style={styles.alertEmoji}>
                  {alert.type === 'warning' ? '⚠️' : alert.type === 'danger' ? '🚨' : 'ℹ️'}
                </Text>
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertLocation}>{alert.location}</Text>
              </View>
              <Text style={styles.alertTime}>{alert.time}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Reviews & Reports</Text>
          {USER_REVIEWS.map((review) => (
            <View key={review.id} style={[styles.reviewCard, { borderLeftColor: review.color }]}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewType}>{review.type}</Text>
                <Text style={styles.reviewTime}>{review.time}</Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visited Locations</Text>
          {VISITED_PLACES.map((place, index) => (
            <View key={index} style={styles.locationCard}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationName}>{place.name}</Text>
            </View>
          ))}
        </View>
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
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#E5E5E5',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    fontSize: 28,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#16365D',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#999',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#16365D',
    marginBottom: 12,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  alertIcon: {
    marginRight: 12,
  },
  alertEmoji: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#16365D',
    marginBottom: 2,
  },
  alertLocation: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#999',
  },
  alertTime: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#999',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewType: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#16365D',
  },
  reviewTime: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#999',
  },
  reviewComment: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    lineHeight: 20,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  locationName: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#16365D',
  },
});
