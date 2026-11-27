import { useSyncExternalStore } from "react";
import { isMuted, playSound, setMuted, subscribeMuted } from "../services/sound.js";

function SpeakerIcon({ muted }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" fill="currentColor" />
      {muted ? (
        <path d="m22 9-6 6M16 9l6 6" />
      ) : (
        <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
      )}
    </svg>
  );
}

// Liga/desliga os sons só neste PC (fica salvo no navegador).
export default function SoundToggle() {
  const muted = useSyncExternalStore(subscribeMuted, isMuted);
  const label = muted ? "Ativar sons" : "Desativar sons";

  return (
    <button
      type="button"
      onClick={() => {
        setMuted(!muted);
        if (muted) playSound("toggle");
      }}
      className="theme-toggle cursor-pointer"
      aria-label={label}
      title={label}
      aria-pressed={!muted}
    >
      <SpeakerIcon muted={muted} />
    </button>
  );
}
