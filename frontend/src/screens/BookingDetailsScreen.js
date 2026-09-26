import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import api, { API_BASE_URL } from '../config/api';
import { formatDate, getStatusColor } from '../utils/helpers';
import CustomButton from '../components/CustomButton';
import LoadingSpinner from '../components/LoadingSpinner';
import ScreenHeader from '../components/ScreenHeader';

const BookingDetailsScreen = ({ route, navigation }) => {
  const { bookingId } = route.params;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data.data);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load booking details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  if (loading || !booking) {
    return <LoadingSpinner message="Loading ticket details..." />;
  }

  const event = booking.eventId || {};
  const statusColors = getStatusColor(booking.status);
  const canCancel = booking.status === 'Confirmed';

  const getImageSource = () => {
    if (event.imageUrl) return { uri: event.imageUrl };
    if (event.image) {
      if (event.image.startsWith('http')) return { uri: event.image };
      const hostUrl = API_BASE_URL.replace('/api', '');
      return { uri: `${hostUrl}/uploads/${event.image}` };
    }
    return { uri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600' };
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? The seats will be made available to other attendees.',
      [
        { text: 'Keep Ticket', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              await api.put(`/bookings/${booking._id}`, { status: 'Cancelled' });
              Alert.alert('Success', 'Booking cancelled successfully');
              fetchBooking();
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader
        title="Digital Ticket Pass"
        subtitle="Digital booking confirmation & event entry pass."
        navigation={navigation}
        style={styles.headerBox}
      />
      {/* Digital Ticket Pass Card */}
      <View style={styles.ticketCard}>
        {/* Ticket Header Image */}
        <View style={styles.imageContainer}>
          <Image source={getImageSource()} style={styles.image} resizeMode="cover" />
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors.bg, borderColor: statusColors.border },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {booking.status}
            </Text>
          </View>
        </View>

        {/* Ticket Content */}
        <View style={styles.ticketBody}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.categoryText}>🏷️ {event.category}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>📅</Text>
            <View>
              <Text style={styles.metaLabel}>Date & Time</Text>
              <Text style={styles.metaValue}>
                {formatDate(event.date)} at {event.time}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.metaLabel}>Venue</Text>
              <Text style={styles.metaValue}>{event.location}</Text>
            </View>
          </View>

          {/* Perforated Divider */}
          <View style={styles.perforation}>
            <View style={styles.notchLeft} />
            <View style={styles.dottedLine} />
            <View style={styles.notchRight} />
          </View>

          {/* Ticket Information Barcode / ID Area */}
          <View style={styles.ticketInfoGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Attendee</Text>
              <Text style={styles.gridValue}>{booking.userId?.name || 'You'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Quantity</Text>
              <Text style={[styles.gridValue, { color: '#4F46E5', fontWeight: '800' }]}>
                {booking.numberOfTickets} Ticket{booking.numberOfTickets > 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          <View style={styles.ticketInfoGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Booking Reference</Text>
              <Text style={styles.refCode}>#{booking._id.slice(-8).toUpperCase()}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Booked On</Text>
              <Text style={styles.gridValue}>
                {formatDate(booking.bookingDate || booking.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Cancel Option */}
      {canCancel && (
        <CustomButton
          title="Cancel This Reservation"
          variant="danger"
          loading={cancelling}
          onPress={handleCancelBooking}
          style={styles.cancelButton}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
  },
  headerBox: {
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ticketBody: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  metaLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  perforation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    marginHorizontal: -20,
  },
  notchLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    marginLeft: -10,
  },
  dottedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  notchRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    marginRight: -10,
  },
  ticketInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  refCode: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 1,
  },
  cancelButton: {
    marginBottom: 30,
  },
});

export default BookingDetailsScreen;
