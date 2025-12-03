export interface CalendarEvent {
  type: 'performance' | 'booking';
  artistId: number;
  artistName: string;
  profileImageUrl?: string;
  date: string;
  title: string;
  concertId: number;
  scheduleId: number;
  
  // Performance event fields
  place?: string;

  // Booking event fields
  vendor?: string;
  
  // Common optional fields
  bookingUrl?: string;
  posterImageUrl?: string;
}
