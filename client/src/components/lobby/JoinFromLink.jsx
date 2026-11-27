import AppHeader from "../AppHeader.jsx";

// Tela aberta pelo link compartilhado (?roomCode=XXXXX): só o nome e "Entrar na partida".
export default function JoinFromLink({
  roomCode,
  playerName,
  onPlayerNameChange,
  onJoinRoom,
  isBusy,
  isConnected,
  errorMessage,
  onGoHome,
  theme,
  onToggleTheme,
}) {
  const canJoin = playerName.trim().length > 0 && !isBusy;

  return (
    <main className="theme-main flex min-h-screen flex-col px-4 pt-3 sm:px-6">
      <AppHeader
        theme={theme}
        onToggleTheme={onToggleTheme}
        isConnected={isConnected}
        onHome={onGoHome}
      />

      <section className="flex flex-1 items-center justify-center pb-16">
        <form
          onSubmit={onJoinRoom}
          className="theme-card w-full max-w-md rounded-3xl border p-8 text-center shadow-md"
        >
          <p className="theme-secondary text-sm font-bold uppercase tracking-[0.16em]">
            Convite para a sala
          </p>
          <p className="mt-1 font-mono text-4xl font-black tracking-[0.12em] text-[#FF6B2B]">
            {roomCode}
          </p>
          <h1 className="mt-5 text-2xl font-extrabold">Qual é o seu nome?</h1>

          <label htmlFor="invite-player-name" className="sr-only">
            Seu nome
          </label>
          <input
            id="invite-player-name"
            type="text"
            value={playerName}
            onChange={(event) => onPlayerNameChange(event.target.value)}
            placeholder="Digite seu nome"
            maxLength={18}
            autoComplete="nickname"
            autoFocus
            className="theme-input mt-5 w-full rounded-xl border-2 px-4 py-3.5 text-center text-lg font-semibold outline-none transition placeholder:font-normal placeholder:text-[var(--theme-secondary)] focus:border-[#FF6B2B]"
          />

          <button
            type="submit"
            disabled={!canJoin}
            className="mt-4 w-full cursor-pointer rounded-xl bg-[#FF6B2B] px-6 py-3.5 text-lg font-extrabold text-white shadow-sm transition hover:bg-[#E55A1F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!isConnected
              ? "Conectando..."
              : isBusy
                ? "Entrando..."
                : "Entrar na partida"}
          </button>

          {errorMessage && (
            <div role="alert" className="mt-4">
              <p className="text-sm font-semibold text-[#B91C1C] dark:text-[#FCA5A5]">
                {errorMessage}
              </p>
              {/* Só aparece quando algo deu errado (ex.: sala encerrada). */}
              <button
                type="button"
                onClick={onGoHome}
                className="theme-secondary mt-2 cursor-pointer text-sm font-medium underline-offset-2 hover:text-[var(--theme-text)] hover:underline"
              >
                Ir para a tela inicial
              </button>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}
