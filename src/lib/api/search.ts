import apiClient from "@/lib/api";
import { SearchResponse } from "@/types/search";

export const searchByKeyword = async (keyword: string): Promise<SearchResponse> => {
  if (!keyword.trim()) {
    return { artists: [], concerts: [] };
  }

  try {
    const response = await apiClient.get('/api/artists/search', {
      params: { keyword },
    });
    return response.data.data;
  } catch (error) {
    console.error("Search failed:", error);
    throw error;
  }
};
