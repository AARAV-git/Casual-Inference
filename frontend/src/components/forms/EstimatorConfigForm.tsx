'use client';

import { useEffect, useState, useCallback } from 'react';
import { getTreatments, getOutcomes, getConfounders, estimate } from '@/lib/api/causal';
import { useDatasetStore } from '@/store/datasetStore';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Play, Loader2 } from 'lucide-react';

interface Props {
  onResult?: (result: any) => void;
  onNodeHighlight?: (nodeId: string | null) => void;
}

const ESTIMATORS = [
  { value: 'dml', label: 'Double Machine Learning' },
  { value: 'ipw', label: 'Inverse Probability Weighting' },
  { value: 't_learner', label: 'T-Learner' },
  { value: 's_learner', label: 'S-Learner' },
  { value: 'causal_forest', label: 'Causal Forest' },
];

export default function EstimatorConfigForm({ onResult, onNodeHighlight }: Props) {
  const store = useDatasetStore();
  const selectedDatasetId = store.selectedDatasetId;
  const selectedTreatment = store.selectedTreatment;
  const selectedOutcome = store.selectedOutcome;
  const selectedConfounders = store.selectedConfounders;
  const storeSetConfounders = store.setConfounders;

  const [treatments, setTreatments] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [availableConfounders, setAvailableConfounders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [estimator, setEstimator] = useState('dml');
  const [running, setRunning] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [t, o, c] = await Promise.all([getTreatments(), getOutcomes(), getConfounders()]);
      setTreatments(t);
      setOutcomes(o);
      setAvailableConfounders(c);
      setLoading(false);
    }
    load();
  }, []);

  const handleTreatmentChange = useCallback((val: string) => {
    store.setTreatment(val);
    onNodeHighlight?.(val);
  }, [store.setTreatment, onNodeHighlight]);

  const handleOutcomeChange = useCallback((val: string) => {
    store.setOutcome(val);
    onNodeHighlight?.(val);
  }, [store.setOutcome, onNodeHighlight]);

  const handleConfounderToggle = useCallback((c: string) => {
    storeSetConfounders(
      selectedConfounders.includes(c)
        ? selectedConfounders.filter((x) => x !== c)
        : [...selectedConfounders, c]
    );
  }, [selectedConfounders, storeSetConfounders]);

  const handleSubmit = async () => {
    if (!selectedDatasetId || !selectedTreatment || !selectedOutcome) return;
    setRunning(true);
    const result = await estimate({
      dataset_id: selectedDatasetId,
      treatment: selectedTreatment,
      outcome: selectedOutcome,
      confounders: selectedConfounders,
      estimator,
    });
    setRunning(false);
    onResult?.(result);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-text-muted text-xs">Treatment Variable</Label>
          <Select value={selectedTreatment || ''} onValueChange={handleTreatmentChange}>
            <SelectTrigger className="bg-surface border-grid-line text-text-primary">
              <SelectValue placeholder="Select treatment" />
            </SelectTrigger>
            <SelectContent>
              {treatments.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-text-muted text-xs">Outcome Variable</Label>
          <Select value={selectedOutcome || ''} onValueChange={handleOutcomeChange}>
            <SelectTrigger className="bg-surface border-grid-line text-text-primary">
              <SelectValue placeholder="Select outcome" />
            </SelectTrigger>
            <SelectContent>
              {outcomes.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-text-muted text-xs">Estimator</Label>
        <Select value={estimator} onValueChange={setEstimator}>
          <SelectTrigger className="bg-surface border-grid-line text-text-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ESTIMATORS.map((e) => (
              <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-text-muted text-xs">Confounders ({selectedConfounders.length}/{availableConfounders.length})</Label>
        <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto scrollbar-thin">
          {availableConfounders.map((c) => {
            const selected = selectedConfounders.includes(c);
            return (
              <button
                key={c}
                onClick={() => handleConfounderToggle(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  selected
                    ? 'bg-signal-teal/15 border-signal-teal text-signal-teal'
                    : 'bg-surface border-grid-line text-text-muted hover:border-text-muted'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={running || !selectedTreatment || !selectedOutcome}
        className="w-full bg-signal-teal text-bg hover:bg-signal-teal/90 font-semibold"
      >
        {running ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
        {running ? 'Estimating...' : 'Run Estimation'}
      </Button>
    </div>
  );
}
