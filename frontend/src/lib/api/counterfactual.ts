import { apiClient, safeCall } from './client';

export interface CounterfactualResult {
  user_id: string;
  observed: { treatment: string; predicted_value: number };
  counterfactual: { treatment: string; predicted_value: number };
  estimated_effect: number;
}

export interface PolicyComparisonResult {
  results: Array<{ policy: string; predicted_value: number }>;
}

const FALLBACK_SIMULATE: CounterfactualResult = {
  user_id: 'usr-001',
  observed: { treatment: 'standard_recommendation', predicted_value: 42.3 },
  counterfactual: { treatment: 'high_diversity_recommendation', predicted_value: 51.7 },
  estimated_effect: 9.4,
};

const FALLBACK_COMPARE: PolicyComparisonResult = {
  results: [
    { policy: 'baseline', predicted_value: 38.2 },
    { policy: 'personalized_v2', predicted_value: 45.8 },
    { policy: 'exploration_boost', predicted_value: 41.1 },
    { policy: 'diversity_first', predicted_value: 43.5 },
    { policy: 'retention_optimized', predicted_value: 47.2 },
  ],
};

export async function simulate(body: {
  user_id: string;
  observed_treatment: string;
  counterfactual_treatment: string;
  outcome: string;
}): Promise<CounterfactualResult> {
  return safeCall(async () => {
    const { data } = await apiClient.post('/counterfactual/simulate', body);
    return data;
  }, FALLBACK_SIMULATE);
}

export async function comparePolicies(body: {
  user_id: string;
  policies: string[];
  outcome: string;
}): Promise<PolicyComparisonResult> {
  return safeCall(async () => {
    const { data } = await apiClient.post('/counterfactual/compare-policies', body);
    return data;
  }, FALLBACK_COMPARE);
}
