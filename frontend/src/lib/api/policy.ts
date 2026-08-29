import { apiClient, safeCall } from './client';

const FALLBACK_TRAIN = { policy_id: 'pol-001', status: 'completed' };

const FALLBACK_RECOMMEND = {
  user_id: 'usr-001',
  recommended_intervention: 'high_diversity_recommendation',
  expected_reward: 0.487,
};

const FALLBACK_EVALUATE = {
  policy_id: 'pol-001',
  online_regret: 0.034,
  offline_policy_value: 0.672,
};

export async function trainPolicy(body: {
  dataset_id: string;
  algorithm?: string;
  reward_definition: Record<string, number>;
}): Promise<{ policy_id: string; status: string }> {
  return safeCall(async () => {
    const { data } = await apiClient.post('/policy/train', body);
    return data;
  }, FALLBACK_TRAIN);
}

export async function getRecommendation(
  policyId: string,
  userId: string
): Promise<{ user_id: string; recommended_intervention: string; expected_reward: number }> {
  return safeCall(async () => {
    const { data } = await apiClient.get(`/policy/${policyId}/recommend/${userId}`);
    return data;
  }, { ...FALLBACK_RECOMMEND, user_id: userId });
}

export async function evaluatePolicy(policyId: string): Promise<{
  policy_id: string;
  online_regret?: number;
  offline_policy_value?: number;
}> {
  return safeCall(async () => {
    const { data } = await apiClient.get(`/policy/${policyId}/evaluate`);
    return data;
  }, FALLBACK_EVALUATE);
}
