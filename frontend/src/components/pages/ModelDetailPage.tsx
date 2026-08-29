'use client';

import { useEffect, useState } from 'react';
import { getModel, getModelMetrics, Model } from '@/lib/api/models';
import ErrorBarChart from '@/components/charts/ErrorBarChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Boxes } from 'lucide-react';

export default function ModelDetailPage({ modelId }: { modelId: string }) {
  const [model, setModel] = useState<Model | null>(null);
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [m, mt] = await Promise.all([getModel(modelId), getModelMetrics(modelId)]);
      setModel(m);
      setMetrics(mt);
      setLoading(false);
    }
    load();
  }, [modelId]);

  if (loading || !model || !metrics) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  const metricsData = Object.entries(metrics).map(([k, v]) => ({
    name: k,
    value: typeof v === 'number' ? v : 0,
    color: k.includes('pehe') ? '#F2555A' : k.includes('auuc') || k.includes('qini') ? '#2DD4BF' : '#F5A623',
  }));

  const hyperparams = model.hyperparameters as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <a href="#/models" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-signal-teal transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Models
      </a>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-surface border border-grid-line flex items-center justify-center">
          <Boxes className="w-5 h-5 text-signal-teal" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-text-primary">{model.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-stat text-xs text-text-muted">v{model.version}</span>
            <Badge variant="outline" className="border-signal-teal text-signal-teal text-xs">{model.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <h3 className="font-heading text-sm font-semibold mb-4">Performance Metrics</h3>
          <ErrorBarChart data={metricsData} height={250} showErrorBars={false} />
        </div>
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <h3 className="font-heading text-sm font-semibold mb-4">Hyperparameters</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
            {Object.entries(hyperparams).map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-grid-line/50">
                <span className="text-sm text-text-muted">{k}</span>
                <span className="font-stat text-sm text-text-primary">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-grid-line rounded-lg p-4">
        <h3 className="font-heading text-sm font-semibold mb-2">Raw Metrics</h3>
        <pre className="font-stat text-xs text-text-muted bg-bg p-3 rounded-lg overflow-x-auto scrollbar-thin">{JSON.stringify(metrics, null, 2)}</pre>
      </div>
    </div>
  );
}