import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { formatDate, getStatusColor } from '../utils/helpers';
import { API_BASE_URL } from '../config/api';

const CATEGORY_ICONS = {
  technology: '💻',
  music: '🎵',
  workshop: '🛠️',
  sports: '⚽',
  business: '💼',
};

const EventCard = ({ event, onPress }) => {
  const statusColors = getStatusColor(event.status);
  const isSoldOut = event.availableSeats === 0;

  // Resolve image URI
  const getImageSource = () => {
    if (event.imageUrl) return { uri: event.imageUrl };
    if (event.image) {
      if (event.image.startsWith('http')) return { uri: event.image };
      const hostUrl = API_BASE_URL.replace('/api', '');
      return { uri: `${hostUrl}/uploads/${event.image}` };
    }
    return { uri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600' };
  };

  const categoryIcon =
    CATEGORY_ICONS[event.category?.toLowerCase()] || '🏷️';

  const bookedPercent = Math.min(
    100,
    Math.round(((event.capacity - event.availableSeats) / event.capacity) * 100)
  );

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={() => onPress(event)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={getImageSource()}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Top Badges */}
        <View style={styles.topBadgesRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>{categoryIcon}</Text>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors.bg, borderColor: statusColors.border },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {event.status}
            </Text>
          </View>
        </View>

        {/* Bottom Banner Glass Overlay for Date */}
        <View style={styles.dateOverlay}>
          <Text style={styles.dateOverlayText}>
            📅 {formatDate(event.date)} • {event.time}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        {/* Seat Availability Bar */}
        <View style={styles.seatSection}>
          <View style={styles.seatInfoRow}>
            <Text style={styles.seatLabel}>
              {isSoldOut ? '🔴 SOLD OUT' : `🟢 ${event.availableSeats} seats available`}
            </Text>
            <Text style={styles.seatCapacity}>
              {bookedPercent}% booked
            </Text>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${bookedPercent}%` },
                isSoldOut && styles.progressBarSoldOut,
              ]}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.organizerText}>
            👤 {event.createdBy?.name || 'Organizer'}
          </Text>
          <View style={styles.detailsActionBadge}>
            <Text style={styles.detailsActionText}>Book Now →</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
    backgroundColor: '#0F172A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBadgesRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  dateOverlayText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 18,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  seatSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  seatInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  seatLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  seatCapacity: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  progressBarSoldOut: {
    backgroundColor: '#DC2626',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  organizerText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  detailsActionBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailsActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
});

export default EventCard;
