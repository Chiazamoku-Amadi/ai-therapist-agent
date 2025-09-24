import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { authenticatedFetch } from "./authenticatedFetch";

interface MoodEntry {
  score: number;
  note?: string;
}

interface MoodStats {
  average: number;
  count: number;
  highest: number;
  lowest: number;
  history: Array<{
    _id: string;
    score: number;
    note?: string;
    timestamp: string;
  }>;
}

// Handles saving the mood
export async function trackMood(
  data: MoodEntry,
  router: AppRouterInstance
): Promise<{ success: boolean; data: unknown }> {
  try {
    const response = await authenticatedFetch("/api/mood", router, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to track mood");
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

export async function getMoodHistory(
  router: AppRouterInstance,
  params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<{ success: boolean; data: unknown[] }> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await authenticatedFetch(
      `/api/mood/history?${queryParams.toString()}`,
      router
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch mood history");
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

export async function getMoodStats(
  router: AppRouterInstance,
  period: "week" | "month" | "year" = "week"
): Promise<{
  success: boolean;
  data: MoodStats;
}> {
  try {
    const response = await authenticatedFetch(
      `/api/mood/stats?period=${period}`,
      router
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch mood statistics");
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}
