export interface PerformingSchedule {
  id: number;
  date: string;
}

export interface Concert {
  concertId: number;
  title: string;
  place: string;
  posterImageUrl: string;
  information: string;
  bookingSchedule: string;
  bookingUrl: string;
  performingSchedule: PerformingSchedule[];
  createdAt: string;
}

export interface ConcertCreationPayload {
  title: string;
  place: string;
  posterImageUrl?: string;
  information?: string;
  bookingSchedule?: string;
  bookingUrl?: string;
  performingSchedule: { date: string }[];
}
