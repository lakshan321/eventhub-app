import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import api from '../config/api';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const MyBookingsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Refresh whenever screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBookings();
    });
    return unsubscribe;
  }, [navigation, fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const executeCancel = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}`, { status: 'Cancelled' });
      if (Platform.OS === 'web') {
        window.alert('Your booking has been cancelled and seats restored.');
      } else {
        Alert.alert('Success', 'Your booking has been cancelled and seats restored.');
      }
      fetchBookings();
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Cancellation Failed: ' + error.message);
      } else {
        Alert.alert('Cancellation Failed', error.message);
      }
    }
  };

  const handleCancelBooking = (bookingId) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to cancel this booking? The reserved seats will be returned to the event.')) {
        executeCancel(bookingId);
      }
    } else {
      Alert.alert(
        'Cancel Booking',
        'Are you sure you want to cancel this booking? The reserved seats will be returned to the event.',
        [
          { text: 'Keep Booking', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: () => executeCancel(bookingId),
          },
        ]
      );
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your bookings..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.screenTitle}>My Bookings</Text>
            <Text style={styles.screenSub}>
              View and manage your active and past event reservations.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onCancel={handleCancelBooking}
            onPress={(booking) =>
              navigation.navigate('BookingDetails', { bookingId: booking._id })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Bookings Yet"
            message="You haven't reserved any event tickets yet. Explore upcoming events!"
            buttonTitle="Explore Events"
            onButtonPress={() => navigation.navigate('Home')}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 16,
    paddingTop: 8,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  screenSub: {
    fontSize: 14,
    color: '#64748B',
  },
});

export default MyBookingsScreen;
