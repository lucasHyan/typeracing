import AppHeader from "../AppHeader.jsx";

export default function LobbyEntry({
  playerName,
  roomCode,
  isRoomCodeFromLink,
  isBusy,
  isConnected,
  onPlayerNameChange,
  onRoomCodeChange,
  onCreateRoom,
  onJoinRoom,
  theme = "light",
  onToggleTheme,
}) {
  return (
    <main className="theme-main min-h-screen w-full px-4 pt-3 sm:px-6">
      <AppHeader
        theme={theme}
        onToggleTheme={onToggleTheme}
        isConnected={isConnected}
      />

      <section className="mx-auto flex w-full max-w-6xl flex-col items-center pt-10 sm:pt-12">
        <img
          src="/logo.png"
          alt="Emblema TypeRacing"
          className="w-42 h-42 object-contain mx-auto"
        />

        <h1 className="mt-5 text-4xl text-center font-extrabold">
          Pronto para acelerar no teclado?
        </h1>
        <p className="theme-secondary mt-2 text-base text-center">
          Escolha seu piloto e entre na pista.
        </p>

        <div className="theme-card mt-10 rounded-2xl border shadow-md max-w-2xl w-full mx-auto p-2.5 pl-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <label htmlFor="player-name" className="sr-only">
            Seu apelido
          </label>
          <input
            id="player-name"
            type="text"
            value={playerName}
            onChange={(event) => onPlayerNameChange(event.target.value)}
            placeholder="Seu apelido"
            maxLength={18}
            autoComplete="nickname"
            autoFocus={isRoomCodeFromLink}
            className="theme-input flex-1 outline-none placeholder:text-[var(--theme-secondary)] min-w-0 px-1 py-3"
          />

          <button
            type="button"
            onClick={onCreateRoom}
            disabled={isBusy}
            className="px-7 py-3 rounded-xl font-bold text-white shrink-0 bg-[#FF6B2B] transition hover:bg-[#E55A1F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? "Conectando..." : "Criar Sala"}
          </button>
        </div>

        <form
          onSubmit={onJoinRoom}
          className="mt-6 flex items-center justify-center gap-3 flex-wrap sm:flex-nowrap"
        >
          <label htmlFor="room-code" className="theme-secondary text-sm">
            Ou entre com um código:
          </label>
          <input
            id="room-code"
            type="text"
            value={roomCode}
            onChange={(event) =>
              onRoomCodeChange(event.target.value.toUpperCase())
            }
            placeholder=""
            maxLength={5}
            autoComplete="off"
            className="theme-input w-32 py-2.5 px-3 text-center uppercase tracking-widest font-bold rounded-xl border shadow-sm outline-none"
          />
          <button
            type="submit"
            disabled={isBusy}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#00A8E8] transition hover:bg-[#0090C7] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
