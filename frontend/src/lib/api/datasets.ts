import { apiClient, safeCall } from './client';

export interface Dataset {
  id: string;
  name: string;
  type: string;
  processed_path: string;
  has_ground_truth: boolean;
  status: string;
  created_at: string;
}

export interface DatasetStatistics {
  schema: Array<{ field: string; type: string }>;
  missing_values: Record<string, number>;
  treatment_distribution: Record<string, number>;
}

const FALLBACK_LIST: Dataset[] = [
  { id: 'ds-001', name: 'Streaming Engagement v3', type: 'parquet', processed_path: '/data/v3.parquet', has_ground_truth: true, status: 'ready', created_at: '2024-11-15T10:30:00Z' },
  { id: 'ds-002', name: 'Recommendation A/B Logs', type: 'csv', processed_path: '/data/ab_logs.csv', has_ground_truth: false, status: 'ready', created_at: '2024-11-10T08:00:00Z' },
  { id: 'ds-003', name: 'User Behavior Q4 2024', type: 'parquet', processed_path: '/data/q4.parquet', has_ground_truth: true, status: 'processing', created_at: '2024-12-01T14:00:00Z' },
  { id: 'ds-004', name: 'Intervention Pilot', type: 'csv', processed_path: '/data/pilot.csv', has_ground_truth: true, status: 'ready', created_at: '2024-10-20T09:00:00Z' },
];

const FALLBACK_STATS: DatasetStatistics = {
  schema: [
    { field: 'user_id', type: 'string' },
    { field: 'item_id', type: 'string' },
    { field: 'event_type', type: 'categorical' },
    { field: 'watch_duration', type: 'numeric' },
    { field: 'treatment', type: 'binary' },
    { field: 'outcome', type: 'numeric' },
    { field: 'age_group', type: 'categorical' },
    { field: 'session_length', type: 'numeric' },
  ],
  missing_values: { user_id: 0, item_id: 23, event_type: 0, watch_duration: 152, treatment: 0, outcome: 89 },
  treatment_distribution: { control: 4932, treatment_a: 2587, treatment_b: 2145 },
};

export async function listDatasets(): Promise<Dataset[]> {
  return safeCall(async () => {
    const { data } = await apiClient.get('/datasets');
    return data;
  }, FALLBACK_LIST);
}

export async function getDataset(id: string): Promise<Dataset> {
  return safeCall(async () => {
    const { data } = await apiClient.get(`/datasets/${id}`);
    return data;
  }, FALLBACK_LIST[0]);
}

export async function getDatasetStatistics(id: string): Promise<DatasetStatistics> {
  return safeCall(async () => {
    const { data } = await apiClient.get(`/datasets/${id}/statistics`);
    return data;
  }, FALLBACK_STATS);
}
