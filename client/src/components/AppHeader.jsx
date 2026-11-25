import ThemeToggle from "./ThemeToggle.jsx";

function LeaveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" />
    </svg>
  );
}

// Cabeçalho das telas de corrida e pódio: logo, tema, status do servidor e "Sair".
export default function AppHeader({
  theme,
  onToggleTheme,
  onLeave,
  leaveLabel = "Sair da sala",
  isConnected = true,
}) {
  return (
    <header className="mx-auto flex h-20 w-full max-w-[1120px] items-center justify-between gap-3">
      <div className="flex items-center gap-3 text-[26px] font-extrabold tracking-tight sm:text-[28px]">
        {/* O desenho ocupa ~38% do logo_small.png (o resto é margem transparente);
            o zoom centrado no desenho faz ele preencher a caixa. */}
        <span className="block h-12 w-12 shrink-0 overflow-hidden sm:h-14 sm:w-14">
          <img
            src="/logo_small.png"
            alt=""
            className="h-full w-full scale-[2.5] object-contain"
            style={{ transformOrigin: "46.3% 51.7%" }}
          />
        </span>
        <span>
          <span className="brand-type">Type</span>
          <span className="text-[#FF6B2B]">Racing</span>
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-2 rounded-full bg-[#DDF7E8] px-4 py-2 text-sm font-semibold text-[#14532D] sm:inline-flex dark:bg-[#163026] dark:text-[#86EFAC]">
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? "bg-[#16A34A]" : "bg-[#FFB703]"}`}
          />
          {isConnected ? "Servidor Online" : "Conectando..."}
        </span>
        <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
        {onLeave && (
          <button
            type="button"
            onClick={onLeave}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-[#FCA5A5] bg-[var(--theme-card)] px-4 text-sm font-bold text-[#B91C1C] transition hover:bg-[#FEE2E2] dark:border-[#7F1D1D] dark:text-[#FCA5A5] dark:hover:bg-[#4C1D24]"
          >
            <LeaveIcon />
            {leaveLabel}
          </button>
        )}
      </div>
    </header>
  );
}
