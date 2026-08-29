'use client';

import { useEffect, useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface Props {
  data: Array<{ subject: string; value: number; fullMark?: number }>;
  title?: string;
  height?: number;
  color?: string;
}

export default function RadarPreference({
  data,
  title,
  height = 300,
  color = '#2DD4BF',
}: Props) {
  const [animate, setAnimate] = useState(true);
  const prefersReduced = usePrefersReducedMotion();

  const shouldAnimate = animate && !prefersReduced;

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(false), 1500);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <div className="w-full">
      {title && (
        <h3 className="font-heading text-sm font-semibold text-text-primary mb-3">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#1E2735" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#8B96A8', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 1]}
            tick={{ fill: '#8B96A8', fontSize: 10 }}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#121826',
              border: '1px solid #1E2735',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Radar
            name="Preference"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.2}
            isAnimationActive={shouldAnimate}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
