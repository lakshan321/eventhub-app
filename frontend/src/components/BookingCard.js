import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { formatDate, getStatusColor } from '../utils/helpers';
import { API_BASE_URL } from '../config/api';

const BookingCard = ({ booking, onCancel, onPress }) => {
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

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => onPress && onPress(booking)}
    >
      <View style={styles.topRow}>
        <Image source={getImageSource()} style={styles.image} resizeMode="cover" />
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            {event.title || 'Event Booking'}
          </Text>
          <Text style={styles.infoText}>📅 {formatDate(event.date)}</Text>
          <Text style={styles.infoText} numberOfLines={1}>
            📍 {event.location || 'Location TBA'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.ticketCount}>
            🎟️ {booking.numberOfTickets} Ticket{booking.numberOfTickets > 1 ? 's' : ''}
          </Text>
          <Text style={styles.bookedOn}>Booked: {formatDate(booking.bookingDate || booking.createdAt)}</Text>
        </View>

        <View style={styles.actions}>
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

          {canCancel && onCancel && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.cancelButton}
              onPress={() => onCancel(booking._id)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  topRow: {
    flexDirection: 'row',
  },
  image: {
    width: 75,
    height: 75,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  bookedOn: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  cancelText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default BookingCard;
