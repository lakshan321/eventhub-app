/**
 * Helper utilities for formatting dates, times, and status badges
 */

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'confirmed':
      return { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' };
    case 'cancelled':
      return { bg: '#FFEBEE', text: '#C62828', border: '#FFCDD2' };
    case 'completed':
      return { bg: '#E3F2FD', text: '#1565C0', border: '#BBDEFB' };
    case 'pending':
      return { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' };
    default:
      return { bg: '#F5F5F5', text: '#616161', border: '#E0E0E0' };
  }
};
