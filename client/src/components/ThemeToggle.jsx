export default function ThemeToggle({ theme, onToggleTheme }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggleTheme}
      className="theme-toggle cursor-pointer"
      aria-label={isDark ? "Modo Claro" : "Modo Escuro"}
      title={isDark ? "Modo Claro" : "Modo Escuro"}
      aria-pressed={isDark}
    >
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
    </button>
  );
}
