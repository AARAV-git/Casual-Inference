'use client';

import { useEffect, useState } from 'react';
import { getSummary } from '@/lib/api/dashboard';
import { getPopulationDrift } from '@/lib/api/drift';
import { Skeleton } from '@/components/ui/skeleton';
import AreaChartDrift from '@/components/charts/AreaChartDrift';
import CausalGraph3D from '@/components/CausalGraph3D';
import { Users, MousePointerClick, FlaskConical, TrendingUp, Waves, Brain } from 'lucide-react';
import dynamic from 'next/dynamic';

function StatCard({ icon: Icon, label, value, color, suffix = '' }: {
  icon: React.ElementType; label: string; value: number | string; color: string; suffix?: string;
}) {
  return (
    <div className="bg-surface border border-grid-line rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-xs text-text-muted">{label}</div>
          <div className="font-stat text-xl font-bold text-text-primary">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix && <span className="text-sm text-text-muted ml-1">{suffix}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getSummary>> | null>(null);
  const [driftData, setDriftData] = useState<{ timeline: Array<{ period: string; drift: number }> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, d] = await Promise.all([
        getSummary(),
        getPopulationDrift({ dataset_id: 'ds-001' }),
      ]);
      setSummary(s);
      setDriftData(d);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !summary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Users" value={summary.users} color="bg-signal-teal/20" />
        <StatCard icon={MousePointerClick} label="Interactions" value={summary.interactions} color="bg-intervention-amber/20" />
        <StatCard icon={FlaskConical} label="Experiments" value={summary.experiments} color="bg-purple-500/20" />
        <StatCard icon={TrendingUp} label="Est. ATE" value={summary.estimated_ate} suffix="effect" color="bg-signal-teal/20" />
        <StatCard icon={Waves} label="Behavioral Drift" value={summary.behavioral_drift} color="bg-danger-red/20" />
        <StatCard icon={Brain} label="AI-Induced Drift" value={summary.ai_induced_drift} color="bg-intervention-amber/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <h3 className="font-heading text-sm font-semibold text-text-primary mb-4">Population Drift Over Time</h3>
          {driftData && <AreaChartDrift data={driftData.timeline} height={250} />}
        </div>
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <h3 className="font-heading text-sm font-semibold text-text-primary mb-4">Causal Graph</h3>
          <CausalGraph3D mode="ambient" />
        </div>
      </div>
    </div>
  );
}
