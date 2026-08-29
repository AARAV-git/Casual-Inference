'use client';

import { useEffect, useState } from 'react';
import { getPopulationDrift, getCausalDrift, DriftTimelinePoint, CausalDriftResult } from '@/lib/api/drift';
import { listDatasets } from '@/lib/api/datasets';
import { getTreatments } from '@/lib/api/causal';
import AreaChartDrift from '@/components/charts/AreaChartDrift';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Waves } from 'lucide-react';

export default function BehavioralDriftPage() {
  const [datasets, setDatasets] = useState<Array<{ id: string; name: string }>>([]);
  const [treatments, setTreatments] = useState<string[]>([]);
  const [datasetId, setDatasetId] = useState('ds-001');
  const [treatment, setTreatment] = useState('');
  const [popDrift, setPopDrift] = useState<DriftTimelinePoint[]>([]);
  const [causalDrift, setCausalDrift] = useState<CausalDriftResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ds, tx] = await Promise.all([listDatasets(), getTreatments()]);
      setDatasets(ds.map((d) => ({ id: d.id, name: d.name })));
      setTreatments(tx);
      if (tx.length > 0) setTreatment(tx[0]);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!datasetId) return;
    getPopulationDrift({ dataset_id: datasetId }).then((d) => setPopDrift(d.timeline));
    if (treatment) {
      getCausalDrift({ dataset_id: datasetId, treatment, behavior_variable: 'watch_duration' }).then(setCausalDrift);
    }
  }, [datasetId, treatment]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Waves className="w-5 h-5 text-signal-teal" />
        <span className="text-sm text-text-muted">Behavioral drift analysis across time windows</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label className="text-text-muted text-xs">Dataset</Label><Select value={datasetId} onValueChange={setDatasetId}><SelectTrigger className="bg-surface border-grid-line text-text-primary mt-1"><SelectValue /></SelectTrigger><SelectContent>{datasets.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select></div>
        <div><Label className="text-text-muted text-xs">Treatment Variable</Label><Select value={treatment} onValueChange={setTreatment}><SelectTrigger className="bg-surface border-grid-line text-text-primary mt-1"><SelectValue /></SelectTrigger><SelectContent>{treatments.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <div className="text-xs text-text-muted">Total Drift</div>
          <div className="font-stat text-2xl font-bold text-danger-red mt-1">{causalDrift?.total_drift.toFixed(3) ?? '—'}</div>
        </div>
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <div className="text-xs text-text-muted">Natural Drift</div>
          <div className="font-stat text-2xl font-bold text-intervention-amber mt-1">{causalDrift?.natural_drift.toFixed(3) ?? '—'}</div>
        </div>
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <div className="text-xs text-text-muted">AI-Induced Drift</div>
          <div className="font-stat text-2xl font-bold text-signal-teal mt-1">{causalDrift?.ai_induced_drift.toFixed(3) ?? '—'}</div>
        </div>
      </div>

      <div className="bg-surface border border-grid-line rounded-lg p-4">
        <h3 className="font-heading text-sm font-semibold mb-4">Population Drift Timeline</h3>
        <AreaChartDrift data={popDrift} height={300} title="" />
      </div>

      {causalDrift && (
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <h3 className="font-heading text-sm font-semibold mb-3">Drift Decomposition</h3>
          <div className="w-full h-6 rounded-full bg-bg overflow-hidden flex">
            <div className="h-full bg-intervention-amber" style={{ width: `${(causalDrift.natural_drift / causalDrift.total_drift) * 100}%` }} title={`Natural: ${((causalDrift.natural_drift / causalDrift.total_drift) * 100).toFixed(1)}%`} />
            <div className="h-full bg-signal-teal" style={{ width: `${(causalDrift.ai_induced_drift / causalDrift.total_drift) * 100}%` }} title={`AI-induced: ${((causalDrift.ai_induced_drift / causalDrift.total_drift) * 100).toFixed(1)}%`} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-text-muted">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-intervention-amber inline-block" /> Natural {((causalDrift.natural_drift / causalDrift.total_drift) * 100).toFixed(1)}%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-signal-teal inline-block" /> AI-Induced {((causalDrift.ai_induced_drift / causalDrift.total_drift) * 100).toFixed(1)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}