'use client';

import { useEffect, useState } from 'react';
import { getDataset, getDatasetStatistics, Dataset, DatasetStatistics } from '@/lib/api/datasets';
import { listInterventions, getInterventionStatistics } from '@/lib/api/interventions';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import ErrorBarChart from '@/components/charts/ErrorBarChart';
import { ArrowLeft, FileText, BarChart3 } from 'lucide-react';

export default function DatasetDetailPage({ datasetId }: { datasetId: string }) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [stats, setStats] = useState<DatasetStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [d, s] = await Promise.all([getDataset(datasetId), getDatasetStatistics(datasetId)]);
      setDataset(d);
      setStats(s);
      setLoading(false);
    }
    load();
  }, [datasetId]);

  if (loading || !dataset || !stats) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  const treatmentChartData = Object.entries(stats.treatment_distribution).map(([name, value]) => ({ name, value }));
  const missingChartData = Object.entries(stats.missing_values).map(([name, value]) => ({ name, value, color: value > 100 ? '#F2555A' : '#2DD4BF' }));

  return (
    <div className="space-y-6">
      <a href="#/datasets" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-signal-teal transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Datasets
      </a>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-surface border border-grid-line flex items-center justify-center">
          <FileText className="w-5 h-5 text-signal-teal" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-text-primary">{dataset.name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-stat text-xs text-text-muted">{dataset.id}</span>
            <Badge variant="outline" className="border-signal-teal text-signal-teal text-xs">{dataset.type}</Badge>
            <Badge variant="outline" className="border-text-muted text-text-muted text-xs">{dataset.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-signal-teal" />
            <h3 className="font-heading text-sm font-semibold">Schema</h3>
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface">
                <tr className="border-b border-grid-line">
                  <th className="text-left py-2 text-text-muted text-xs">Field</th>
                  <th className="text-left py-2 text-text-muted text-xs">Type</th>
                </tr>
              </thead>
              <tbody>
                {stats.schema.map((f) => (
                  <tr key={f.field} className="border-b border-grid-line/50">
                    <td className="py-2 font-stat text-xs text-text-primary">{f.field}</td>
                    <td className="py-2 text-xs text-text-muted">{f.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <h3 className="font-heading text-sm font-semibold mb-4">Treatment Distribution</h3>
          <ErrorBarChart data={treatmentChartData} height={250} showErrorBars={false} />
        </div>
      </div>

      <div className="bg-surface border border-grid-line rounded-lg p-4">
        <h3 className="font-heading text-sm font-semibold mb-4">Missing Values</h3>
        <ErrorBarChart data={missingChartData} height={200} showErrorBars={false} />
      </div>
    </div>
  );
}