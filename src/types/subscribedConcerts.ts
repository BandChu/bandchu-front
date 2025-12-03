export interface PerformingSchedule {
  id: number;
  date: string;
}

export interface ConcertForSubscribed {
  concertId: number;
  title: string;
  place: string;
  bookingUrl: string;
  posterImageUrl?: string;
  performingSchedule: PerformingSchedule[];
  bookingSchedule: string;
}

export interface ArtistWithConcerts {
  artistId: number;
  name: string;
  profileImageUrl: string;
  subscribedAt: string;
  description?: string;
  genre?: string[];
  concerts: ConcertForSubscribed[];
}

export interface SubscribedConcertsResponse {
  artists: ArtistWithConcerts[];
}
