export interface SnsLink {
  platform: string;
  url: string;
}

export interface Artist {
  artistId: number;
  name: string;
  profileImageUrl: string;
  description: string;
  genre: string[];
  sns: SnsLink[];
}
