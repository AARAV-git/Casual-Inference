import { create } from 'zustand';

interface DatasetStore {
  selectedDatasetId: string | null;
  selectedTreatment: string | null;
  selectedOutcome: string | null;
  selectedConfounders: string[];
  setDataset: (id: string) => void;
  setTreatment: (t: string) => void;
  setOutcome: (o: string) => void;
  setConfounders: (c: string[]) => void;
  reset: () => void;
}

export const useDatasetStore = create<DatasetStore>((set) => ({
  selectedDatasetId: null,
  selectedTreatment: null,
  selectedOutcome: null,
  selectedConfounders: [],
  setDataset: (id) => set({ selectedDatasetId: id }),
  setTreatment: (t) => set({ selectedTreatment: t }),
  setOutcome: (o) => set({ selectedOutcome: o }),
  setConfounders: (c) => set({ selectedConfounders: c }),
  reset: () => set({ selectedDatasetId: null, selectedTreatment: null, selectedOutcome: null, selectedConfounders: [] }),
}));
