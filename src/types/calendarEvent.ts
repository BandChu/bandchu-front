export interface CalendarEvent {
  artistId: number;
  artistName: string;
  artistProfileImageUrl?: string;
  concertId: number;
  scheduleId?: number;
  date: string;
  dateTime: string;
  title: string;
  place: string;
  type: 'performance' | 'booking';
  bookingUrl?: string;
  imageUrl?: string;
}

