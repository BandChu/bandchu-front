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
