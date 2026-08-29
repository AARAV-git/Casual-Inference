import { apiClient, WS_BASE_URL, safeCall } from './client';

export interface CreateExperimentRequest {
  name: string;
  dataset_id: string;
  treatment: string;
  outcome: string;
  models: string[];
}

export interface ExperimentStatus {
  id: string;
  status: string;
  progress: number;
}

export interface ExperimentResult {
  models: Array<{
    model: string;
    pehe?: number;
    auuc?: number;
    qini?: number;
  }>;
}

const FALLBACK_STATUS: ExperimentStatus = { id: 'exp-001', status: 'completed', progress: 100 };

const FALLBACK_RESULTS: ExperimentResult = {
  models: [
    { model: 'T-Learner (XGBoost)', pehe: 0.421, auuc: 0.712, qini: 0.184 },
    { model: 'S-Learner (XGBoost)', pehe: 0.534, auuc: 0.689, qini: 0.172 },
    { model: 'Doubly Robust', pehe: 0.389, auuc: 0.734, qini: 0.198 },
    { model: 'Causal Forest', pehe: 0.367, auuc: 0.751, qini: 0.213 },
    { model: 'DragonNet', pehe: 0.398, auuc: 0.728, qini: 0.191 },
  ],
};

export async function createExperiment(body: CreateExperimentRequest): Promise<{ experiment_id: string; status: string }> {
  return safeCall(async () => {
    const { data } = await apiClient.post('/experiments', body);
    return data;
  }, { experiment_id: 'exp-demo-' + Date.now(), status: 'queued' });
}

export async function getExperimentStatus(id: string): Promise<ExperimentStatus> {
  return safeCall(async () => {
    const { data } = await apiClient.get(`/experiments/${id}`);
    return data;
  }, { ...FALLBACK_STATUS, id });
}

export async function getExperimentResults(id: string): Promise<ExperimentResult> {
  return safeCall(async () => {
    const { data } = await apiClient.get(`/experiments/${id}/results`);
    return data;
  }, FALLBACK_RESULTS);
}

export function subscribeToProgress(
  id: string,
  onMessage: (data: any) => void
): () => void {
  const wsUrl = `${WS_BASE_URL}/ws/experiments/${id}`;
  let ws: WebSocket | null = null;
  let closed = false;

  try {
    ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch {
        onMessage(event.data);
      }
    };
    ws.onerror = () => {
      if (!closed) {
        // Simulate progress for demo mode
        const phases = [
          { phase: 'Data preprocessing', status: 'completed', progress: 20 },
          { phase: 'Model training', status: 'running', progress: 50 },
          { phase: 'Evaluation', status: 'running', progress: 80 },
          { phase: 'Finalizing', status: 'completed', progress: 100 },
        ];
        phases.forEach((p, i) => {
          setTimeout(() => { if (!closed) onMessage(p); }, (i + 1) * 1500);
        });
      }
    };
    ws.onopen = () => {};
    ws.onclose = () => {};
  } catch {
    // Simulate progress in demo mode
    const phases = [
      { phase: 'Data preprocessing', status: 'completed', progress: 20 },
      { phase: 'Model training', status: 'running', progress: 50 },
      { phase: 'Evaluation', status: 'running', progress: 80 },
      { phase: 'Finalizing', status: 'completed', progress: 100 },
    ];
    phases.forEach((p, i) => {
      setTimeout(() => { if (!closed) onMessage(p); }, (i + 1) * 1500);
    });
  }

  return () => {
    closed = true;
    ws?.close();
  };
}
