'use client';

import { useEffect, useState } from 'react';
import { listUsers, UserListItem } from '@/lib/api/users';
import DataTable from '@/components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

export default function UsersPage() {
  const [data, setData] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listUsers().then((d) => { setData(d); setLoading(false); });
  }, []);

  const columns: ColumnDef<UserListItem, unknown>[] = [
    { accessorKey: 'id', header: 'ID', cell: ({ row }) => <a href={`#/users/${row.original.id}`} className="font-stat text-xs text-signal-teal hover:underline">{row.original.id}</a> },
    { accessorKey: 'activity_level', header: 'Activity', cell: ({ row }) => {
      const c = row.original.activity_level === 'high' ? 'bg-signal-teal/15 text-signal-teal' : row.original.activity_level === 'medium' ? 'bg-intervention-amber/15 text-intervention-amber' : 'bg-surface-hover text-text-muted';
      return <Badge variant="outline" className={`${c} text-xs border-transparent`}>{row.original.activity_level}</Badge>;
    }},
    { accessorKey: 'subscription_type', header: 'Subscription', cell: ({ row }) => <span className="text-text-primary">{row.original.subscription_type}</span> },
  ];

  if (loading) return <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Users className="w-5 h-5 text-signal-teal" />
        <span className="text-text-muted text-sm">{data.length} users</span>
      </div>
      <DataTable columns={columns} data={data as any} searchable searchKey="id" />
    </div>
  );
}