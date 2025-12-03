export interface SnsLink {
  platform: string;
  url: string;
}

export interface ArtistDetail {
  artistId: number;
  name: string;
  profileImageUrl?: string;
  description?: string;
  genre?: string[];
  sns: SnsLink[];
}

export interface ArtistCreationPayload {
  name: string;
  profileImageUrl?: string;
  description?: string;
  genre: string[];
  sns: SnsLink[];
}

export interface Artist {
  artistId: number;
  name: string;
  profileImageUrl: string;
  createdAt: string;
}

export interface ArtistsApiResponse {
  success: boolean;
  data: {
    artists: Artist[];
  };
  message: string;
}
