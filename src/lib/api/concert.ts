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
