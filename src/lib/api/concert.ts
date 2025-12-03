import apiClient from "@/lib/api";
import { Concert, ConcertCreationPayload } from "@/types/concert";

export const createConcert = async (payload: ConcertCreationPayload): Promise<Concert> => {
  try {
    const response = await apiClient.post<{ success: boolean; data: Concert; message: string }>(
      '/api/concerts',
      payload
    );
    return response.data.data;
  } catch (error) {
    console.error("Failed to create concert:", error);
    throw error;
  }
};

export const getConcertsByArtistId = async (artistId: string): Promise<Concert[]> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: { concerts: Concert[] }; message: string }>(
      `/api/concerts`, 
      { params: { artistId } }
    );
    return response.data.data.concerts;
  } catch (error) {
    console.error("Failed to fetch concerts by artist:", error);
    throw error;
  }
};

export const getConcertById = async (concertId: string): Promise<Concert> => {
  try {
    const response = await apiClient.get<{ success: boolean; data: Concert; message: string }>(
      `/api/concerts/${concertId}`
    );
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch concert with id ${concertId}:`, error);
    throw error;
  }
};
