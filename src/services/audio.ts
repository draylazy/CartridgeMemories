// Synthesized Web Audio sound effects for Cartridge Memories
// Zero external audio files required!

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (enabled && !this.ctx) {
      this.initContext();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // 1. Solid mechanical clunk when cartridge is inserted into slot
  public playClunk() {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Transient initial snap
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(320, now);
    snapOsc.frequency.exponentialRampToValueAtTime(70, now + 0.08);
    snapGain.gain.setValueAtTime(0.4, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.09);

    // Deep body thud
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(140, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(45, now + 0.18);
    bodyGain.gain.setValueAtTime(0.5, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.2);

    // Mechanical plastic latch click
    setTimeout(() => {
      if (!this.isEnabled || !this.ctx) return;
      const t = this.ctx.currentTime;
      const latch = this.ctx.createOscillator();
      const latchGain = this.ctx.createGain();
      latch.type = 'sawtooth';
      latch.frequency.setValueAtTime(450, t);
      latch.frequency.exponentialRampToValueAtTime(180, t + 0.05);
      latchGain.gain.setValueAtTime(0.15, t);
      latchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      latch.connect(latchGain);
      latchGain.connect(this.ctx.destination);
      latch.start(t);
      latch.stop(t + 0.06);
    }, 45);
  }

  // 2. Mechanical servo whirr / sliding track sound
  public playWhirr() {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.22;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(i / 15);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(950, now + 0.15);
    filter.Q.value = 3;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.23);
  }

  // 3. Eject spring click and release
  public playEject() {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.07);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.16);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  // 4. CRT power-on hum and degauss thump
  public playCrtHum() {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Degauss coil surge (decaying low frequency boom)
    const coil = ctx.createOscillator();
    const coilGain = ctx.createGain();
    coil.type = 'sine';
    coil.frequency.setValueAtTime(90, now);
    coil.frequency.exponentialRampToValueAtTime(45, now + 0.4);
    coilGain.gain.setValueAtTime(0.35, now);
    coilGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    coil.connect(coilGain);
    coilGain.connect(ctx.destination);
    coil.start(now);
    coil.stop(now + 0.46);

    // High frequency flyback transformer coil whine (soft, iconic 15.7kHz tuned down to pleasing audible ~3.8kHz)
    const flyback = ctx.createOscillator();
    const flybackGain = ctx.createGain();
    flyback.type = 'sine';
    flyback.frequency.setValueAtTime(2600, now);
    flybackGain.gain.setValueAtTime(0.02, now);
    flybackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    flyback.connect(flybackGain);
    flybackGain.connect(ctx.destination);
    flyback.start(now);
    flyback.stop(now + 0.36);
  }

  // 5. Static crackle between slides
  public playStatic() {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.12;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration + 0.01);
  }

  // 6. Typewriter / terminal key tap
  public playTypewriter() {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(680 + Math.random() * 80, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 7. Classic Mac retro beep chime
  public playBeep() {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.setValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}

export const sound = new SoundSystem();
