/**
 * Simple notification sound utility.
 * Uses the Web Audio API to generate short tones.
 */
export function playNotificationSound() {
  try {
    const enabled = localStorage.getItem("endeavor-notification-sounds");
    if (enabled === "false") return;

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.frequency.value = 880; // A5 note
    oscillator.type = "sine";
    gain.gain.value = 0.1;

    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch {
    // Audio not available
  }
}

export function playSuccessSound() {
  try {
    const enabled = localStorage.getItem("endeavor-notification-sounds");
    if (enabled === "false") return;

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.frequency.value = 523.25; // C5
    oscillator.type = "sine";
    gain.gain.value = 0.08;

    oscillator.start();

    // Quick ascending tone
    oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
    oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5

    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio not available
  }
}
