import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { formatDate, getStatusColor } from '../utils/helpers';
import { API_BASE_URL } from '../config/api';

const EventCard = ({ event, onPress }) => {
  const statusColors = getStatusColor(event.status);
  const isSoldOut = event.availableSeats === 0;

  // Resolve image URI
  const getImageSource = () => {
    if (event.imageUrl) return { uri: event.imageUrl };
    if (event.image) {
      if (event.image.startsWith('http')) return { uri: event.image };
      // Fallback base host from API_BASE_URL
      const hostUrl = API_BASE_URL.replace('/api', '');
      return { uri: `${hostUrl}/uploads/${event.image}` };
    }
    return { uri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600' };
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => onPress(event)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={getImageSource()}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.categoryBadge}>
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

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>

        <View style={styles.row}>
          <Text style={styles.icon}>📅</Text>
          <Text style={styles.infoText}>{formatDate(event.date)} at {event.time}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.infoText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        <View style={styles.footer}>
          <View
            style={[
              styles.seatBadge,
              isSoldOut ? styles.soldOutBadge : styles.availableBadge,
            ]}
          >
            <Text
              style={[
                styles.seatText,
                isSoldOut ? styles.soldOutText : styles.availableText,
              ]}
            >
              {isSoldOut
                ? 'Sold Out'
                : `${event.availableSeats} of ${event.capacity} seats left`}
            </Text>
          </View>

          <Text style={styles.detailsAction}>View Details →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    width: '100%',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  seatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availableBadge: {
    backgroundColor: '#ECFDF5',
  },
  soldOutBadge: {
    backgroundColor: '#FEF2F2',
  },
  seatText: {
    fontSize: 12,
    fontWeight: '600',
  },
  availableText: {
    color: '#059669',
  },
  soldOutText: {
    color: '#DC2626',
  },
  detailsAction: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
  },
});

export default EventCard;
