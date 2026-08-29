'use client';

import { useState, useEffect } from 'react';
import { simulate, comparePolicies, CounterfactualResult, PolicyComparisonResult } from '@/lib/api/counterfactual';
import { getTreatments, getOutcomes } from '@/lib/api/causal';
import { listUsers } from '@/lib/api/users';
import ErrorBarChart from '@/components/charts/ErrorBarChart';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRightLeft, Play, Loader2 } from 'lucide-react';

export default function CounterfactualPage() {
  const [users, setUsers] = useState<string[]>([]);
  const [treatments, setTreatments] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [userId, setUserId] = useState('');
  const [observedTx, setObservedTx] = useState('');
  const [counterTx, setCounterTx] = useState('');
  const [outcome, setOutcome] = useState('');
  const [simResult, setSimResult] = useState<CounterfactualResult | null>(null);
  const [policyResult, setPolicyResult] = useState<PolicyComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    async function load() {
      const [u, t, o] = await Promise.all([
        listUsers(),
        getTreatments(),
        getOutcomes(),
      ]);
      setUsers(u.map((x) => x.id));
      setTreatments(t);
      setOutcomes(o);
      if (u.length > 0) setUserId(u[0].id);
      if (t.length > 0) { setObservedTx(t[0]); setCounterTx(t[1] || t[0]); }
      if (o.length > 0) setOutcome(o[0]);
      setLoading(false);
    }
    load();
  }, []);

  const handleSimulate = async () => {
    if (!userId || !observedTx || !counterTx || !outcome) return;
    setRunning(true);
    const r = await simulate({ user_id: userId, observed_treatment: observedTx, counterfactual_treatment: counterTx, outcome });
    setSimResult(r);
    setRunning(false);
  };

  const handleCompare = async () => {
    if (!userId || !outcome) return;
    const r = await comparePolicies({ user_id: userId, policies: treatments, outcome });
    setPolicyResult(r);
  };

  if (loading) return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Skeleton className="h-96 w-full" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-grid-line rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-signal-teal" />
            <h3 className="font-heading text-sm font-semibold">Counterfactual Simulation</h3>
          </div>
          <div className="space-y-3">
            <div><Label className="text-text-muted text-xs">User</Label><Select value={userId} onValueChange={setUserId}><SelectTrigger className="bg-surface-hover border-grid-line text-text-primary mt-1"><SelectValue /></SelectTrigger><SelectContent>{users.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-text-muted text-xs">Observed Treatment</Label><Select value={observedTx} onValueChange={setObservedTx}><SelectTrigger className="bg-surface-hover border-grid-line text-text-primary mt-1"><SelectValue /></SelectTrigger><SelectContent>{treatments.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-text-muted text-xs">Counterfactual Treatment</Label><Select value={counterTx} onValueChange={setCounterTx}><SelectTrigger className="bg-surface-hover border-grid-line text-text-primary mt-1"><SelectValue /></SelectTrigger><SelectContent>{treatments.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label className="text-text-muted text-xs">Outcome</Label><Select value={outcome} onValueChange={setOutcome}><SelectTrigger className="bg-surface-hover border-grid-line text-text-primary mt-1"><SelectValue /></SelectTrigger><SelectContent>{outcomes.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
            <Button onClick={handleSimulate} disabled={running} className="w-full bg-signal-teal text-bg hover:bg-signal-teal/90">{running ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}Simulate</Button>
          </div>
        </div>

        {simResult && (
          <div className="bg-surface border border-grid-line rounded-lg p-4 space-y-4">
            <h3 className="font-heading text-sm font-semibold">Result</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-bg border border-grid-line"><div className="text-xs text-text-muted mb-1">Observed ({simResult.observed.treatment})</div><div className="font-stat text-2xl font-bold text-text-primary">{simResult.observed.predicted_value.toFixed(1)}</div></div>
              <div className="p-3 rounded-lg bg-bg border border-grid-line"><div className="text-xs text-text-muted mb-1">Counterfactual ({simResult.counterfactual.treatment})</div><div className="font-stat text-2xl font-bold text-signal-teal">{simResult.counterfactual.predicted_value.toFixed(1)}</div></div>
            </div>
            <div className="p-3 rounded-lg bg-signal-teal/5 border border-signal-teal/20">
              <div className="text-xs text-signal-teal mb-1">Estimated Causal Effect</div>
              <div className="font-stat text-3xl font-bold text-signal-teal">+{simResult.estimated_effect.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface border border-grid-line rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold">Policy Comparison</h3>
          <Button variant="outline" size="sm" onClick={handleCompare} className="border-grid-line text-text-muted hover:text-signal-teal hover:border-signal-teal">Compare Policies</Button>
        </div>
        {policyResult && (
          <ErrorBarChart
            data={policyResult.results.map((r) => ({
              name: r.policy,
              value: r.predicted_value,
              color: r.predicted_value === Math.max(...policyResult.results.map((x) => x.predicted_value)) ? '#2DD4BF' : '#8B96A8',
            }))}
            height={250}
            showErrorBars={false}
          />
        )}
      </div>
    </div>
  );
}