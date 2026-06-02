/**
 * speechService — Web Speech API for order confirmation voice,
 * and Web Audio API for a reactive cart-add sound (no files needed).
 */

/* ── Speaking state — global subscribers ────────────────────────── */
type SpeakingListener = (isSpeaking: boolean) => void;
const speakingListeners = new Set<SpeakingListener>();
let _isSpeaking = false;

const setSpeaking = (val: boolean) => {
  if (_isSpeaking === val) return;
  _isSpeaking = val;
  speakingListeners.forEach(fn => fn(val));
};

export const onSpeakingChange = (fn: SpeakingListener): (() => void) => {
  speakingListeners.add(fn);
  return () => speakingListeners.delete(fn);
};

export const getIsSpeaking = () => _isSpeaking;

/* ── Voice selection ─────────────────────────────────────────────── */
let preferredVoice: SpeechSynthesisVoice | null = null;

const pickVoice = (): SpeechSynthesisVoice | null => {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  const priorities = [
    (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('en-US'),
    (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.lang.startsWith('en-US'),
    (v: SpeechSynthesisVoice) => v.lang === 'en-US',
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
  ];
  for (const test of priorities) {
    const match = voices.find(test);
    if (match) return match;
  }
  return voices[0];
};

export const speak = (text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
  if (!('speechSynthesis' in window)) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const doSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(text);
    // Always re-pick voice — voices may have loaded since module init
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.lang   = 'en-US';
    utterance.rate   = options?.rate   ?? 1.0;
    utterance.pitch  = options?.pitch  ?? 1.0;
    utterance.volume = options?.volume ?? 1.0;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend   = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    // Voices already loaded — small delay so navigation doesn't interrupt
    setTimeout(doSpeak, 300);
  } else {
    // Voices not yet loaded — wait for them then speak
    window.speechSynthesis.onvoiceschanged = () => {
      preferredVoice = pickVoice();
      setTimeout(doSpeak, 300);
    };
  }
};

if ('speechSynthesis' in window) {
  preferredVoice = pickVoice();
  window.speechSynthesis.onvoiceschanged = () => { preferredVoice = pickVoice(); };
}

/* ── Reactive cart-add sound (Web Audio API — no files) ─────────── */
/**
 * Plays a short upbeat "pop + chime" tone:
 *   1. A soft pop (sine wave, quick decay)
 *   2. A bright chime (triangle wave, two rising notes)
 */
export const playCartSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const play = (
      type: OscillatorType,
      freq: number,
      startTime: number,
      duration: number,
      gainPeak: number
    ) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type      = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Soft pop
    play('sine',     180, 0.00, 0.12, 0.35);
    // First chime note
    play('triangle', 880, 0.05, 0.18, 0.25);
    // Second chime note (higher)
    play('triangle', 1320, 0.18, 0.22, 0.20);

    // Close context after sounds finish
    setTimeout(() => ctx.close(), 600);
  } catch {
    // Browser blocked audio — silently ignore
  }
};

/**
 * Plays a warm "heart pop" sound when a user likes a product:
 *   1. A soft thud (low sine, quick)
 *   2. Two rising sparkle notes (triangle)
 */
export const playLikeSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const play = (
      type: OscillatorType,
      freq: number,
      startTime: number,
      duration: number,
      gainPeak: number
    ) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Soft thud
    play('sine',     120, 0.00, 0.10, 0.30);
    // First sparkle
    play('triangle', 660, 0.06, 0.16, 0.22);
    // Second sparkle (higher)
    play('triangle', 990, 0.16, 0.20, 0.18);
    // Tiny shimmer
    play('triangle', 1480, 0.28, 0.18, 0.12);

    setTimeout(() => ctx.close(), 700);
  } catch {
    // Browser blocked audio — silently ignore
  }
};

export const sayAddedToCart = (_productName: string) => {
  // Just the reactive sound — no voice for cart adds
  playCartSound();
};

export const sayWelcomeBack = (name: string) => {
  const firstName = name.split(' ')[0];
  speak(
    `Hey ${firstName}! Welcome back to Gura Neza. It's great to have you here again. Your wallet and cart are all set — happy shopping!`,
    { rate: 1.0, pitch: 1.08, volume: 1.0 }
  );
};

export const sayWelcomeNew = (name: string) => {
  const firstName = name.split(' ')[0];
  speak(
    `Welcome to Gura Neza, ${firstName}! We're so excited to have you on board. Your account is ready — please verify your email and then dive into the best shopping experience in Rwanda. Let's go!`,
    { rate: 0.97, pitch: 1.1, volume: 1.0 }
  );
};

export const sayOrderPlaced = (userName?: string) => {
  const name = userName ? userName.split(' ')[0] : '';
  const greeting = name ? `Thank you, ${name}! ` : 'Thank you! ';
  speak(
    `${greeting}Your order has been placed successfully. We'll confirm it shortly and get it delivered to you as fast as possible. Happy shopping!`,
    { rate: 1.0, pitch: 1.0 }
  );
};
