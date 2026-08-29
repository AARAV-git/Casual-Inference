import { apiClient, safeCall } from './client';

export interface Intervention {
  id: string;
  name: string;
  treatment: number;
}

export interface InterventionStats {
  exposed_users: number;
  average_watch_time: number;
  estimated_ate: number;
}

const FALLBACK_LIST: Intervention[] = [
  { id: 'int-001', name: 'Homepage Personalization', treatment: 1 },
  { id: 'int-002', name: 'Push Notification Boost', treatment: 1 },
  { id: 'int-003', name: 'Content Diversity Injection', treatment: 1 },
  { id: 'int-004', name: 'Social Proof Badges', treatment: 0 },
  { id: 'int-005', name: 'AI Recommendation Spotlight', treatment: 1 },
];

const FALLBACK_STATS: InterventionStats = {
  exposed_users: 3421,
  average_watch_time: 2847,
  estimated_ate: 0.342,
};

export async function listInterventions(): Promise<Intervention[]> {
  return safeCall(async () => {
    const { data } = await apiClient.get('/interventions');
    return data;
  }, FALLBACK_LIST);
}

export async function getInterventionStatistics(id: string): Promise<InterventionStats> {
  return safeCall(async () => {
    const { data } = await apiClient.get(`/interventions/${id}/statistics`);
    return data;
  }, FALLBACK_STATS);
}
