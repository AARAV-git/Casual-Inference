import { apiClient, safeCall } from './client';

export interface DriftTimelinePoint {
  period: string;
  drift: number;
}

export interface CausalDriftResult {
  total_drift: number;
  natural_drift: number;
  ai_induced_drift: number;
}

const FALLBACK_POPULATION: { timeline: DriftTimelinePoint[] } = {
  timeline: [
    { period: '2024-10', drift: 0.042 },
    { period: '2024-11', drift: 0.067 },
    { period: '2024-12', drift: 0.098 },
    { period: '2025-01', drift: 0.127 },
    { period: '2025-02', drift: 0.156 },
    { period: '2025-03', drift: 0.189 },
    { period: '2025-04', drift: 0.203 },
    { period: '2025-05', drift: 0.234 },
  ],
};

const FALLBACK_CAUSAL: CausalDriftResult = {
  total_drift: 0.234,
  natural_drift: 0.181,
  ai_induced_drift: 0.053,
};

const FALLBACK_USER_DRIFT: DriftTimelinePoint[] = [
  { period: '2024-10', drift: 0.02 },
  { period: '2024-11', drift: 0.05 },
  { period: '2024-12', drift: 0.08 },
  { period: '2025-01', drift: 0.12 },
  { period: '2025-02', drift: 0.15 },
  { period: '2025-03', drift: 0.18 },
];

export async function getPopulationDrift(params: { dataset_id: string; window?: string }): Promise<{ timeline: DriftTimelinePoint[] }> {
  return safeCall(async () => {
    const { data } = await apiClient.get('/drift/population', { params });
    return data;
  }, FALLBACK_POPULATION);
}

export async function getCausalDrift(body: {
  dataset_id: string;
  treatment: string;
  behavior_variable: string;
  time_window?: string;
}): Promise<CausalDriftResult> {
  return safeCall(async () => {
    const { data } = await apiClient.post('/drift/causal', body);
    return data;
  }, FALLBACK_CAUSAL);
}

export async function getUserDrift(userId: string): Promise<DriftTimelinePoint[]> {
  return safeCall(async () => {
    const { data } = await apiClient.get(`/drift/users/${userId}`);
    return data;
  }, FALLBACK_USER_DRIFT);
}
