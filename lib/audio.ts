// Audio notifikace — statické soubory z public/sounds/

function play(src: string) {
  if (typeof window === "undefined") return;
  const a = new Audio(src);
  a.volume = 0.5;
  a.play().catch(() => {});
}

export function playScanStart() {
  play("/sounds/scan-start.mp3");
}

export function playScanComplete() {
  play("/sounds/scan-complete.mp3");
}

export function playScanError() {
  play("/sounds/scan-error.mp3");
}
