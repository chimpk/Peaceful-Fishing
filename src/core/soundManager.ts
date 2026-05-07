
import { LocationType } from './types';

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isAmbientRunning = false;
  private ambientNodes: { noise?: AudioBufferSourceNode, lfo?: OscillatorNode, filter?: BiquadFilterNode, gain?: GainNode, oscs?: OscillatorNode[] } = {};
  private currentLocation: LocationType | 'POND' = 'POND';

  private getCtx(): AudioContext | null {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
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

  playTrophyCatch() {
    try {
      const ctx = this.getCtx();
      const masterGain = this.masterGain;
      if (!ctx || !masterGain) return;
      // Hợp âm hoành tráng (C major 7th chord spread out)
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.50]; 
      
      notes.forEach((freq, i) => {
        try {
          const osc = ctx.createOscillator();
          osc.type = i % 2 === 0 ? 'triangle' : 'sine';
          osc.frequency.value = freq;
          const gain = ctx.createGain();
          // Chơi cùng lúc nhưng fade out dài hơn
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 2.1);
        } catch (e2) { }
      });
    } catch (e) { }
  }

  playBossWarning() {
    try {
      const ctx = this.getCtx();
      const masterGain = this.masterGain;
      if (!ctx || !masterGain) return;
      
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.5);
      osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 1.0);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.0);
      
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.1);
    } catch (e) { }
  }

  private rainSource: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;

  playThunder() {
    try {
      const ctx = this.getCtx();
      if (!ctx || !this.masterGain) return;
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 2.5);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
    } catch (e) { }
  }

  startRain() {
    try {
      const ctx = this.getCtx();
      if (!ctx || !this.masterGain || this.rainSource) return;
      
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      
      this.rainSource = ctx.createBufferSource();
      this.rainSource.buffer = buffer;
      this.rainSource.loop = true;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      
      this.rainGain = ctx.createGain();
      this.rainGain.gain.setValueAtTime(0, ctx.currentTime);
      this.rainGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.0);
      
      this.rainSource.connect(filter);
      filter.connect(this.rainGain);
      this.rainGain.connect(this.masterGain);
      this.rainSource.start();
    } catch (e) { }
  }

  stopRain() {
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.0);
      setTimeout(() => {
        if (this.rainSource) {
          try { this.rainSource.stop(); } catch(e) {}
          this.rainSource = null;
        }
        this.rainGain = null;
      }, 1100);
    }
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

  private stopAmbient() {
    if (this.ambientNodes.noise) {
      try { this.ambientNodes.noise.stop(); } catch(e) {}
    }
    if (this.ambientNodes.lfo) {
      try { this.ambientNodes.lfo.stop(); } catch(e) {}
    }
    if (this.ambientNodes.oscs) {
      this.ambientNodes.oscs.forEach(osc => {
        try { osc.stop(); } catch(e) {}
      });
    }
    this.ambientNodes = {};
    this.isAmbientRunning = false;
  }

  setAmbientLocation(location: LocationType | 'POND') {
    this.currentLocation = location;
    if (this.isAmbientRunning) {
      this.startAmbient(); // Restart with new location
    }
  }

  startAmbient() {
    try {
      const ctx = this.getCtx();
      if (!ctx || !this.masterGain) return;
      
      this.stopAmbient(); // Stop previous ambient if any
      
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
      }
      
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;
      this.ambientNodes.noise = noiseSource;
      
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      this.ambientNodes.lfo = lfo;
      
      const lfoGain = ctx.createGain();
      lfo.connect(lfoGain);
      
      const filter = ctx.createBiquadFilter();
      this.ambientNodes.filter = filter;
      lfoGain.connect(filter.frequency);
      
      const mainGain = ctx.createGain();
      this.ambientNodes.gain = mainGain;
      
      noiseSource.connect(filter);
      filter.connect(mainGain);
      mainGain.connect(this.masterGain);
      
      // Cấu hình theo location
      if (this.currentLocation === 'POND') {
        // Tiếng dế / côn trùng rỉ rả
        lfo.frequency.value = 15; // Rung nhanh
        lfoGain.gain.value = 1000;
        filter.type = 'bandpass';
        filter.frequency.value = 4000;
        mainGain.gain.value = 0.015;
        
      } else if (this.currentLocation === 'OCEAN') {
        // Tiếng sóng biển (white noise slow sweep)
        lfo.frequency.value = 0.1; // Chậm
        lfoGain.gain.value = 800;
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        mainGain.gain.value = 0.04;
        
      } else if (this.currentLocation === 'CAVE') {
        // Âm vang trầm hang động
        lfo.frequency.value = 0.05;
        lfoGain.gain.value = 200;
        filter.type = 'lowpass';
        filter.frequency.value = 150;
        mainGain.gain.value = 0.05;
        
        // Thêm oscillator trầm
        const caveOsc = ctx.createOscillator();
        caveOsc.type = 'sine';
        caveOsc.frequency.value = 55; // Low rumble
        const caveOscGain = ctx.createGain();
        caveOscGain.gain.value = 0.05;
        caveOsc.connect(caveOscGain);
        caveOscGain.connect(this.masterGain);
        caveOsc.start();
        this.ambientNodes.oscs = [caveOsc];
      }
      
      noiseSource.start();
      lfo.start();
      
      this.isAmbientRunning = true;
    } catch(e) { }
  }
}

export const soundManager = new SoundManager();
