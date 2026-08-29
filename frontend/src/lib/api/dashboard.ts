import { apiClient, safeCall } from './client';

export interface DashboardSummary {
  users: number;
  interactions: number;
  experiments: number;
  estimated_ate: number;
  behavioral_drift: number;
  ai_induced_drift: number;
}

const FALLBACK: DashboardSummary = {
  users: 12847,
  interactions: 184293,
  experiments: 23,
  estimated_ate: 0.342,
  behavioral_drift: 0.127,
  ai_induced_drift: 0.053,
};

export async function getSummary(): Promise<DashboardSummary> {
  return safeCall(async () => {
    const { data } = await apiClient.get('/dashboard/summary');
    return data;
  }, FALLBACK);
}
