'use client';

import { useEffect, useState, useCallback } from 'react';
import { getExperimentStatus, getExperimentResults, ExperimentStatus, ExperimentResult } from '@/lib/api/experiments';
import { useExperimentStore } from '@/store/experimentStore';
import ExperimentLiveRun from '@/components/ExperimentLiveRun';
import ErrorBarChart from '@/components/charts/ErrorBarChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ExperimentDetailPage({ experimentId }: { experimentId: string }) {
  const [status, setStatus] = useState<ExperimentStatus | null>(null);
  const [results, setResults] = useState<ExperimentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLive, setShowLive] = useState(false);
  const { setExperiment, clearProgress } = useExperimentStore();

  const loadResults = useCallback(async () => {
    const r = await getExperimentResults(experimentId);
    setResults(r);
    setShowLive(false);
  }, [experimentId]);

  const handleComplete = useCallback(() => {
    loadResults();
    setStatus((prev) => prev ? { ...prev, status: 'completed', progress: 100 } : null);
  }, [loadResults]);

  useEffect(() => {
    clearProgress();
    setExperiment(experimentId);
    getExperimentStatus(experimentId).then((s) => {
      setStatus(s);
      if (s.status === 'queued' || s.status === 'running') setShowLive(true);
      else if (s.status === 'completed') loadResults();
      setLoading(false);
    });
  }, [experimentId, setExperiment, clearProgress, loadResults]);

  if (loading || !status) return <div className="space-y-4"><Skeleton className="h-12 w-48" /><Skeleton className="h-64 w-full" /></div>;

  const statusColor = status.status === 'completed' ? 'border-signal-teal text-signal-teal' : status.status === 'running' ? 'border-intervention-amber text-intervention-amber' : 'border-text-muted text-text-muted';

  return (
    <div className="space-y-6">
      <a href="#/experiments" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-signal-teal transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Experiments
      </a>

      <div className="flex items-center gap-4">
        <h2 className="font-heading text-xl font-bold text-text-primary">{experimentId}</h2>
        <Badge variant="outline" className={statusColor}>{status.status}</Badge>
      </div>

      {status.progress < 100 && (
        <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
          <div className="h-full bg-signal-teal transition-all duration-500" style={{ width: `${status.progress}%` }} />
        </div>
      )}

      {showLive && <ExperimentLiveRun experimentId={experimentId} onComplete={handleComplete} />}

      {results && (
        <>
          <div className="bg-surface border border-grid-line rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-signal-teal" />
              <h3 className="font-heading text-sm font-semibold">Model Comparison</h3>
            </div>
            <div className="max-h-96 overflow-y-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-surface">
                  <tr className="border-b border-grid-line">
                    <th className="text-left py-2 text-text-muted text-xs">Model</th>
                    <th className="text-right py-2 text-text-muted text-xs">PEHE</th>
                    <th className="text-right py-2 text-text-muted text-xs">AUUC</th>
                    <th className="text-right py-2 text-text-muted text-xs">Qini</th>
                  </tr>
                </thead>
                <tbody>
                  {results.models.map((m, i) => (
                    <tr key={m.model} className={`border-b border-grid-line/50 ${i === 0 ? 'bg-signal-teal/5' : ''}`}>
                      <td className="py-3 text-text-primary font-medium">{m.model}</td>
                      <td className="py-3 font-stat text-right text-text-primary">{m.pehe?.toFixed(3) ?? '—'}</td>
                      <td className="py-3 font-stat text-right text-signal-teal">{m.auuc?.toFixed(3) ?? '—'}</td>
                      <td className="py-3 font-stat text-right text-intervention-amber">{m.qini?.toFixed(3) ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface border border-grid-line rounded-lg p-4">
            <h3 className="font-heading text-sm font-semibold mb-4">AUUC Comparison</h3>
            <ErrorBarChart
              data={results.models.map((m) => ({
                name: m.model,
                value: m.auuc || 0,
                color: m.model.includes('Causal Forest') ? '#2DD4BF' : '#8B96A8',
              }))}
              height={300}
              showErrorBars={false}
            />
          </div>
        </>
      )}
    </div>
  );
}