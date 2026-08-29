'use client';

import { useEffect, useState } from 'react';
import { getUser, getUserInteractions, UserDetail, UserInteraction } from '@/lib/api/users';
import { getValueBreakdown, ValueBreakdown } from '@/lib/api/value';
import { getIte } from '@/lib/api/causal';
import RadarPreference from '@/components/charts/RadarPreference';
import AreaChartDrift from '@/components/charts/AreaChartDrift';
import DataTable from '@/components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, TrendingUp } from 'lucide-react';

export default function UserDetailPage({ userId }: { userId: string }) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [value, setValue] = useState<ValueBreakdown | null>(null);
  const [ite, setIte] = useState<{ ite: number; confidence_interval: [number, number]; treatment: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [u, i, v, it] = await Promise.all([
        getUser(userId),
        getUserInteractions(userId, { limit: 20 }),
        getValueBreakdown(userId),
        getIte(userId),
      ]);
      setUser(u);
      setInteractions(i);
      setValue(v);
      setIte(it);
      setLoading(false);
    }
    load();
  }, [userId]);

  const radarData = user ? Object.entries(user.preference_vector).map(([k, v]) => ({ subject: k, value: v })) : [];

  const intColumns: ColumnDef<UserInteraction, unknown>[] = [
    { accessorKey: 'timestamp', header: 'Time', cell: ({ row }) => <span className="font-stat text-xs text-text-muted">{new Date(row.original.timestamp).toLocaleString()}</span> },
    { accessorKey: 'item_id', header: 'Item', cell: ({ row }) => <span className="font-stat text-xs">{row.original.item_id}</span> },
    { accessorKey: 'event_type', header: 'Event', cell: ({ row }) => <span className={`text-xs ${row.original.event_type === 'watch' ? 'text-signal-teal' : row.original.event_type === 'like' ? 'text-intervention-amber' : 'text-text-muted'}`}>{row.original.event_type}</span> },
    { accessorKey: 'watch_duration', header: 'Duration', cell: ({ row }) => <span className="font-stat text-xs">{Math.floor(row.original.watch_duration / 60)}m {row.original.watch_duration % 60}s</span> },
  ];

  if (loading || !user || !value) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>;

  const valueData = Object.entries(value.components).map(([k, v]) => ({ name: k.replace(/_/g, ' '), value: v, color: v > 0.1 ? '#2DD4BF' : '#8B96A8' }));

  return (
    <div className="space-y-6">
      <a href="#/users" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-signal-teal transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </a>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-surface border border-grid-line flex items-center justify-center font-heading font-bold text-signal-teal">
          {userId.slice(-2).toUpperCase()}
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-text-primary">{userId}</h2>
          {ite && <div className="flex items-center gap-2 mt-1"><TrendingUp className="w-3 h-3 text-signal-teal" /><span className="font-stat text-xs text-signal-teal">ITE: {ite.ite.toFixed(3)}</span><span className="text-xs text-text-muted">[{ite.confidence_interval[0].toFixed(3)}, {ite.confidence_interval[1].toFixed(3)}]</span></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <div className="text-xs text-text-muted">Total Value Score</div>
          <div className="font-stat text-2xl font-bold text-signal-teal mt-1">{value.total.toFixed(3)}</div>
        </div>
        <div className="bg-surface border border-grid-line rounded-lg p-4 col-span-2">
          <div className="text-xs text-text-muted mb-2">Value Breakdown</div>
          <div className="space-y-1.5">
            {valueData.map((v) => (
              <div key={v.name} className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-bg overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${(v.value / value.total) * 100}%`, backgroundColor: v.color }} /></div>
                <span className="text-[10px] text-text-muted w-28 truncate">{v.name}</span>
                <span className="font-stat text-[10px] text-text-primary w-10 text-right">{v.value.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <h3 className="font-heading text-sm font-semibold mb-4">Preference Profile</h3>
          <RadarPreference data={radarData} height={300} />
        </div>
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <h3 className="font-heading text-sm font-semibold mb-4">Recent Interactions</h3>
          <DataTable columns={intColumns} data={interactions as any} maxHeight="max-h-[300px]" emptyMessage="No interactions recorded" />
        </div>
      </div>
    </div>
  );
}
