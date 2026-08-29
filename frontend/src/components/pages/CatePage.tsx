'use client';

import { useEffect, useState } from 'react';
import { getCate, CateResult } from '@/lib/api/causal';
import { useDatasetStore } from '@/store/datasetStore';
import ErrorBarChart from '@/components/charts/ErrorBarChart';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3 } from 'lucide-react';

export default function CatePage() {
  const [cate, setCate] = useState<CateResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCate({ experiment_id: 'exp-causal-001' }).then((d) => {
      setCate(d);
      setLoading(false);
    });
  }, []);

  const chartData = cate?.segments.map((s) => ({
    name: s.segment,
    value: s.cate,
    color: s.cate > 0.4 ? '#2DD4BF' : s.cate > 0.2 ? '#F5A623' : '#8B96A8',
  })) || [];

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-grid-line rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-signal-teal" />
          <h3 className="font-heading text-sm font-semibold">Conditional Average Treatment Effects</h3>
        </div>
        <ErrorBarChart data={chartData} height={400} showErrorBars={false} title="CATE by User Segment" />
      </div>
      {cate && (
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <h3 className="font-heading text-sm font-semibold mb-3">Segment Details</h3>
          <div className="max-h-64 overflow-y-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-grid-line">
                  <th className="text-left py-2 text-text-muted text-xs">Segment</th>
                  <th className="text-right py-2 text-text-muted text-xs">CATE</th>
                  <th className="text-right py-2 text-text-muted text-xs">Magnitude</th>
                </tr>
              </thead>
              <tbody>
                {cate.segments.map((s) => (
                  <tr key={s.segment} className="border-b border-grid-line/50">
                    <td className="py-2 text-text-primary">{s.segment}</td>
                    <td className="py-2 font-stat text-right text-signal-teal">{s.cate.toFixed(3)}</td>
                    <td className="py-2 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.cate > 0.4 ? 'bg-signal-teal/15 text-signal-teal' : s.cate > 0.2 ? 'bg-intervention-amber/15 text-intervention-amber' : 'bg-surface-hover text-text-muted'}`}>
                        {s.cate > 0.4 ? 'High' : s.cate > 0.2 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}