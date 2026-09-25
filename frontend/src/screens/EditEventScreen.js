import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api, { API_BASE_URL } from '../config/api';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const CATEGORIES = ['Technology', 'Music', 'Workshop', 'Sports', 'Business'];
const STATUSES = ['Active', 'Cancelled', 'Completed'];

const EditEventScreen = ({ route, navigation }) => {
  const { event } = route.params;

  const [title, setTitle] = useState(event.title || '');
  const [description, setDescription] = useState(event.description || '');
  const [category, setCategory] = useState(event.category || 'Technology');
  const [date, setDate] = useState(event.date || '');
  const [time, setTime] = useState(event.time || '');
  const [location, setLocation] = useState(event.location || '');
  const [capacity, setCapacity] = useState(String(event.capacity || ''));
  const [status, setStatus] = useState(event.status || 'Active');
  const [newImageUri, setNewImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Permission to access gallery is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const getCurrentImageUri = () => {
    if (newImageUri) return { uri: newImageUri };
    if (event.imageUrl) return { uri: event.imageUrl };
    if (event.image) {
      if (event.image.startsWith('http')) return { uri: event.image };
      const hostUrl = API_BASE_URL.replace('/api', '');
      return { uri: `${hostUrl}/uploads/${event.image}` };
    }
    return null;
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Event title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!date.trim()) newErrors.date = 'Date is required';
    if (!time.trim()) newErrors.time = 'Time is required';
    if (!location.trim()) newErrors.location = 'Location is required';

    const numCapacity = parseInt(capacity, 10);
    if (!capacity.trim() || isNaN(numCapacity) || numCapacity <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('date', date.trim());
      formData.append('time', time.trim());
      formData.append('location', location.trim());
      formData.append('capacity', capacity.trim());
      formData.append('status', status);

      if (newImageUri) {
        const filename = newImageUri.split('/').pop() || 'banner.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : `image/jpeg`;

        if (Platform.OS === 'web') {
          const response = await fetch(newImageUri);
          const blob = await response.blob();
          formData.append('image', blob, filename);
        } else {
          formData.append('image', {
            uri: newImageUri,
            name: filename,
            type: fileType,
          });
        }
      }

      await api.put(`/events/${event._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (Platform.OS === 'web') {
        window.alert('Event updated successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Success', 'Event updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Update Failed: ' + (error.message || 'Could not update event'));
      } else {
        Alert.alert('Update Failed', error.message || 'Could not update event');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>Edit Event</Text>
        <Text style={styles.screenSub}>Modify event specifications and status.</Text>

        {/* Banner Preview and change */}
        <TouchableOpacity style={styles.imageBox} onPress={pickImage} activeOpacity={0.8}>
          {getCurrentImageUri() ? (
            <Image source={getCurrentImageUri()} style={styles.bannerImage} />
          ) : (
            <Text>No Image</Text>
          )}
          <View style={styles.changeBannerOverlay}>
            <Text style={styles.changeBannerText}>📷 Tap to Change Banner</Text>
          </View>
        </TouchableOpacity>

        {/* Status Selector */}
        <Text style={styles.fieldLabel}>Event Status</Text>
        <View style={styles.statusRow}>
          {STATUSES.map((st) => (
            <TouchableOpacity
              key={st}
              onPress={() => setStatus(st)}
              style={[
                styles.statusChip,
                status === st && styles.statusChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.statusChipText,
                  status === st && styles.statusChipTextSelected,
                ]}
              >
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomInput
          label="Event Title *"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
        />

        {/* Category Selector */}
        <Text style={styles.fieldLabel}>Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.categoryChip,
                category === cat && styles.categoryChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat && styles.categoryChipTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <CustomInput
              label="Date *"
              value={date}
              onChangeText={setDate}
              error={errors.date}
            />
          </View>
          <View style={styles.halfField}>
            <CustomInput
              label="Time *"
              value={time}
              onChangeText={setTime}
              error={errors.time}
            />
          </View>
        </View>

        <CustomInput
          label="Location / Venue *"
          value={location}
          onChangeText={setLocation}
          error={errors.location}
        />

        <CustomInput
          label="Capacity *"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="numeric"
          error={errors.capacity}
        />

        <CustomInput
          label="Description *"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          error={errors.description}
        />

        <CustomButton
          title="Save Changes"
          loading={loading}
          onPress={handleUpdate}
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
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
  imageBox: {
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  changeBannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  changeBannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusChipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  statusChipTextSelected: {
    color: '#FFFFFF',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  submitButton: {
    marginTop: 16,
  },
});

export default EditEventScreen;
