function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <path
        d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.5" fill="currentColor" stroke="none" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

// Modo claro mostra a Lua (ir para o escuro); modo escuro mostra o Sol (voltar ao claro).
import { playSound } from "../services/sound.js";

export default function ThemeToggle({ theme, onToggleTheme }) {
  const isDark = theme === "dark";
  const label = isDark ? "Ativar modo claro" : "Ativar modo escuro";

  return (
    <button
      type="button"
      onClick={() => {
        playSound("toggle");
        onToggleTheme?.();
      }}
      className={`theme-toggle cursor-pointer ${isDark ? "text-[#FFB703]" : "text-[#1E242B]"}`}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
