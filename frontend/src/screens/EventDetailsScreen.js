import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import api, { API_BASE_URL } from '../config/api';
import { AuthContext } from '../context/AuthContext';
import { formatDate, getStatusColor } from '../utils/helpers';
import CustomButton from '../components/CustomButton';
import LoadingSpinner from '../components/LoadingSpinner';

const EventDetailsScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { user } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${eventId}`);
      setEvent(response.data.data);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch event details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  // Refresh when returning from Edit screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEventDetails();
    });
    return unsubscribe;
  }, [navigation, eventId]);

  if (loading || !event) {
    return <LoadingSpinner message="Loading event details..." />;
  }

  // Check if current logged-in user is the event creator
  const creatorId = String(event.createdBy?._id || event.createdBy || '');
  const currentUserId = String(user?._id || '');
  const isCreator = Boolean(creatorId && currentUserId && creatorId === currentUserId);

  const statusColors = getStatusColor(event.status);
  const isSoldOut = event.availableSeats <= 0;
  const isCancelled = event.status === 'Cancelled';
  const canBook = !isSoldOut && !isCancelled;

  const getImageSource = () => {
    if (event.imageUrl) return { uri: event.imageUrl };
    if (event.image) {
      if (event.image.startsWith('http')) return { uri: event.image };
      const hostUrl = API_BASE_URL.replace('/api', '');
      return { uri: `${hostUrl}/uploads/${event.image}` };
    }
    return { uri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600' };
  };

  const executeDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/events/${event._id}`);
      if (Platform.OS === 'web') {
        window.alert('Event deleted successfully');
      } else {
        Alert.alert('Success', 'Event deleted successfully');
      }
      navigation.goBack();
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Delete Failed: ' + (error.message || 'Could not delete event'));
      } else {
        Alert.alert('Delete Failed', error.message || 'Could not delete event');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Delete Event',
        'Are you sure you want to delete this event? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: executeDelete },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image source={getImageSource()} style={styles.image} resizeMode="cover" />
          
          <TouchableOpacity
            style={styles.floatingBackButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.floatingBackArrow}>←</Text>
            <Text style={styles.floatingBackText}>Back</Text>
          </TouchableOpacity>

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

        <View style={styles.body}>
          {/* Category Tag */}
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>🏷️ {event.category}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Date, Time & Location Cards */}
          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>📅</Text>
              <View>
                <Text style={styles.metaLabel}>Date & Time</Text>
                <Text style={styles.metaValue}>
                  {formatDate(event.date)} at {event.time}
                </Text>
              </View>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>📍</Text>
              <View style={styles.locationTextContainer}>
                <Text style={styles.metaLabel}>Location / Venue</Text>
                <Text style={styles.metaValue}>{event.location}</Text>
              </View>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>👤</Text>
              <View>
                <Text style={styles.metaLabel}>Organized by</Text>
                <Text style={styles.metaValue}>
                  {event.createdBy?.name || 'Event Organizer'}
                </Text>
              </View>
            </View>
          </View>

          {/* Availability Card */}
          <View style={styles.seatCard}>
            <View style={styles.seatHeader}>
              <Text style={styles.seatTitle}>Ticket Availability</Text>
              <Text
                style={[
                  styles.seatBadgeText,
                  isSoldOut ? styles.soldOutText : styles.availableText,
                ]}
              >
                {isSoldOut ? 'Sold Out' : `${event.availableSeats} Remaining`}
              </Text>
            </View>

            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(
                      100,
                      ((event.capacity - event.availableSeats) / event.capacity) * 100
                    )}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.seatSub}>
              {event.capacity - event.availableSeats} booked of {event.capacity} total capacity
            </Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>

          {/* Creator Management Actions */}
          {isCreator && (
            <View style={styles.creatorActions}>
              <Text style={styles.creatorActionsTitle}>Organizer Options</Text>
              <View style={styles.creatorButtonsRow}>
                <CustomButton
                  title="✏️ Edit Event"
                  variant="secondary"
                  onPress={() => navigation.navigate('EditEvent', { event })}
                  style={styles.creatorButton}
                />
                <CustomButton
                  title="🗑️ Delete Event"
                  variant="danger"
                  loading={deleting}
                  onPress={handleDelete}
                  style={styles.creatorButton}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Booking Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Seats Available</Text>
          <Text style={styles.priceValue}>{event.availableSeats} / {event.capacity}</Text>
        </View>

        <CustomButton
          title={isCancelled ? 'Event Cancelled' : isSoldOut ? 'Sold Out' : 'Book Tickets'}
          disabled={!canBook}
          variant={canBook ? 'primary' : 'secondary'}
          onPress={() => navigation.navigate('Booking', { event })}
          style={styles.bookButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#CBD5E1',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  floatingBackButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        cursor: 'pointer',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 6,
      },
    }),
  },
  floatingBackArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 6,
  },
  floatingBackText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  body: {
    padding: 20,
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    lineHeight: 30,
  },
  metaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  metaIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  metaLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 1,
  },
  locationTextContainer: {
    flex: 1,
  },
  metaDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  seatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  seatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seatTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  seatBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  availableText: {
    color: '#059669',
  },
  soldOutText: {
    color: '#DC2626',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  seatSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  creatorActions: {
    marginTop: 10,
    padding: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
  },
  creatorActionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },
  creatorButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  creatorButton: {
    flex: 1,
    paddingVertical: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 8,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  bookButton: {
    flex: 1.2,
    marginVertical: 0,
  },
});

export default EventDetailsScreen;
