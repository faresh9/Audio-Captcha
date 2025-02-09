import React, { useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { Play, Loader2, Check, X } from 'lucide-react';
import { useCaptchaStore } from '../store/captchaStore';
import { validateRhythm } from '../utils/rhythmValidator';

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
    // Generate a random rhythm pattern (intervals in milliseconds)
    const baseIntervals = [400, 600, 400, 600];
    const randomVariation = () => (Math.random() - 0.5) * 100;
    return baseIntervals.map(interval => interval + randomVariation());
  }, []);

  const playPattern = useCallback(async () => {
    await Tone.start();
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
    }, newPattern.reduce((a, b) => a + b, 0) + 1000);
  }, [generatePattern, setIsPlaying, setPattern]);

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
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
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