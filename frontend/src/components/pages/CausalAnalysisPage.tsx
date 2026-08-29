'use client';

import { useState } from 'react';
import EstimatorConfigForm from '@/components/forms/EstimatorConfigForm';
import CausalGraph3D from '@/components/CausalGraph3D';
import ErrorBarChart from '@/components/charts/ErrorBarChart';
import { useDatasetStore } from '@/store/datasetStore';
import { listDatasets } from '@/lib/api/datasets';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CausalAnalysisPage() {
  const { selectedDatasetId, setDataset } = useDatasetStore();
  const [datasets, setDatasets] = useState<Array<{ id: string; name: string }>>([]);
  const [estimateResult, setEstimateResult] = useState<any>(null);
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDatasets().then((d) => {
      setDatasets(d.map((ds) => ({ id: ds.id, name: ds.name })));
      if (d.length > 0) setDataset(d[0].id);
      setLoading(false);
    });
  }, [setDataset]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <Label className="text-text-muted text-xs">Dataset</Label>
        <Select value={selectedDatasetId || ''} onValueChange={setDataset}>
          <SelectTrigger className="bg-surface border-grid-line text-text-primary">
            <SelectValue placeholder="Select dataset" />
          </SelectTrigger>
          <SelectContent>
            {datasets.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <CausalGraph3D
            mode="interactive"
            highlightedNodeId={highlightedNode}
            onNodeClick={setHighlightedNode}
          />
          {estimateResult && (
            <div className="bg-surface border border-grid-line rounded-lg p-4 space-y-3">
              <h3 className="font-heading text-sm font-semibold">Estimation Result</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-text-muted">ATE</div>
                  <div className="font-stat text-2xl font-bold text-signal-teal">{estimateResult.ate.toFixed(3)}</div>
                </div>
                <div>
                  <div className="text-xs text-text-muted">Sample Size</div>
                  <div className="font-stat text-2xl font-bold text-text-primary">{estimateResult.sample_size.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-text-muted">95% CI</div>
                  <div className="font-stat text-sm text-text-primary">
                    [{estimateResult.confidence_interval[0].toFixed(3)}, {estimateResult.confidence_interval[1].toFixed(3)}]
                  </div>
                </div>
                <div>
                  <div className="text-xs text-text-muted">Estimator</div>
                  <div className="text-sm text-text-primary">{estimateResult.estimator}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <h3 className="font-heading text-sm font-semibold mb-4">Configure Estimation</h3>
          <EstimatorConfigForm
            onResult={setEstimateResult}
            onNodeHighlight={setHighlightedNode}
          />
        </div>
      </div>
    </div>
  );
}
