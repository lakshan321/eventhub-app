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

export const CATEGORY_FALLBACK_IMAGES = {
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
  music: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop',
  workshop: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop',
  business: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop',
  default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
};

export const getFallbackImage = (category) => {
  if (!category) return CATEGORY_FALLBACK_IMAGES.default;
  return (
    CATEGORY_FALLBACK_IMAGES[category.toLowerCase()] ||
    CATEGORY_FALLBACK_IMAGES.default
  );
};
