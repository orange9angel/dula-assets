/**
 * Transition Sound Effects
 * Procedurally generated SFX for each transition type.
 * These are synthesized using Web Audio API (no external files needed).
 */

export class TransitionSFX {
  /**
   * Generate a whoosh sound for wipe/slide transitions.
   */
  static whoosh(audioContext, duration = 0.3) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + duration);

    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + duration);
  }

  /**
   * Generate a camera shutter / iris sound.
   */
  static iris(audioContext, duration = 0.4) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(200, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + duration * 0.5);
    osc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + duration);

    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + duration);
  }

  /**
   * Generate a zoom / speed line sound.
   */
  static zoom(audioContext, duration = 0.5) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + duration);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(100, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + duration);

    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + duration);
  }

  /**
   * Generate a pixel / digital glitch sound.
   */
  static pixel(audioContext, duration = 0.3) {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / bufferSize);
    }

    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();

    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, audioContext.currentTime);
    filter.Q.setValueAtTime(5, audioContext.currentTime);

    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    source.start(audioContext.currentTime);
  }

  /**
   * Generate a spin / swirl sound.
   */
  static spin(audioContext, duration = 0.5) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, audioContext.currentTime);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(8, audioContext.currentTime);
    lfoGain.gain.setValueAtTime(200, audioContext.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(audioContext.currentTime);
    lfo.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + duration);
    lfo.stop(audioContext.currentTime + duration);
  }

  /**
   * Play the appropriate SFX for a transition type.
   */
  static play(transitionName, audioContext, duration) {
    if (!audioContext) return;
    switch (transitionName) {
      case 'Fade':
        // Fade is silent
        break;
      case 'Iris':
        this.iris(audioContext, duration);
        break;
      case 'Wipe':
        this.whoosh(audioContext, duration);
        break;
      case 'ZoomBlur':
        this.zoom(audioContext, duration);
        break;
      case 'Pixelate':
        this.pixel(audioContext, duration);
        break;
      case 'Spin':
        this.spin(audioContext, duration);
        break;
      default:
        this.whoosh(audioContext, duration);
    }
  }
}
