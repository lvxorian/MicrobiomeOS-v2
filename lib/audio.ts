// Web Audio API — mikrobiomální zvukové notifikace
// Generuje zvuky synteticky, nepotřebuje žádné audio soubory

type AudioContextType = typeof AudioContext;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = (window.AudioContext || (window as unknown as { webkitAudioContext: AudioContextType }).webkitAudioContext) as AudioContextType | undefined;
  if (!Ctor) return null;
  return new Ctor();
}

// Krátký "vědecký ping" — rising frequency, jako sonar/pipeta
export function playScanStart() {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

// "Sekvenace dokončena" — harmonický descending arpeggio (teal styl)
export function playScanComplete() {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [1200, 900, 600, 400]; // descending teal frequencies
  const duration = 0.12;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = i === notes.length - 1 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(freq, now + i * 0.1);

    gain.gain.setValueAtTime(0, now + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + duration);
  });
}

// "Chyba" — krátké buzz
export function playScanError() {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
}
