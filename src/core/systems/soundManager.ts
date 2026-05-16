
import { LocationType } from '../../types';

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isAmbientRunning = false;
  private ambientNodes: { noise?: AudioBufferSourceNode, lfo?: OscillatorNode, filter?: BiquadFilterNode, gain?: GainNode, oscs?: OscillatorNode[] } = {};
  private currentLocation: LocationType = 'POND';
  private musicAudio: HTMLAudioElement | null = null;
  private ambientInterval: any = null;
  
  // Volume settings
  private masterVol = 0.5;
  private musicVol = 0.3;
  private sfxVol = 0.8;

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
      this.masterGain.gain.value = this.masterVol;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      // Âm thanh không khả dụng, bỏ qua
    }
    return this.ctx;
  }

  setVolumes(master: number, music: number, sfx: number) {
    this.masterVol = master;
    this.musicVol = music;
    this.sfxVol = sfx;
    
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(master, (this.ctx?.currentTime || 0), 0.1);
    }
    if (this.musicAudio) {
      this.musicAudio.volume = music * master;
    }
    // Ambient gain also needs to scale if we had a dedicated ambient gain, 
    // but for now it's connected to masterGain which covers it.
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
      gain.gain.setValueAtTime(0.4 * this.sfxVol, ctx.currentTime);
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
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          // Low frequency noise for rumble
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 3.5);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.0);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
      noise.stop(ctx.currentTime + 4.0);
    } catch (e) { }
  }

  playLightningStrike() {
    try {
      const audio = new Audio('./Tieng_sam.mp3');
      audio.volume = 0.6;
      audio.play().catch(e => console.error("Lightning sound error", e));
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
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) { /* bỏ qua */ }
  }

  playCast() {
    try {
      const ctx = this.getCtx();
      if (!ctx || !this.masterGain) return;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) { }
  }

  playBite() {
    try {
      const ctx = this.getCtx();
      if (!ctx || !this.masterGain) return;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) { }
  }

  playError() {
    try {
      const ctx = this.getCtx();
      if (!ctx || !this.masterGain) return;
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.2);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) { }
  }

  playLevelUp() {
    try {
      const ctx = this.getCtx();
      const masterGain = this.masterGain;
      if (!ctx || !masterGain) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C-E-G-C
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.5);
      });
    } catch (e) { }
  }

  playSell() {
    try {
      const ctx = this.getCtx();
      if (!ctx || !this.masterGain) return;
      const notes = [880, 1320]; // A5, E6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + i * 0.05 + 0.25);
      });
    } catch (e) { }
  }

  playPurchase() {
    try {
      const ctx = this.getCtx();
      if (!ctx || !this.masterGain) return;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) { }
  }

  playAchievement() {
    try {
      const ctx = this.getCtx();
      if (!ctx || !this.masterGain) return;
      const notes = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G-C-E-G-C
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.5);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.6);
      });
    } catch (e) { }
  }

  playNotify() {
    try {
      const ctx = this.getCtx();
      if (!ctx || !this.masterGain) return;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) { }
  }

  startAmbient(location: LocationType) {
    try {
      const ctx = this.getCtx();
      if (!ctx || !this.masterGain) return;
      
      this.stopAmbient();
      this.currentLocation = location;
      this.isAmbientRunning = true;

      // 1. Base Ambient Noise (Wind/Waves/Deep Hum)
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      
      if (location === 'OCEAN') {
          // Rushing waves logic
          filter.type = 'lowpass';
          filter.frequency.value = 500;
          gain.gain.value = 0.05;
          
          // LFO for wave motion
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.15; // 6.6 seconds per wave cycle
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 300;
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          lfo.start();
          this.ambientNodes.lfo = lfo;
      } else if (location === 'POND') {
          filter.type = 'lowpass';
          filter.frequency.value = 800;
          gain.gain.value = 0.02;
      } else {
          // Cave rumble
          filter.type = 'lowpass';
          filter.frequency.value = 200;
          gain.gain.value = 0.03;
      }

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();

      this.ambientNodes.noise = noise;
      this.ambientNodes.filter = filter;
      this.ambientNodes.gain = gain;

      // 2. Periodic Random Sounds (Birds, Frogs, Drips)
      this.ambientInterval = setInterval(() => {
          if (!this.isAmbientRunning) return;
          const rand = Math.random();
          if (location === 'POND' && rand < 0.3) this.playBirdChirp();
          if (location === 'POND' && rand > 0.8) this.playFrogCroak();
          if (location === 'CAVE' && rand < 0.25) this.playCaveDrip();
      }, 2000);

    } catch (e) { console.error("Ambient audio error:", e); }
  }

  stopAmbient() {
    this.isAmbientRunning = false;
    if (this.ambientInterval) clearInterval(this.ambientInterval);
    if (this.ambientNodes.noise) { try { this.ambientNodes.noise.stop(); } catch(e){} }
    if (this.ambientNodes.lfo) { try { this.ambientNodes.lfo.stop(); } catch(e){} }
    if (this.ambientNodes.oscs) {
        this.ambientNodes.oscs.forEach(osc => { try { osc.stop(); } catch(e){} });
    }
    this.ambientNodes = {};
  }

  private playBirdChirp() {
      try {
          const ctx = this.getCtx(); if (!ctx || !this.masterGain) return;
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          const baseFreq = 2000 + Math.random() * 1000;
          osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(baseFreq + 500, ctx.currentTime + 0.1);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.02, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.connect(gain); gain.connect(this.masterGain);
          osc.start(); osc.stop(ctx.currentTime + 0.15);
      } catch(e){}
  }

  private playFrogCroak() {
      try {
          const ctx = this.getCtx(); if (!ctx || !this.masterGain) return;
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80 + Math.random() * 20, ctx.currentTime);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.03, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          osc.connect(gain); gain.connect(this.masterGain);
          osc.start(); osc.stop(ctx.currentTime + 0.2);
      } catch(e){}
  }

  private playCaveDrip() {
      try {
          const ctx = this.getCtx(); if (!ctx || !this.masterGain) return;
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1500 + Math.random() * 500, ctx.currentTime);
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          // Add small reverb-like delay
          const delay = ctx.createDelay(); delay.delayTime.value = 0.1;
          const fb = ctx.createGain(); fb.gain.value = 0.3;
          osc.connect(gain); gain.connect(this.masterGain);
          gain.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(this.masterGain);
          osc.start(); osc.stop(ctx.currentTime + 0.1);
      } catch(e){}
  }

  playMusic() {
    try {
      if (!this.musicAudio) {
        this.musicAudio = new Audio('./nhac_nen.mp3');
        this.musicAudio.loop = true;
        this.musicAudio.volume = this.musicVol * this.masterVol;
      }
      
      if (this.musicAudio.paused) {
        this.musicAudio.play().catch(e => console.warn("Music autoplay blocked:", e));
      }
    } catch (e) {
      console.error("Error playing music:", e);
    }
  }

  stopMusic() {
    if (this.musicAudio) {
      this.musicAudio.pause();
      this.musicAudio.currentTime = 0;
    }
  }
}

export const soundManager = new SoundManager();
