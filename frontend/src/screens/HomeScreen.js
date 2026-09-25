import React, { useState, useEffect, useContext, useCallback } from 'react';
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
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['All', 'Technology', 'Music', 'Workshop', 'Sports', 'Business'];

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
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

  // Re-fetch when focusing screen (e.g. after creating or editing an event)
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

  // Filter events by category and search text
  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      event.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.greetingRow}>
        <View>
          <Text style={styles.greetingSub}>Hello, {user?.name?.split(' ')[0] || 'Guest'} 👋</Text>
          <Text style={styles.greetingTitle}>Discover Events</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateEvent')}
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>+ Create Event</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search by event title or location..."
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

      {/* Category Horizontal Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => {
          const isSelected = selectedCategory === item;
          return (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item)}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipSelected,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextSelected,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
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
                searchQuery
                  ? `No events matching "${searchQuery}"`
                  : 'Be the first to create an amazing event!'
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
    paddingTop: 16,
    marginBottom: 16,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingSub: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  createButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
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
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    height: 46,
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
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
});

export default HomeScreen;
