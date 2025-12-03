export interface Track {
  trackId: number;
  name: string;
  url: string;
}

export interface Album {
  albumId: number;
  name: string;
  coverImageUrl: string;
  releaseDate: string;
  description?: string;
  tracks?: Track[];
}

export interface TrackCreationPayload {
  name: string;
  url: string;
}

export interface AlbumCreationPayload {
  name: string;
  coverImageUrl?: string;
  releaseDate: string;
  description?: string;
  tracks: TrackCreationPayload[];
}
