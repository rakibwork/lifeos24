export interface SoundSettings {
  namaz: boolean;
  medicine: boolean;
  task: boolean;
  sleep: boolean;
  water: boolean;
}

export const defaultSoundSettings: SoundSettings = {
  namaz: true,
  medicine: true,
  task: false,
  sleep: true,
  water: false,
};

// Generate a pleasant notification sound using Web Audio API
export function playNotificationSound(type: 'gentle' | 'alert' | 'reminder' = 'gentle'): void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    if (type === 'gentle') {
      const playNote = (freq: number, start: number, duration: number, gain: number) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        g.gain.setValueAtTime(0, ctx.currentTime + start);
        g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      playNote(523.25, 0, 0.4, 0.3);
      playNote(659.25, 0.15, 0.4, 0.25);
      playNote(783.99, 0.3, 0.6, 0.2);
    } else if (type === 'alert') {
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        g.gain.setValueAtTime(0, ctx.currentTime + start);
        g.gain.linearRampToValueAtTime(0.35, ctx.currentTime + start + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      playNote(880, 0, 0.2);
      playNote(1046.5, 0.2, 0.3);
      playNote(880, 0.5, 0.2);
      playNote(1046.5, 0.7, 0.4);
    } else {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(698.46, ctx.currentTime);
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    }

    setTimeout(() => ctx.close(), 2000);
  } catch (e) {
    console.warn('Sound playback failed:', e);
  }
}
