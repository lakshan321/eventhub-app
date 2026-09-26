import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import api from '../config/api';
import { formatDate } from '../utils/helpers';
import CustomButton from '../components/CustomButton';
import ScreenHeader from '../components/ScreenHeader';

const BookingScreen = ({ route, navigation }) => {
  const { event } = route.params;

  const [tickets, setTickets] = useState(1);
  const [loading, setLoading] = useState(false);

  const availableSeats = event.availableSeats || 0;
  const maxSelectable = Math.min(10, availableSeats);

  const handleIncrement = () => {
    if (tickets < maxSelectable) {
      setTickets((prev) => prev + 1);
    } else {
      Alert.alert(
        'Seat Limit Reached',
        `You cannot book more than ${maxSelectable} ticket(s) for this order.`
      );
    }
  };

  const handleDecrement = () => {
    if (tickets > 1) {
      setTickets((prev) => prev - 1);
    }
  };

  const handleConfirmBooking = async () => {
    if (tickets <= 0) {
      Alert.alert('Error', 'Please select at least 1 ticket');
      return;
    }

    if (tickets > availableSeats) {
      Alert.alert('Unavailable', `Only ${availableSeats} seats are currently available.`);
      return;
    }

    setLoading(true);
    try {
      await api.post('/bookings', {
        eventId: event._id,
        numberOfTickets: tickets,
      });

      Alert.alert(
        'Booking Confirmed! 🎉',
        `Successfully booked ${tickets} ticket(s) for ${event.title}.`,
        [
          {
            text: 'View My Bookings',
            onPress: () => {
              // Navigate to MyBookings tab
              navigation.navigate('MainTabs', { screen: 'MyBookings' });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Booking Error', error.message || 'Could not complete booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScreenHeader
        title="Reserve Tickets"
        subtitle="Review event details and select your ticket quantity."
        navigation={navigation}
        style={styles.headerBox}
      />

      {/* Event Summary Card */}
      <View style={styles.eventCard}>
        <Text style={styles.eventCategory}>{event.category}</Text>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>📅 {formatDate(event.date)} at {event.time}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>📍 {event.location}</Text>
        </View>

        <View style={styles.availableBox}>
          <Text style={styles.availableLabel}>Currently Available:</Text>
          <Text style={styles.availableValue}>{availableSeats} Seat(s)</Text>
        </View>
      </View>

      {/* Ticket Counter Section */}
      <View style={styles.counterSection}>
        <Text style={styles.sectionTitle}>Select Quantity</Text>
        <Text style={styles.sectionSubtitle}>
          Choose how many seats you would like to reserve
        </Text>

        <View style={styles.counterRow}>
          <TouchableOpacity
            style={[styles.counterBtn, tickets <= 1 && styles.counterBtnDisabled]}
            onPress={handleDecrement}
            disabled={tickets <= 1}
          >
            <Text style={styles.counterBtnText}>−</Text>
          </TouchableOpacity>

          <View style={styles.ticketCountBox}>
            <Text style={styles.ticketCountText}>{tickets}</Text>
            <Text style={styles.ticketCountSub}>Tickets</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.counterBtn,
              tickets >= maxSelectable && styles.counterBtnDisabled,
            ]}
            onPress={handleIncrement}
            disabled={tickets >= maxSelectable}
          >
            <Text style={styles.counterBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Business Logic Preview */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Seat Calculation</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Available Before</Text>
          <Text style={styles.summaryValue}>{availableSeats}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Your Reservation</Text>
          <Text style={[styles.summaryValue, { color: '#DC2626' }]}>- {tickets}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Seats Remaining After</Text>
          <Text style={styles.totalValue}>{availableSeats - tickets}</Text>
        </View>
      </View>

      <CustomButton
        title={`Confirm Booking (${tickets} Ticket${tickets > 1 ? 's' : ''})`}
        loading={loading}
        onPress={handleConfirmBooking}
        disabled={availableSeats <= 0}
        style={styles.submitButton}
      />
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
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  screenSub: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  eventCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  metaRow: {
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
  },
  availableBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  availableLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4338CA',
  },
  availableValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3730A3',
  },
  counterSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 18,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  counterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  counterBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  counterBtnText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: -2,
  },
  ticketCountBox: {
    minWidth: 90,
    alignItems: 'center',
  },
  ticketCountText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0F172A',
  },
  ticketCountSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  submitButton: {
    marginBottom: 30,
  },
});

export default BookingScreen;
