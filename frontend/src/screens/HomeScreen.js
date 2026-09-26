import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import CalendarStrip from '../components/CalendarStrip';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const CATEGORIES = [
  { id: 'All', label: 'All', icon: '🌟' },
  { id: 'Technology', label: 'Tech', icon: '💻' },
  { id: 'Music', label: 'Music', icon: '🎵' },
  { id: 'Workshop', label: 'Workshop', icon: '🛠️' },
  { id: 'Sports', label: 'Sports', icon: '⚽' },
  { id: 'Business', label: 'Business', icon: '💼' },
];

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setErrorMessage(null);
      const response = await api.get('/events');
      setEvents(response.data.data || []);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Re-fetch when focusing screen (e.g. after creating, editing, or deleting an event)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEvents();
    });
    return unsubscribe;
  }, [navigation, fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  // Extract all event dates for the calendar dots indicator
  const eventDates = useMemo(() => {
    return events.map((e) => e.date).filter(Boolean);
  }, [events]);

  // Filter events by: Category, Search query, and Calendar Date
  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      event.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate =
      !selectedCalendarDate || event.date === selectedCalendarDate;

    return matchesCategory && matchesSearch && matchesDate;
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Hero Welcome Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Text style={styles.greetingSub}>
            Welcome back, {user?.name?.split(' ')[0] || 'Guest'} 👋
          </Text>
          <Text style={styles.heroTitle}>Discover & Book Top Events</Text>
          <Text style={styles.heroDescription}>
            Find tech conferences, concerts, workshops, and campus meetups.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateEvent')}
          activeOpacity={0.85}
        >
          <Text style={styles.createButtonText}>+ Create Event</Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Horizontal Calendar Strip */}
      <CalendarStrip
        selectedDate={selectedCalendarDate}
        onSelectDate={setSelectedCalendarDate}
        eventDates={eventDates}
      />

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search by event title, venue, or keyword..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => {
          const isSelected = selectedCategory === item.id;
          return (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item.id)}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipSelected,
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Active Filter Notice */}
      {selectedCalendarDate && (
        <View style={styles.dateFilterNotice}>
          <Text style={styles.dateFilterText}>
            Showing events on 📅 <Text style={{ fontWeight: '800' }}>{selectedCalendarDate}</Text>
          </Text>
          <TouchableOpacity onPress={() => setSelectedCalendarDate(null)}>
            <Text style={styles.dateFilterClear}>✕ Reset</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Loading events..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
          />
        }
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={(event) =>
              navigation.navigate('EventDetails', { eventId: event._id })
            }
          />
        )}
        ListEmptyComponent={
          errorMessage ? (
            <EmptyState
              title="Connection Error"
              message={errorMessage}
              buttonTitle="Try Again"
              onButtonPress={fetchEvents}
            />
          ) : (
            <EmptyState
              title="No Events Found"
              message={
                selectedCalendarDate
                  ? `No events scheduled for ${selectedCalendarDate}. Try another date or category!`
                  : searchQuery
                  ? `No events matching "${searchQuery}"`
                  : 'Be the first to publish an amazing event!'
              }
              buttonTitle="+ Create Event"
              onButtonPress={() => navigation.navigate('CreateEvent')}
            />
          )
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
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerContainer: {
    paddingTop: 12,
    marginBottom: 8,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroContent: {
    marginBottom: 14,
  },
  greetingSub: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  createButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },
  clearIcon: {
    fontSize: 14,
    color: '#94A3B8',
    paddingHorizontal: 6,
  },
  categoryList: {
    paddingVertical: 4,
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryChipSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  categoryIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  dateFilterNotice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  dateFilterText: {
    fontSize: 13,
    color: '#4338CA',
  },
  dateFilterClear: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
});

export default HomeScreen;
