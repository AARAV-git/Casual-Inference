'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ErrorBar,
} from 'recharts';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface DataPoint {
  name: string;
  value: number;
  ci_low?: number;
  ci_high?: number;
  color?: string;
  [key: string]: unknown;
}

interface Props {
  data: DataPoint[];
  title?: string;
  height?: number;
  xKey?: string;
  yKey?: string;
  barColor?: string;
  showErrorBars?: boolean;
}

export default function ErrorBarChart({
  data,
  title,
  height = 300,
  xKey = 'name',
  yKey = 'value',
  barColor = '#2DD4BF',
  showErrorBars = true,
}: Props) {
  const [animate, setAnimate] = useState(true);
  const prefersReduced = usePrefersReducedMotion();

  const shouldAnimate = animate && !prefersReduced;

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(false), 1500);
    return () => clearTimeout(timer);
  }, [data]);

  const hasErrorBars = showErrorBars && data.some((d) => d.ci_low != null && d.ci_high != null);

  return (
    <div className="w-full">
      {title && (
        <h3 className="font-heading text-sm font-semibold text-text-primary mb-3">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2735" />
          <XAxis
            dataKey={xKey}
            tick={{ fill: '#8B96A8', fontSize: 11 }}
            axisLine={{ stroke: '#1E2735' }}
          />
          <YAxis
            tick={{ fill: '#8B96A8', fontSize: 11 }}
            axisLine={{ stroke: '#1E2735' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#121826',
              border: '1px solid #1E2735',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#E7ECF3' }}
            formatter={(value: number) => [value.toFixed(3), '']}
          />
          <Bar
            dataKey={yKey}
            isAnimationActive={shouldAnimate}
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.color || barColor}
                fillOpacity={0.85}
              />
            ))}
            {hasErrorBars && (
              <ErrorBar dataKey="ci_high" width={4} strokeWidth={2} />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
