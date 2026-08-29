'use client';

import { useState, useEffect } from 'react';
import { createExperiment, getExperimentStatus } from '@/lib/api/experiments';
import { listDatasets } from '@/lib/api/datasets';
import { getTreatments, getOutcomes } from '@/lib/api/causal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, FlaskConical, Loader2 } from 'lucide-react';

const MODEL_OPTIONS = ['T-Learner', 'S-Learner', 'Doubly Robust', 'Causal Forest', 'DragonNet'];

export default function ExperimentsPage() {
  const [datasets, setDatasets] = useState<Array<{ id: string; name: string }>>([]);
  const [treatments, setTreatments] = useState<string[]>([]);
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>(['Causal Forest', 'Doubly Robust']);
  const [name, setName] = useState('');
  const [datasetId, setDatasetId] = useState('');
  const [treatment, setTreatment] = useState('');
  const [outcome, setOutcome] = useState('');
  const [expId, setExpId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [ds, tx, oc] = await Promise.all([listDatasets(), getTreatments(), getOutcomes()]);
      setDatasets(ds.map((d) => ({ id: d.id, name: d.name })));
      setTreatments(tx);
      setOutcomes(oc);
      if (ds.length > 0) setDatasetId(ds[0].id);
      if (tx.length > 0) setTreatment(tx[0]);
      if (oc.length > 0) setOutcome(oc[0]);
      setLoading(false);
    }
    load();
  }, []);

  const toggleModel = (m: string) => {
    setSelectedModels((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  };

  const handleCreate = async () => {
    if (!name || !datasetId || !treatment || !outcome || selectedModels.length === 0) return;
    setCreating(true);
    const r = await createExperiment({ name, dataset_id: datasetId, treatment, outcome, models: selectedModels });
    setExpId(r.experiment_id);
    setCreating(false);
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6">
      {expId ? (
        <div className="space-y-4">
          <a href={`#/experiments/${expId}`} className="inline-flex items-center gap-2 bg-signal-teal/10 border border-signal-teal/30 rounded-lg px-4 py-3 text-signal-teal hover:bg-signal-teal/15 transition-colors">
            <FlaskConical className="w-4 h-4" />
            <span className="font-medium text-sm">Experiment created: {expId}</span>
            <span className="text-xs opacity-70">Click to view progress</span>
          </a>
        </div>
      ) : (
        <div className="bg-surface border border-grid-line rounded-lg p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-signal-teal" />
            <h3 className="font-heading text-sm font-semibold">New Experiment</h3>
          </div>

          <div><Label className="text-text-muted text-xs">Experiment Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ATE Estimation v4" className="bg-surface-hover border-grid-line text-text-primary mt-1" /></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><Label className="text-text-muted text-xs">Dataset</Label><Select value={datasetId} onValueChange={setDatasetId}><SelectTrigger className="bg-surface-hover border-grid-line text-text-primary mt-1"><SelectValue /></SelectTrigger><SelectContent>{datasets.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-text-muted text-xs">Treatment</Label><Select value={treatment} onValueChange={setTreatment}><SelectTrigger className="bg-surface-hover border-grid-line text-text-primary mt-1"><SelectValue /></SelectTrigger><SelectContent>{treatments.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-text-muted text-xs">Outcome</Label><Select value={outcome} onValueChange={setOutcome}><SelectTrigger className="bg-surface-hover border-grid-line text-text-primary mt-1"><SelectValue /></SelectTrigger><SelectContent>{outcomes.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
          </div>

          <div className="space-y-2">
            <Label className="text-text-muted text-xs">Models ({selectedModels.length}/{MODEL_OPTIONS.length})</Label>
            <div className="flex flex-wrap gap-2">
              {MODEL_OPTIONS.map((m) => (
                <button key={m} onClick={() => toggleModel(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${selectedModels.includes(m) ? 'bg-signal-teal/15 border-signal-teal text-signal-teal' : 'bg-surface-hover border-grid-line text-text-muted hover:border-text-muted'}`}>{m}</button>
              ))}
            </div>
          </div>

          <Button onClick={handleCreate} disabled={creating || !name} className="w-full bg-signal-teal text-bg hover:bg-signal-teal/90 font-semibold">
            {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FlaskConical className="w-4 h-4 mr-2" />}
            {creating ? 'Creating...' : 'Launch Experiment'}
          </Button>
        </div>
      )}
    </div>
  );
}