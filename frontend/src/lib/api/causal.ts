import { apiClient, safeCall } from './client';

export interface EstimateRequest {
  dataset_id: string;
  treatment: string;
  outcome: string;
  confounders: string[];
  estimator: string;
}

export interface EstimateResult {
  experiment_id: string;
  estimator: string;
  ate: number;
  confidence_interval: [number, number];
  sample_size: number;
}

export interface CateSegment {
  segment: string;
  cate: number;
}

export interface CateResult {
  segments: CateSegment[];
}

export interface IteResult {
  user_id: string;
  treatment: string;
  ite: number;
  confidence_interval: [number, number];
}

const FALLBACK_TREATMENTS = ['personalization_strength', 'notification_frequency', 'ui_variant', 'content_ordering', 'recommendation_diversity'];
const FALLBACK_OUTCOMES = ['watch_duration', 'engagement_score', 'retention_7d', 'churn_prob', 'satisfaction_nps'];
const FALLBACK_CONFOUNDERS = ['user_tenure', 'session_frequency', 'content_preference_diversity', 'device_type', 'time_of_day', 'previous_engagement', 'subscription_tier', 'age_group'];

const FALLBACK_ESTIMATE: EstimateResult = {
  experiment_id: 'exp-causal-001',
  estimator: 'Double Machine Learning',
  ate: 0.342,
  confidence_interval: [0.218, 0.466],
  sample_size: 9664,
};

const FALLBACK_CATE: CateResult = {
  segments: [
    { segment: 'New Users (<30d)', cate: 0.521 },
    { segment: 'Casual Viewers', cate: 0.187 },
    { segment: 'Power Users', cate: 0.093 },
    { segment: 'Declining Users', cate: 0.412 },
    { segment: 'Weekend-Only', cate: 0.298 },
    { segment: 'Mobile-First', cate: 0.345 },
  ],
};

const FALLBACK_ITE: IteResult = {
  user_id: 'usr-001',
  treatment: 'personalization_strength',
  ite: 0.487,
  confidence_interval: [0.201, 0.773],
};

export async function getTreatments(): Promise<string[]> {
  return safeCall(async () => {
    const { data } = await apiClient.get('/causal/treatments');
    return data;
  }, FALLBACK_TREATMENTS);
}

export async function getOutcomes(): Promise<string[]> {
  return safeCall(async () => {
    const { data } = await apiClient.get('/causal/outcomes');
    return data;
  }, FALLBACK_OUTCOMES);
}

export async function getConfounders(): Promise<string[]> {
  return safeCall(async () => {
    const { data } = await apiClient.get('/causal/features');
    return data;
  }, FALLBACK_CONFOUNDERS);
}

export async function estimate(body: EstimateRequest): Promise<EstimateResult> {
  return safeCall(async () => {
    const { data } = await apiClient.post('/causal/estimate', body);
    return data;
  }, FALLBACK_ESTIMATE);
}

export async function getCate(body: { experiment_id: string; method?: string }): Promise<CateResult> {
  return safeCall(async () => {
    const { data } = await apiClient.post('/causal/cate', body);
    return data;
  }, FALLBACK_CATE);
}

export async function getIte(userId: string): Promise<IteResult> {
  return safeCall(async () => {
    const { data } = await apiClient.get(`/causal/ite/${userId}`);
    return data;
  }, { ...FALLBACK_ITE, user_id: userId });
}
