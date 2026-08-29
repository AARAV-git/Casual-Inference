'use client';

import { useEffect, useRef, useState } from 'react';
import { subscribeToProgress } from '@/lib/api/experiments';
import { useExperimentStore } from '@/store/experimentStore';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  experimentId: string;
  onComplete?: () => void;
}

export default function ExperimentLiveRun({ experimentId, onComplete }: Props) {
  const { addProgress, progress } = useExperimentStore();
  const [done, setDone] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsub = subscribeToProgress(experimentId, (data) => {
      addProgress({
        phase: data.phase || data.message || 'Processing',
        status: data.status || 'running',
        progress: data.progress ?? 0,
      });
      if (data.status === 'completed') {
        setDone(true);
        onComplete?.();
      }
    });
    unsubRef.current = unsub;
    return () => unsub();
  }, [experimentId, addProgress, onComplete]);

  const statusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-signal-teal" />;
    if (status === 'running') return <Loader2 className="w-4 h-4 text-intervention-amber animate-spin" />;
    return <Circle className="w-4 h-4 text-text-muted" />;
  };

  if (done && progress.length > 0) {
    return (
      <div className="p-4 rounded-lg bg-signal-teal/5 border border-signal-teal/20">
        <div className="flex items-center gap-2 text-signal-teal font-medium text-sm">
          <CheckCircle2 className="w-5 h-5" />
          Experiment Complete
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {progress.map((entry, i) => (
          <motion.div
            key={`${entry.phase}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface border border-grid-line"
          >
            {statusIcon(entry.status)}
            <span className="text-sm text-text-primary flex-1">{entry.phase}</span>
            <span className="font-stat text-xs text-text-muted">{entry.progress}%</span>
          </motion.div>
        ))}
      </AnimatePresence>
      {!done && (
        <div className="flex items-center gap-2 text-text-muted text-xs">
          <Loader2 className="w-3 h-3 animate-spin" />
          Waiting for updates...
        </div>
      )}
    </div>
  );
}
