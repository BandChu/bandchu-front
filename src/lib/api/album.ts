import apiClient from "@/lib/api";
import { Album, AlbumCreationPayload } from "@/types/album";

export const createAlbum = async (payload: AlbumCreationPayload): Promise<Album> => {
  try {
    const response = await apiClient.post<{ success: boolean; data: Album; message: string }>(
      '/api/albums',
      payload
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to create album:", error);
    throw error;
  }
};

export const getAlbumsByArtistId = async (artistId: string): Promise<Album[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: { albums: Album[] }; message: string }>(
      `/api/albums`,
      { params: { artistId } }
    );
    return response.data.data.albums;
  } catch (error) {
    console.error("Failed to fetch albums by artist:", error);
    throw error;
  }
};
