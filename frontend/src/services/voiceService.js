/**
 * NUMORA Space — Voice & Narration Engine
 * Features Web Speech API, mathematical pronunciation mapping, and caption synchronization.
 */

class VoiceService {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.isMuted = false;
    this.selectedVoice = null;
    this.onBoundaryCallback = null;
    this.onEndCallback = null;
    this.initVoice();
  }

  initVoice() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      // Prefer Indonesian female or natural voice
      this.selectedVoice = voices.find(v => v.lang.startsWith('id') || v.lang.startsWith('in')) ||
                           voices.find(v => v.name.toLowerCase().includes('indonesia')) ||
                           voices[0] || null;
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Transforms raw mathematical symbols into natural spoken Indonesian
   */
  formatMathForSpeech(text) {
    if (!text) return '';

    let spoken = text;

    // LaTeX cleanup
    spoken = spoken.replace(/\$+/g, ' ');
    spoken = spoken.replace(/\\implies/g, ' berakibat ');
    spoken = spoken.replace(/\\in/g, ' anggota dari ');
    spoken = spoken.replace(/\\mathbb\{R\}/g, ' bilangan real ');
    spoken = spoken.replace(/\\times/g, ' kali ');

    // Specific math expressions
    spoken = spoken.replace(/-(\d+)?x/g, (match, p1) => {
      return p1 ? ` negatif ${p1} x ` : ' negatif x ';
    });
    spoken = spoken.replace(/(\d+)x/g, '$1 x');
    spoken = spoken.replace(/(\d+)y/g, '$1 y');
    spoken = spoken.replace(/\+/g, ' tambah ');
    spoken = spoken.replace(/-/g, ' kurang ');
    spoken = spoken.replace(/=/g, ' sama dengan ');
    spoken = spoken.replace(/\*/g, ' kali ');
    spoken = spoken.replace(/\//g, ' bagi ');

    // Number mapping in Indonesian
    spoken = spoken.replace(/\b1\/2\b/g, 'satu per dua');
    spoken = spoken.replace(/\b1\/4\b/g, 'satu per empat');

    // Clean multiple whitespace
    spoken = spoken.replace(/\s+/g, ' ').trim();
    return spoken;
  }

  speak(rawText, { onBoundary, onEnd, rate = 0.95, pitch = 1.05 } = {}) {
    if (this.isMuted || !this.synth) {
      onEnd?.();
      return;
    }

    this.stop(); // Stop any existing speech

    const spokenText = this.formatMathForSpeech(rawText);
    const utterance = new SpeechSynthesisUtterance(spokenText);

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = 'id-ID';
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onboundary = (event) => {
      if (event.name === 'word' && onBoundary) {
        onBoundary({
          charIndex: event.charIndex,
          charLength: event.charLength || 5,
          text: spokenText
        });
      }
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
      onEnd?.();
    };

    this.currentUtterance = utterance;
    this.isPlaying = true;
    this.isPaused = false;
    this.synth.speak(utterance);
  }

  pause() {
    if (this.synth && this.isPlaying && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stop();
    }
    return this.isMuted;
  }

  isAvailable() {
    return Boolean(this.synth);
  }
}

export const voiceService = new VoiceService();
