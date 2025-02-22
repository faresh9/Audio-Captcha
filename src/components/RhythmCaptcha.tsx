import React, { useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Play, Loader2, Check, X } from 'lucide-react';
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

export const validateRhythm = (
  userTaps: { timestamp: number; interval: number | null }[],
  pattern: number[]
): boolean => {
  if (userTaps.length < pattern.length) return false;

  // Calculate intervals between taps
  const userIntervals = userTaps
    .slice(1)
    .map((tap, i) => tap.timestamp - userTaps[i].timestamp);

  // Normalize intervals to account for tempo differences
  const normalizedUserIntervals = normalizeIntervals(userIntervals);
  const normalizedPattern = normalizeIntervals(pattern);

  // Compare patterns with tolerance
  const tolerance = 0.2; // 20% tolerance for human variation
  const isValid = normalizedUserIntervals.every((interval, i) => {
    const target = normalizedPattern[i];
    return Math.abs(interval - target) <= tolerance;
  });

  // Check for too-perfect timing (bot detection)
  const variance = calculateVariance(userIntervals);
  const isTooPerfect = variance < 0.001; // Threshold for detecting mechanical precision

  return isValid && !isTooPerfect;
};

const normalizeIntervals = (intervals: number[]): number[] => {
  const sum = intervals.reduce((a, b) => a + b, 0);
  return intervals.map((interval) => interval / sum);
};

const calculateVariance = (intervals: number[]): number => {
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const squaredDiffs = intervals.map((x) => Math.pow(x - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / intervals.length;
};

const RhythmCaptcha: React.FC = () => {
  const {
    isPlaying,
    taps,
    pattern,
    isVerifying,
    isPassed,
    setIsPlaying,
    addTap,
    setPattern,
    reset,
    setVerifying,
    setPassed,
  } = useCaptchaStore();

  const generatePattern = useCallback(() => {
    const baseIntervals = [400, 600, 800, 1000];
    const randomVariation = () => (Math.random() - 0.5) * 200;
    const patternLength = Math.floor(Math.random() * 4) + 3;
    return Array.from({ length: patternLength }, () => {
      const interval = baseIntervals[Math.floor(Math.random() * baseIntervals.length)];
      return interval + randomVariation();
    });
  }, []);

  const playBackgroundNoise = useCallback(() => {
    const noise = new Tone.Noise('brown').start();
    noise.connect(Tone.getDestination());
    noise.volume.value = -20; // Adjust volume as needed
    return noise;
  }, []);

  const playPattern = useCallback(async () => {
    await Tone.start();
    const noise = playBackgroundNoise(); // Start background noise
    const synth = new Tone.Synth().toDestination();
    const newPattern = generatePattern();
    setPattern(newPattern);

    setIsPlaying(true);
    newPattern.forEach((interval, i) => {
      Tone.Transport.schedule((time) => {
        synth.triggerAttackRelease('C4', '8n', time);
      }, `+${i * 0.5}`);
    });
    Tone.Transport.start();

    setTimeout(() => {
      setIsPlaying(false);
      Tone.Transport.stop();
      Tone.Transport.cancel();
      noise.dispose(); // Stop the background noise
    }, newPattern.reduce((a, b) => a + b, 0) + 1000);
  }, [generatePattern, setIsPlaying, setPattern, playBackgroundNoise]);

  const handleTap = useCallback(() => {
    if (!isPlaying || isVerifying) return;
    
    const timestamp = Date.now();
    const lastTap = taps[taps.length - 1];
    const interval = lastTap ? timestamp - lastTap.timestamp : null;
    
    addTap({ timestamp, interval });
    
    // Play feedback sound
    const feedbackSynth = new Tone.Synth().toDestination();
    feedbackSynth.triggerAttackRelease('E4', '32n');
  }, [isPlaying, isVerifying, taps, addTap]);

  const verify = useCallback(async () => {
    setVerifying(true);
    
    // Simulate server verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const passed = validateRhythm(taps, pattern);
    setPassed(passed);
    setVerifying(false);
  }, [taps, pattern, setPassed, setVerifying]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleTap]);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-blue-100 rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Rhythm Verification</h2>
        <p className="text-gray-600">Tap along with the rhythm to verify you're human</p>
      </div>

      <div className="space-y-6">
        <button
          onClick={playPattern}
          disabled={isPlaying || isVerifying}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Play size={20} />
          Play Pattern
        </button>

        <button
          onClick={handleTap}
          disabled={!isPlaying || isVerifying}
          className="w-full h-32 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isPlaying ? (
            <span className="text-lg font-medium text-gray-600">Tap Here or Press Space</span>
          ) : (
            <span className="text-lg font-medium text-gray-400">Listen to the pattern first</span>
          )}
        </button>

        {taps.length > 0 && !isPlaying && !isVerifying && isPassed === null && (
          <button
            onClick={verify}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            Verify
          </button>
        )}

        {isVerifying && (
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Loader2 className="animate-spin" />
            Verifying...
          </div>
        )}

        {isPassed !== null && (
          <div className={`flex items-center justify-center gap-2 text-lg font-medium ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
            {isPassed ? (
              <>
                <Check />
                Verification Successful
              </>
            ) : (
              <>
                <X />
                Verification Failed
              </>
            )}
          </div>
        )}

        {(isPassed !== null || taps.length > 0) && !isVerifying && (
          <button
            onClick={reset}
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default RhythmCaptcha;