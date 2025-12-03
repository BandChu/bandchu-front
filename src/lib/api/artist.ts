import apiClient from "@/lib/api";
import { MyArtistProfileResponse } from "@/types/myArtistProfile";
import { ArtistCreationPayload, ArtistDetail } from "@/types/artist";

export const getMyArtistProfile = async (): Promise<MyArtistProfileResponse> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: MyArtistProfileResponse; message: string }>(
      '/api/artists/me'
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to fetch my artist profile:", error);
    throw error;
  }
};

export const createArtistProfile = async (payload: ArtistCreationPayload): Promise<ArtistDetail> => {
  try {
    const response = await apiClient.post<{ success: boolean; data: ArtistDetail; message: string }>(
      '/api/artists',
      payload
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to create artist profile:", error);
    throw error;
  }
};

export const updateArtistProfile = async (artistId: number, payload: ArtistCreationPayload): Promise<ArtistDetail> => {
  try {
    const response = await apiClient.patch<{ success: boolean; data: ArtistDetail; message: string }>(
      `/api/artists/${artistId}`,
      payload
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to update artist profile:", error);
    throw error;
  }
};

