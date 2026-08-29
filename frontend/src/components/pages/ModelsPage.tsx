'use client';

import { useEffect, useState } from 'react';
import { listModels, Model } from '@/lib/api/models';
import DataTable from '@/components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Boxes } from 'lucide-react';

export default function ModelsPage() {
  const [data, setData] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listModels().then((d) => { setData(d); setLoading(false); });
  }, []);

  const columns: ColumnDef<Model, unknown>[] = [
    { accessorKey: 'name', header: 'Model', cell: ({ row }) => <a href={`#/models/${row.original.id}`} className="text-signal-teal hover:underline font-medium">{row.original.name}</a> },
    { accessorKey: 'version', header: 'Version', cell: ({ row }) => <span className="font-stat text-xs text-text-muted">{row.original.version}</span> },
    { accessorKey: 'dataset_id', header: 'Dataset', cell: ({ row }) => <span className="font-stat text-xs text-text-muted">{row.original.dataset_id}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => {
      const c = row.original.status === 'deployed' ? 'border-signal-teal text-signal-teal' : row.original.status === 'training' ? 'border-intervention-amber text-intervention-amber' : 'border-text-muted text-text-muted';
      return <Badge variant="outline" className={`${c} text-xs`}>{row.original.status}</Badge>;
    }},
  ];

  if (loading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Boxes className="w-5 h-5 text-signal-teal" />
        <span className="text-text-muted text-sm">{data.length} models</span>
      </div>
      <DataTable columns={columns} data={data as any} searchable searchKey="name" />
    </div>
  );
}
