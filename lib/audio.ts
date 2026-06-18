// Web Audio API — prémiové sci-fi/medicínské zvukové notifikace
// Vrstvené oscilátory, jemné modulace, hladké obálky

type AudioContextType = typeof AudioContext;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = (window.AudioContext || (window as unknown as { webkitAudioContext: AudioContextType }).webkitAudioContext) as AudioContextType | undefined;
  if (!Ctor) return null;
  return new Ctor();
}

// Společný helper: vrstvený tón s obálkou
function playTone(opts: {
  freq: number;
  duration: number;
  type?: OscillatorType;
  startTime: number;
  peakVolume: number;
  fadeIn: number;
  fadeOut: number;
  detune?: number;
  harmonics?: number[];
}) {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime + opts.startTime;
  const base = opts.freq;

  // Vytvořit jemný sub-bass fundament pro hloubku
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = "sine";
  subOsc.frequency.setValueAtTime(base * 0.5, now);
  subGain.gain.setValueAtTime(0, now);
  subGain.gain.linearRampToValueAtTime(opts.peakVolume * 0.3, now + opts.fadeIn);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + opts.duration);
  subOsc.connect(subGain);
  subGain.connect(ctx.destination);
  subOsc.start(now);
  subOsc.stop(now + opts.duration);

  // Hlavní tón
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = opts.type || "sine";
  osc.frequency.setValueAtTime(base, now);
  if (opts.detune) osc.detune.setValueAtTime(opts.detune, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(opts.peakVolume, now + opts.fadeIn);
  gain.gain.exponentialRampToValueAtTime(0.001, now + opts.duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + opts.duration);

  // Harmonické alikvoty (dává "třpytivý" prémiový timbre)
  if (opts.harmonics) {
    for (const mult of opts.harmonics) {
      const hOsc = ctx.createOscillator();
      const hGain = ctx.createGain();
      hOsc.type = "sine";
      hOsc.frequency.setValueAtTime(base * mult, now);
      hGain.gain.setValueAtTime(0, now);
      hGain.gain.linearRampToValueAtTime(opts.peakVolume * 0.12 / mult, now + opts.fadeIn);
      hGain.gain.exponentialRampToValueAtTime(0.001, now + opts.duration);
      hOsc.connect(hGain);
      hGain.connect(ctx.destination);
      hOsc.start(now);
      hOsc.stop(now + opts.duration);
    }
  }
}

// Šumová textura — jemný "vzduch" / "proudění" pro prémiový feel
function playNoiseTexture(startTime: number, duration: number, volume: number) {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime + startTime;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(3000, now);
  filter.Q.setValueAtTime(0.5, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(now);
  source.stop(now + duration);
}

// ============================================================
// START SKENU — jemný "přístroj se zapíná"
// Vzestupná harmonie s třpytivými alikvoty a texturou
// ============================================================
export function playScanStart() {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Jemná šumová textura — "proudění vzduchu" při startu přístroje
  playNoiseTexture(0, 0.45, 0.04);

  // Hlavní tón: vzestupný sweep s harmonií
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  const gain = ctx.createGain();

  // Lehce detuned oscillators pro bohatší timbre
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(440, now);
  osc1.frequency.exponentialRampToValueAtTime(660, now + 0.35);

  osc2.type = "sine";
  osc2.frequency.setValueAtTime(554, now); // major third
  osc2.frequency.exponentialRampToValueAtTime(831, now + 0.35);

  osc3.type = "triangle";
  osc3.frequency.setValueAtTime(330, now); // sub-harmonic
  osc3.frequency.exponentialRampToValueAtTime(495, now + 0.35);

  // Jemné tremolo na konci — "puls" jako srdeční tep
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.06, now + 0.08);
  gain.gain.setValueAtTime(0.06, now + 0.3);
  gain.gain.linearRampToValueAtTime(0.03, now + 0.35);
  gain.gain.setValueAtTime(0.05, now + 0.38);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  osc1.connect(gain);
  osc2.connect(gain);
  osc3.connect(gain);
  gain.connect(ctx.destination);
  osc1.start(now);
  osc2.start(now);
  osc3.start(now);
  osc1.stop(now + 0.5);
  osc2.stop(now + 0.5);
  osc3.stop(now + 0.5);
}

// ============================================================
// SKEN DOKONČEN — "analýza hotova"
// Jemná sestupná sekvence s třpytem, jako uzavření datového toku
// ============================================================
export function playScanComplete() {
  const ctx = getCtx();
  if (!ctx) return;

  const notes = [
    { freq: 880, delay: 0, dur: 0.55 },
    { freq: 660, delay: 0.1, dur: 0.5 },
    { freq: 523, delay: 0.22, dur: 0.5 },
    { freq: 392, delay: 0.35, dur: 0.7 }, // závěrečný tón — delší dozvuk
  ];

  // Jemná šumová textura v pozadí
  playNoiseTexture(0, 1.1, 0.03);

  for (const n of notes) {
    playTone({
      freq: n.freq,
      duration: n.dur,
      type: "sine",
      startTime: n.delay,
      peakVolume: 0.07,
      fadeIn: 0.04,
      fadeOut: n.dur * 0.5,
      harmonics: [2, 3, 4], // třpytivé alikvoty
    });
  }

  // Finální "potvrzovací ping" — o oktávu níž, jako tečka
  playTone({
    freq: 330,
    duration: 0.35,
    type: "triangle",
    startTime: 0.75,
    peakVolume: 0.08,
    fadeIn: 0.02,
    fadeOut: 0.25,
  });
}

// ============================================================
// CHYBA — "sken selhal"
// Hluboký, temný tón — decentní, ne alarmující
// ============================================================
export function playScanError() {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Hluboký fundament — pocit "něco se nepovedlo"
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.linearRampToValueAtTime(140, now + 0.45);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.06, now + 0.1);
  gain.gain.setValueAtTime(0.06, now + 0.25);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

  // Druhá harmonická pro "tělo" zvuku
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(270, now);
  osc2.frequency.linearRampToValueAtTime(210, now + 0.45);
  gain2.gain.setValueAtTime(0, now);
  gain2.gain.linearRampToValueAtTime(0.03, now + 0.1);
  gain2.gain.setValueAtTime(0.03, now + 0.25);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

  osc.connect(gain);
  osc2.connect(gain2);
  gain.connect(ctx.destination);
  gain2.connect(ctx.destination);
  osc.start(now);
  osc2.start(now);
  osc.stop(now + 0.55);
  osc2.stop(now + 0.55);
}
