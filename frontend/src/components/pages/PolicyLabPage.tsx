'use client';

import { useState, useEffect } from 'react';
import { trainPolicy, getRecommendation, evaluatePolicy } from '@/lib/api/policy';
import { listDatasets } from '@/lib/api/datasets';
import { listUsers } from '@/lib/api/users';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Beaker, Play, Loader2, Lightbulb, TrendingUp } from 'lucide-react';

const ALGORITHMS = [
  { value: 'ips', label: 'Inverse Propensity Scoring' },
  { value: 'doubly_robust', label: 'Doubly Robust' },
  { value: 'bandit_ucb', label: 'Upper Confidence Bound' },
  { value: 'bandit_thompson', label: 'Thompson Sampling' },
];

export default function PolicyLabPage() {
  const [datasets, setDatasets] = useState<Array<{ id: string; name: string }>>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [datasetId, setDatasetId] = useState('');
  const [algorithm, setAlgorithm] = useState('doubly_robust');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [policyId, setPolicyId] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const [ds, us] = await Promise.all([listDatasets(), listUsers()]);
      setDatasets(ds.map((d) => ({ id: d.id, name: d.name })));
      setUsers(us.map((u) => u.id));
      if (ds.length > 0) setDatasetId(ds[0].id);
      if (us.length > 0) setUserId(us[0].id);
      setLoading(false);
    }
    load();
  }, []);

  const handleTrain = async () => {
    if (!datasetId) return;
    setTraining(true);
    const r = await trainPolicy({ dataset_id: datasetId, algorithm, reward_definition: { engagement: 0.4, retention: 0.3, satisfaction: 0.2, diversity: 0.1 } });
    setPolicyId(r.policy_id);
    setTraining(false);
  };

  const handleRecommend = async () => {
    if (!policyId || !userId) return;
    const r = await getRecommendation(policyId, userId);
    setRecommendation(r);
  };

  const handleEvaluate = async () => {
    if (!policyId) return;
    const r = await evaluatePolicy(policyId);
    setEvaluation(r);
  };

  if (loading) return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Skeleton className="h-96 w-full" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-grid-line rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Beaker className="w-4 h-4 text-signal-teal" />
            <h3 className="font-heading text-sm font-semibold">Configure Policy</h3>
          </div>
          <div className="space-y-3">
            <div><Label className="text-text-muted text-xs">Dataset</Label><Select value={datasetId} onValueChange={setDatasetId}><SelectTrigger className="bg-surface-hover border-grid-line text-text-primary mt-1"><SelectValue /></SelectTrigger><SelectContent>{datasets.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-text-muted text-xs">Algorithm</Label><Select value={algorithm} onValueChange={setAlgorithm}><SelectTrigger className="bg-surface-hover border-grid-line text-text-primary mt-1"><SelectValue /></SelectTrigger><SelectContent>{ALGORITHMS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent></Select></div>
            <Button onClick={handleTrain} disabled={training} className="w-full bg-signal-teal text-bg hover:bg-signal-teal/90 font-semibold">{training ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}{training ? 'Training...' : 'Train Policy'}</Button>
          </div>
          {policyId && <div className="p-3 rounded-lg bg-bg border border-grid-line"><div className="text-xs text-text-muted">Policy ID</div><div className="font-stat text-sm text-text-primary mt-1">{policyId}</div></div>}
        </div>

        <div className="bg-surface border border-grid-line rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-intervention-amber" />
            <h3 className="font-heading text-sm font-semibold">Test Recommendation</h3>
          </div>
          <div className="space-y-3">
            <div><Label className="text-text-muted text-xs">User</Label><Select value={userId} onValueChange={setUserId}><SelectTrigger className="bg-surface-hover border-grid-line text-text-primary mt-1"><SelectValue /></SelectTrigger><SelectContent>{users.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
            <Button onClick={handleRecommend} disabled={!policyId} variant="outline" className="w-full border-grid-line text-text-muted hover:text-signal-teal hover:border-signal-teal">Get Recommendation</Button>
          </div>
          {recommendation && (
            <div className="p-3 rounded-lg bg-signal-teal/5 border border-signal-teal/20 space-y-1">
              <div className="text-xs text-signal-teal">Recommended Intervention</div>
              <div className="font-medium text-text-primary">{recommendation.recommended_intervention}</div>
              <div className="font-stat text-sm text-text-muted">Expected reward: {recommendation.expected_reward.toFixed(3)}</div>
            </div>
          )}
        </div>
      </div>

      {policyId && (
        <div className="bg-surface border border-grid-line rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-signal-teal" />
              <h3 className="font-heading text-sm font-semibold">Policy Evaluation</h3>
            </div>
            <Button onClick={handleEvaluate} variant="outline" size="sm" className="border-grid-line text-text-muted hover:text-signal-teal hover:border-signal-teal">Evaluate</Button>
          </div>
          {evaluation && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-bg border border-grid-line">
                <div className="text-xs text-text-muted">Online Regret</div>
                <div className="font-stat text-2xl font-bold text-intervention-amber mt-1">{evaluation.online_regret?.toFixed(4) ?? '—'}</div>
              </div>
              <div className="p-3 rounded-lg bg-bg border border-grid-line">
                <div className="text-xs text-text-muted">Offline Policy Value</div>
                <div className="font-stat text-2xl font-bold text-signal-teal mt-1">{evaluation.offline_policy_value?.toFixed(4) ?? '—'}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}