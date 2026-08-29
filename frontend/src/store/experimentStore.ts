import { create } from 'zustand';

export interface ProgressEntry {
  phase: string;
  status: string;
  progress: number;
}

interface ExperimentStore {
  activeExperimentId: string | null;
  progress: ProgressEntry[];
  isActive: boolean;
  setExperiment: (id: string) => void;
  addProgress: (entry: ProgressEntry) => void;
  clearProgress: () => void;
  setActive: (active: boolean) => void;
}

export const useExperimentStore = create<ExperimentStore>((set) => ({
  activeExperimentId: null,
  progress: [],
  isActive: false,
  setExperiment: (id) => set({ activeExperimentId: id, progress: [] }),
  addProgress: (entry) => set((s) => ({ progress: [...s.progress, entry] })),
  clearProgress: () => set({ progress: [], activeExperimentId: null, isActive: false }),
  setActive: (active) => set({ isActive: active }),
}));
