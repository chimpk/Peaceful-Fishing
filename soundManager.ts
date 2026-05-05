
class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private getCtx(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3;
    } catch (e) {
      // Âm thanh không khả dụng, bỏ qua
    }
    return this.ctx;
  }

  playSplash() {
    try {
      const ctx = this.getCtx();
      if (!ctx || !this.masterGain) return;
      const bufferSize = Math.floor(ctx.sampleRate * 0.5);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
      noise.stop(ctx.currentTime + 0.5);
    } catch (e) { /* bỏ qua */ }
  }

  playReel(tension: number) {
    try {
      const ctx = this.getCtx();
      if (!ctx || !this.masterGain) return;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 40 + tension * 100;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) { /* bỏ qua */ }
  }

  playSuccess() {
    try {
      const ctx = this.getCtx();
      const masterGain = this.masterGain;
      if (!ctx || !masterGain) return;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        try {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.35);
        } catch (e2) { /* bỏ qua */ }
      });
    } catch (e) { /* bỏ qua */ }
  }

  playClick() {
    try {
      const ctx = this.getCtx();
      if (!ctx || !this.masterGain) return;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 800;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) { /* bỏ qua */ }
  }
}

export const soundManager = new SoundManager();
