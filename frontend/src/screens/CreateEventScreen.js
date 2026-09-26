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
import api from '../config/api';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import CalendarModalPicker from '../components/CalendarModalPicker';

const CATEGORIES = ['Technology', 'Music', 'Workshop', 'Sports', 'Business'];

const CreateEventScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Launch device image picker
  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera roll permissions are required to upload an event banner.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        if (errors.image) setErrors((prev) => ({ ...prev, image: null }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Event title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!date.trim()) newErrors.date = 'Date is required (e.g. 2026-10-25)';
    if (!time.trim()) newErrors.time = 'Time is required (e.g. 10:00 AM)';
    if (!location.trim()) newErrors.location = 'Location/Venue is required';

    const numCapacity = parseInt(capacity, 10);
    if (!capacity.trim() || isNaN(numCapacity) || numCapacity <= 0) {
      newErrors.capacity = 'Capacity must be a positive number greater than 0';
    }

    if (!imageUri) {
      newErrors.image = 'An event image/banner is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Build multipart/form-data payload
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('date', date.trim());
      formData.append('time', time.trim());
      formData.append('location', location.trim());
      formData.append('capacity', capacity.trim());

      // Prepare image file for upload
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const extension = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
        formData.append('image', blob, `banner.${extension}`);
      } else {
        const filename = imageUri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('image', {
          uri: imageUri,
          name: filename.includes('.') ? filename : `${filename}.jpg`,
          type: fileType,
        });
      }

      await api.post('/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (Platform.OS === 'web') {
        window.alert('Event created successfully!');
        navigation.navigate('Home');
      } else {
        Alert.alert('Success', 'Event created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ]);
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Creation Failed: ' + (error.message || 'Could not create event'));
      } else {
        Alert.alert('Creation Failed', error.message || 'Could not create event');
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
        <Text style={styles.screenTitle}>Create New Event</Text>
        <Text style={styles.screenSub}>
          Fill in the details below to publish your event.
        </Text>

        {/* Image Picker Box */}
        <TouchableOpacity
          style={[styles.imagePickerBox, errors.image && styles.imagePickerError]}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageIcon}>📷</Text>
              <Text style={styles.imagePrompt}>Tap to select Event Banner</Text>
              <Text style={styles.imageSub}>JPEG, PNG, or WEBP (Max 5MB)</Text>
            </View>
          )}
        </TouchableOpacity>
        {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}

        {/* Form Fields */}
        <CustomInput
          label="Event Title *"
          placeholder="e.g. SLIIT Tech Symposium 2026"
          value={title}
          onChangeText={(val) => {
            setTitle(val);
            if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
          }}
          error={errors.title}
        />

        {/* Category Pill Selector */}
        <Text style={styles.fieldLabel}>Category *</Text>
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
            <Text style={styles.fieldLabel}>Date *</Text>
            <TouchableOpacity
              style={[styles.datePickerBtn, errors.date && styles.inputErrorBorder]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.datePickerIcon}>📅</Text>
              <Text style={[styles.datePickerText, !date && styles.datePickerPlaceholder]}>
                {date || 'Select Date'}
              </Text>
            </TouchableOpacity>
            {errors.date && <Text style={styles.errorTextSmall}>{errors.date}</Text>}
          </View>
          <View style={styles.halfField}>
            <CustomInput
              label="Time *"
              placeholder="e.g. 10:00 AM"
              value={time}
              onChangeText={(val) => {
                setTime(val);
                if (errors.time) setErrors((prev) => ({ ...prev, time: null }));
              }}
              error={errors.time}
            />
          </View>
        </View>

        {/* Quick Time Selector Chips */}
        <View style={styles.quickTimeRow}>
          <Text style={styles.quickTimeLabel}>Quick Time:</Text>
          {['09:00 AM', '11:00 AM', '02:00 PM', '06:30 PM'].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => {
                setTime(t);
                if (errors.time) setErrors((prev) => ({ ...prev, time: null }));
              }}
              style={[
                styles.quickTimeChip,
                time === t && styles.quickTimeChipActive,
              ]}
            >
              <Text
                style={[
                  styles.quickTimeChipText,
                  time === t && styles.quickTimeChipTextActive,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calendar Modal Picker */}
        <CalendarModalPicker
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelectDate={(pickedDate) => {
            setDate(pickedDate);
            if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
          }}
          selectedDate={date}
        />

        <CustomInput
          label="Location / Venue *"
          placeholder="e.g. Main Auditorium, SLIIT Campus"
          value={location}
          onChangeText={(val) => {
            setLocation(val);
            if (errors.location)
              setErrors((prev) => ({ ...prev, location: null }));
          }}
          error={errors.location}
        />

        <CustomInput
          label="Total Seat Capacity *"
          placeholder="e.g. 150"
          value={capacity}
          onChangeText={(val) => {
            setCapacity(val);
            if (errors.capacity)
              setErrors((prev) => ({ ...prev, capacity: null }));
          }}
          keyboardType="numeric"
          error={errors.capacity}
        />

        <CustomInput
          label="Event Description *"
          placeholder="Describe your event agenda, speakers, guidelines..."
          value={description}
          onChangeText={(val) => {
            setDescription(val);
            if (errors.description)
              setErrors((prev) => ({ ...prev, description: null }));
          }}
          multiline
          numberOfLines={4}
          error={errors.description}
        />

        <CustomButton
          title="Publish Event"
          loading={loading}
          onPress={handleCreate}
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
  imagePickerBox: {
    height: 180,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  imagePickerError: {
    borderColor: '#EF4444',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    padding: 16,
  },
  imageIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  imagePrompt: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  imageSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 2,
  },
  errorTextSmall: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  datePickerBtn: {
    height: 48,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  inputErrorBorder: {
    borderColor: '#EF4444',
  },
  datePickerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  datePickerText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  datePickerPlaceholder: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  quickTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  quickTimeLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginRight: 4,
  },
  quickTimeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  quickTimeChipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  quickTimeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  quickTimeChipTextActive: {
    color: '#FFFFFF',
  },
});

export default CreateEventScreen;
