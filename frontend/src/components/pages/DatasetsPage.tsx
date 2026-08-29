'use client';

import { useEffect, useState } from 'react';
import { listDatasets, Dataset } from '@/lib/api/datasets';
import DataTable from '@/components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';

export default function DatasetsPage() {
  const [data, setData] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDatasets().then((d) => { setData(d); setLoading(false); });
  }, []);

  const columns: ColumnDef<Dataset, unknown>[] = [
    { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-stat text-xs text-text-muted">{row.original.id}</span> },
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => <a href={`#/datasets/${row.original.id}`} className="text-signal-teal hover:underline">{row.original.name}</a> },
    { accessorKey: 'type', header: 'Type', cell: ({ row }) => <span className="font-stat text-xs">{row.original.type}</span> },
    { accessorKey: 'has_ground_truth', header: 'Ground Truth', cell: ({ row }) => row.original.has_ground_truth ? <Badge variant="outline" className="border-signal-teal text-signal-teal text-xs">Yes</Badge> : <Badge variant="outline" className="border-text-muted text-text-muted text-xs">No</Badge> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => {
      const c = row.original.status === 'ready' ? 'border-signal-teal text-signal-teal' : 'border-intervention-amber text-intervention-amber';
      return <Badge variant="outline" className={`${c} text-xs`}>{row.original.status}</Badge>;
    }},
    { accessorKey: 'created_at', header: 'Created', cell: ({ row }) => <span className="font-stat text-xs text-text-muted">{new Date(row.original.created_at).toLocaleDateString()}</span> },
  ];

  if (loading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Database className="w-5 h-5 text-signal-teal" />
        <span className="text-text-muted text-sm">{data.length} datasets</span>
      </div>
      <DataTable columns={columns} data={data as any} searchable searchKey="name" />
    </div>
  );
}
