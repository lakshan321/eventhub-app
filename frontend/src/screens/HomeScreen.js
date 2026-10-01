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
  Image,
} from 'react-native';
import api from '../config/api';
import { AuthContext } from '../context/AuthContext';
import EventCard from '../components/EventCard';
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

  // Filter events by: Category and Search query
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
      {/* Top Header Bar */}
      <View style={styles.topBrandBar}>
        <View style={styles.brandTitleRow}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.brandLogoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>Event<Text style={{ color: '#4F46E5' }}>Hub</Text></Text>
        </View>

        <View style={styles.topActionsRow}>
          <TouchableOpacity
            style={styles.createButtonHeader}
            onPress={() => navigation.navigate('CreateEvent')}
            activeOpacity={0.85}
          >
            <Text style={styles.createButtonHeaderText}>+ Create Event</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.avatarButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarButtonText}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
                  : selectedCategory !== 'All'
                  ? `No events found in "${selectedCategory}" category.`
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
  topBrandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoImage: {
    width: 34,
    height: 34,
    borderRadius: 9,
    marginRight: 9,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createButtonHeader: {
    backgroundColor: '#4F46E5',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginRight: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonHeaderText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
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
});

export default HomeScreen;
