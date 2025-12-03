export interface ArtistSearchResult {
  artistId: number;
  name: string;
  profileImageUrl: string;
}

export interface ConcertSearchResult {
  concertId: number;
  title: string;
  place: string;
  posterImageUrl: string;
}

export interface SearchResponse {
  artists: ArtistSearchResult[];
  concerts: ConcertSearchResult[];
}
