// Plays a subtle notification sound using the Web Audio API
// No external audio files needed

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    return audioContext;
  } catch {
    return null;
  }
}

export function playNotificationSound() {
  // Check localStorage preference
  try {
    const prefs = localStorage.getItem("endeavor_notif_prefs");
    if (prefs) {
      const parsed = JSON.parse(prefs);
      if (!parsed.soundEnabled) return;
    } else {
      return; // Default is sound off
    }
  } catch {
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume if suspended (autoplay policy)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const now = ctx.currentTime;

  // Create a pleasant two-tone ping
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(880, now); // A5
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(1320, now); // E6

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now + 0.1);
  osc1.stop(now + 0.3);
  osc2.stop(now + 0.4);
}
