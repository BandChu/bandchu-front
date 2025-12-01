export interface CalendarEvent {
  artistId: number;
  artistName: string;
  artistProfileImageUrl?: string;
  concertId: number;
  scheduleId?: number; // For unique key generation
  date: string; // YYYY-MM-DD format for calendar highlighting
  dateTime: string; // Full ISO string for list display
  title: string;
  place: string;
  type: 'performance' | 'booking';
  bookingUrl?: string;
  imageUrl?: string;
}
