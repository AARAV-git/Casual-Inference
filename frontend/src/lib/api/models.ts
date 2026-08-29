import { apiClient, safeCall } from './client';

export interface Model {
  id: string;
  name: string;
  version: string;
  dataset_id: string;
  hyperparameters: object;
  metrics: object;
  artifact_path: string;
  status: string;
}

const FALLBACK_LIST: Model[] = [
  { id: 'mdl-001', name: 'Causal Forest v3', version: '3.2.1', dataset_id: 'ds-001', hyperparameters: { n_estimators: 500, max_depth: 8, min_samples_leaf: 10 }, metrics: { pehe: 0.367, auuc: 0.751, ate_bias: 0.012 }, artifact_path: '/models/cf_v3.pkl', status: 'deployed' },
  { id: 'mdl-002', name: 'DragonNet', version: '2.1.0', dataset_id: 'ds-001', hyperparameters: { hidden_dim: 200, layers: 3, learning_rate: 0.001 }, metrics: { pehe: 0.398, auuc: 0.728, ate_bias: 0.018 }, artifact_path: '/models/dragonnet.pkl', status: 'deployed' },
  { id: 'mdl-003', name: 'Doubly Robust', version: '1.5.0', dataset_id: 'ds-002', hyperparameters: { propensit_model: 'logistic', outcome_model: 'xgboost' }, metrics: { pehe: 0.389, auuc: 0.734, ate_bias: 0.015 }, artifact_path: '/models/dr.pkl', status: 'staging' },
  { id: 'mdl-004', name: 'T-Learner XGBoost', version: '4.0.0', dataset_id: 'ds-003', hyperparameters: { n_estimators: 300, max_depth: 6, learning_rate: 0.05 }, metrics: { pehe: 0.421, auuc: 0.712, ate_bias: 0.023 }, artifact_path: '/models/tlearner.pkl', status: 'training' },
  { id: 'mdl-005', name: 'Meta-Learner Ensemble', version: '1.0.0', dataset_id: 'ds-001', hyperparameters: { base_learners: ['S', 'T', 'X'], aggregation: 'stacking' }, metrics: { pehe: 0.345, auuc: 0.763, ate_bias: 0.009 }, artifact_path: '/models/ensemble.pkl', status: 'deployed' },
];

export async function listModels(): Promise<Model[]> {
  return safeCall(async () => {
    const { data } = await apiClient.get('/models');
    return data;
  }, FALLBACK_LIST);
}

export async function getModel(id: string): Promise<Model> {
  return safeCall(async () => {
    const { data } = await apiClient.get(`/models/${id}`);
    return data;
  }, FALLBACK_LIST[0]);
}

export async function getModelMetrics(id: string): Promise<Record<string, unknown>> {
  return safeCall(async () => {
    const { data } = await apiClient.get(`/models/${id}/metrics`);
    return data;
  }, FALLBACK_LIST[0].metrics as Record<string, unknown>);
}
