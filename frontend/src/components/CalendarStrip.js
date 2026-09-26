import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const CalendarStrip = ({ selectedDate, onSelectDate, eventDates = [] }) => {
  // Generate next 14 days starting from today
  const dates = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const isoString = `${year}-${month}-${day}`;

      list.push({
        fullDate: isoString,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0,
      });
    }
    return list;
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Text style={styles.calendarIcon}>🗓️</Text>
          <Text style={styles.title}>Event Calendar</Text>
        </View>

        {selectedDate && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => onSelectDate(null)}
            activeOpacity={0.7}
          >
            <Text style={styles.clearBtnText}>Show All Dates</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {/* "All" button */}
        <TouchableOpacity
          style={[
            styles.dateBox,
            !selectedDate && styles.dateBoxSelected,
          ]}
          onPress={() => onSelectDate(null)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dayName,
              !selectedDate && styles.dayNameSelected,
            ]}
          >
            ALL
          </Text>
          <Text
            style={[
              styles.dayNum,
              !selectedDate && styles.dayNumSelected,
              { fontSize: 13, marginTop: 4 },
            ]}
          >
            Events
          </Text>
        </TouchableOpacity>

        {/* 14 days */}
        {dates.map((item) => {
          const isSelected = selectedDate === item.fullDate;
          const hasEvents = eventDates.includes(item.fullDate);

          return (
            <TouchableOpacity
              key={item.fullDate}
              style={[
                styles.dateBox,
                isSelected && styles.dateBoxSelected,
                item.isToday && !isSelected && styles.dateBoxToday,
              ]}
              onPress={() => onSelectDate(item.fullDate)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayName,
                  isSelected && styles.dayNameSelected,
                  item.isToday && !isSelected && styles.dayNameToday,
                ]}
              >
                {item.dayName}
              </Text>
              <Text
                style={[
                  styles.dayNum,
                  isSelected && styles.dayNumSelected,
                ]}
              >
                {item.dayNum}
              </Text>

              {/* Event indicator dot */}
              <View style={styles.indicatorContainer}>
                {hasEvents ? (
                  <View
                    style={[
                      styles.dot,
                      isSelected && styles.dotSelected,
                    ]}
                  />
                ) : (
                  <View style={styles.emptyDot} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  clearBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  scrollList: {
    paddingVertical: 4,
    gap: 8,
  },
  dateBox: {
    width: 58,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  dateBoxToday: {
    borderColor: '#818CF8',
    backgroundColor: '#F8FAFC',
  },
  dateBoxSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  dayNameToday: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  dayNameSelected: {
    color: '#E0E7FF',
  },
  dayNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  dayNumSelected: {
    color: '#FFFFFF',
  },
  indicatorContainer: {
    height: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981', // Emerald active dot
  },
  dotSelected: {
    backgroundColor: '#FFFFFF',
  },
  emptyDot: {
    width: 5,
    height: 5,
  },
});

export default CalendarStrip;
