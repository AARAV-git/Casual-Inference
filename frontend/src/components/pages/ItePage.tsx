'use client';

import { useEffect, useState } from 'react';
import { getIte, IteResult } from '@/lib/api/causal';
import { getUserDrift } from '@/lib/api/drift';
import { getUser, UserDetail } from '@/lib/api/users';
import AreaChartDrift from '@/components/charts/AreaChartDrift';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

export default function ItePage({ userId }: { userId: string }) {
  const [ite, setIte] = useState<IteResult | null>(null);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [drift, setDrift] = useState<Array<{ period: string; drift: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [i, u, d] = await Promise.all([getIte(userId), getUser(userId), getUserDrift(userId)]);
      setIte(i);
      setUser(u);
      setDrift(d);
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading || !ite) {
    return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <a href="#/causal-analysis" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-signal-teal transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Causal Analysis
      </a>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <div className="text-xs text-text-muted">User</div>
          <div className="font-stat text-lg font-bold text-text-primary mt-1">{ite.user_id}</div>
        </div>
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <div className="text-xs text-text-muted">Individual Treatment Effect</div>
          <div className="font-stat text-2xl font-bold text-signal-teal mt-1">{ite.ite.toFixed(3)}</div>
        </div>
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <div className="text-xs text-text-muted">95% Confidence Interval</div>
          <div className="font-stat text-lg font-bold text-text-primary mt-1">
            [{ite.confidence_interval[0].toFixed(3)}, {ite.confidence_interval[1].toFixed(3)}]
          </div>
        </div>
      </div>

      <div className="bg-surface border border-grid-line rounded-lg p-4">
        <h3 className="font-heading text-sm font-semibold mb-4">User Drift Timeline</h3>
        <AreaChartDrift data={drift} height={250} />
      </div>
    </div>
  );
}
