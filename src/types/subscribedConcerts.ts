export interface PerformingSchedule {
  id: number;
  date: string;
}

export interface Concert {
  concertId: number;
  title: string;
  place: string;
  performingSchedule: PerformingSchedule[];
  bookingSchedule: string;
  bookingUrl?: string;
  imageUrl?: string;
}

export interface SubscribedArtistWithConcerts {
  artistId: number;
  name: string;
  profileImageUrl?: string;
  subscribedAt: string;
  concerts: Concert[];
}

export interface SubscribedConcertsApiResponse {
  success: boolean;
  data: {
    artists: SubscribedArtistWithConcerts[];
  };
  message: string;
}