'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart as RechartsArea,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface DataPoint {
  period: string;
  drift: number;
  [key: string]: string | number;
}

interface Props {
  data: DataPoint[];
  xKey?: string;
  yKey?: string;
  color?: string;
  title?: string;
  height?: number;
  secondYKey?: string;
  secondColor?: string;
}

export default function AreaChartDrift({
  data,
  xKey = 'period',
  yKey = 'drift',
  color = '#2DD4BF',
  title,
  height = 300,
  secondYKey,
  secondColor = '#F5A623',
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
        <h3 className="font-heading text-sm font-semibold text-text-primary mb-3">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsArea data={data}>
          <defs>
            <linearGradient id={`grad-${yKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
            {secondYKey && (
              <linearGradient id={`grad-${secondYKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={secondColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={secondColor} stopOpacity={0} />
              </linearGradient>
            )}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2735" />
          <XAxis dataKey={xKey} tick={{ fill: '#8B96A8', fontSize: 11 }} axisLine={{ stroke: '#1E2735' }} />
          <YAxis tick={{ fill: '#8B96A8', fontSize: 11 }} axisLine={{ stroke: '#1E2735' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#121826',
              border: '1px solid #1E2735',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#E7ECF3' }}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${yKey})`}
            isAnimationActive={shouldAnimate}
          />
          {secondYKey && (
            <Area
              type="monotone"
              dataKey={secondYKey}
              stroke={secondColor}
              strokeWidth={2}
              fill={`url(#grad-${secondYKey})`}
              isAnimationActive={shouldAnimate}
            />
          )}
        </RechartsArea>
      </ResponsiveContainer>
    </div>
  );
}
