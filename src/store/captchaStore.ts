import { create } from 'zustand';

interface Tap {
  timestamp: number;
  interval: number | null;
}

interface CaptchaState {
  isPlaying: boolean;
  taps: Tap[];
  pattern: number[];
  isVerifying: boolean;
  isPassed: boolean | null;
  setIsPlaying: (isPlaying: boolean) => void;
  addTap: (tap: Tap) => void;
  setPattern: (pattern: number[]) => void;
  reset: () => void;
  setVerifying: (isVerifying: boolean) => void;
  setPassed: (isPassed: boolean) => void;
}

export const useCaptchaStore = create<CaptchaState>((set) => ({
  isPlaying: false,
  taps: [],
  pattern: [],
  isVerifying: false,
  isPassed: null,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  addTap: (tap) => set((state) => ({ taps: [...state.taps, tap] })),
  setPattern: (pattern) => set({ pattern }),
  reset: () => set({ taps: [], isPlaying: false, isPassed: null, isVerifying: false }),
  setVerifying: (isVerifying) => set({ isVerifying }),
  setPassed: (isPassed) => set({ isPassed }),
}));