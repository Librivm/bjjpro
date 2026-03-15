import { useRef, useCallback } from "react";

export function useAudio(volume = 0.7) {
  const ctx = useRef(null);
  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctx.current;
  };

  const unlockAudio = useCallback(() => {
    try { const ac = getCtx(); if (ac.state === "suspended") ac.resume(); } catch(e) {}
  }, []);

  const playBeep = useCallback((freq, startTime, dur, vol = volume) => {
    try {
      const ac = getCtx();
      if (ac.state === "suspended") ac.resume();
      const osc = ac.createOscillator(), gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.type = "square"; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.005);
      gain.gain.setValueAtTime(vol, startTime + dur - 0.01);
      gain.gain.linearRampToValueAtTime(0, startTime + dur);
      osc.start(startTime); osc.stop(startTime + dur + 0.02);
    } catch(e) {}
  }, [volume]);

  const ringRoundEnd = useCallback(() => {
    const ac = getCtx(); if (ac.state === "suspended") ac.resume();
    const t = ac.currentTime;
    playBeep(900, t, 0.12, Math.min(volume * 1.4, 1));
    playBeep(900, t + 0.18, 0.12, Math.min(volume * 1.4, 1));
    playBeep(900, t + 0.36, 0.18, Math.min(volume * 1.4, 1));
  }, [playBeep, volume]);

  const ringRoundStart = useCallback(() => {
    const ac = getCtx(); if (ac.state === "suspended") ac.resume();
    const t = ac.currentTime;
    playBeep(700, t, 0.1, Math.min(volume * 1.2, 1));
    playBeep(1050, t + 0.15, 0.15, Math.min(volume * 1.2, 1));
  }, [playBeep, volume]);

  return { ringRoundEnd, ringRoundStart, unlockAudio };
}
