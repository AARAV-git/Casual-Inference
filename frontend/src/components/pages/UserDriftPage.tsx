'use client';

import { useEffect, useState } from 'react';
import { getUserDrift } from '@/lib/api/drift';
import { getUser, UserDetail } from '@/lib/api/users';
import AreaChartDrift from '@/components/charts/AreaChartDrift';
import RadarPreference from '@/components/charts/RadarPreference';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

export default function UserDriftPage({ userId }: { userId: string }) {
  const [drift, setDrift] = useState<Array<{ period: string; drift: number }>>([]);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [d, u] = await Promise.all([getUserDrift(userId), getUser(userId)]);
      setDrift(d);
      setUser(u);
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading || !user) return <div className="space-y-4"><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>;

  const radarData = Object.entries(user.preference_vector).map(([k, v]) => ({ subject: k, value: v }));

  return (
    <div className="space-y-6">
      <a href="#/behavioral-drift" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-signal-teal transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Behavioral Drift
      </a>
      <h2 className="font-heading text-xl font-bold text-text-primary">User {userId}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <h3 className="font-heading text-sm font-semibold mb-4">Behavioral Drift Timeline</h3>
          <AreaChartDrift data={drift} height={250} />
        </div>
        <div className="bg-surface border border-grid-line rounded-lg p-4">
          <h3 className="font-heading text-sm font-semibold mb-4">Preference Profile</h3>
          <RadarPreference data={radarData} height={300} />
        </div>
      </div>
    </div>
  );
}