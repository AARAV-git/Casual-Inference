import { apiClient, safeCall } from './client';

export interface ValueBreakdown {
  user_id: string;
  components: Record<string, number>;
  total: number;
}

const FALLBACK: ValueBreakdown = {
  user_id: 'usr-001',
  components: {
    engagement_lift: 0.184,
    retention_gain: 0.092,
    satisfaction_delta: 0.066,
  discovery_value: 0.045,
  churn_prevented: 0.031,
  revenue_impact: 0.128,
  learning_effect: 0.015,
    social_value: 0.022,
  time_saved: 0.038,
    diversity_exposure: 0.019,
  },
  total: 0.64,
};

export async function getValueBreakdown(userId: string): Promise<ValueBreakdown> {
  return safeCall(async () => {
    const { data } = await apiClient.get(`/value/${userId}`);
    return data;
  }, { ...FALLBACK, user_id: userId });
}
