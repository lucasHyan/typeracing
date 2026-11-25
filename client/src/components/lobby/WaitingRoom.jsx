import VehicleCustomizer from "./VehicleCustomizer";
import RaceTextPanel from "./RaceTextPanel";
import { COLOR_PRESETS } from "./constants";
import AppHeader from "../AppHeader.jsx";
import VehicleAvatar from "../VehicleAvatar.jsx";

export default function WaitingRoom({
  room,
  playerId,
  isConnected,
  onStartRace,
  onCustomizationChange,
  onLeaveRoom,
  onCopyRoomLink,
  roomLinkCopied,
  onDifficultyChange,
  onRoomTextChange,
  theme = "light",
  onToggleTheme,
}) {
  const players = Object.values(room.players || {});
  const isHost = room.hostId === playerId;

  return (
    <main className="theme-main min-h-screen px-4 pb-8 pt-3 sm:px-6">
      <AppHeader
        theme={theme}
        onToggleTheme={onToggleTheme}
        isConnected={isConnected}
      />

      <section className="mx-auto mt-8 w-full max-w-4xl space-y-8 pb-8">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Sala de espera
          </h1>
          <p className="theme-secondary mt-2 text-base sm:text-lg">
            Todo mundo na pista? Prepare os dedos para a largada.
          </p>
        </header>

        <section className="theme-card grid gap-6 rounded-2xl border p-6 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center sm:px-7">
          <div>
            <p className="theme-secondary text-xs font-bold tracking-[0.16em] sm:text-sm">
              CÓDIGO DA SALA
            </p>
            <p className="mt-1 font-mono text-4xl font-black tracking-[0.12em] sm:text-5xl">
              {room.code}
            </p>
          </div>
          <div className="w-full space-y-3 sm:w-[350px]">
            <button
              type="button"
              onClick={onCopyRoomLink}
              aria-live="polite"
              className="w-full cursor-pointer rounded-lg bg-[#00A8E8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0097D1]"
            >
              {roomLinkCopied ? "Link copiado!" : "Copiar Link"}
            </button>
          </div>
        </section>

        <RaceTextPanel
          room={room}
          isHost={isHost}
          onDifficultyChange={onDifficultyChange}
          onRoomTextChange={onRoomTextChange}
        />

        <section>
          <header className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold sm:text-lg">
              Jogadores conectados
            </h2>
            <p className="theme-secondary text-sm font-semibold">
              {players.length} na sala
            </p>
          </header>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {players.map((player) => {
              const isCurrentPlayer = player.id === playerId;
              const isPlayerHost = player.id === room.hostId;

              return (
                <li
                  key={player.id}
                  className={`theme-card relative flex min-h-48 flex-col items-center rounded-2xl px-4 pb-4 pt-4 shadow-sm ${
                    isCurrentPlayer ? "border-2 border-[#FF6B2B]" : "border"
                  }`}
                >
                  {isCurrentPlayer ? (
                    <>
                      {isPlayerHost && (
                        <span className="absolute left-3 top-3 rounded-full bg-[#C2410C] px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white">
                          HOST
                        </span>
                      )}
                      <span className="absolute right-3 top-3 rounded-full bg-[var(--theme-highlight)] px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-[var(--theme-highlight-text)]">
                        VOCÊ
                      </span>
                    </>
                  ) : (
                    <span
                      aria-label="Conectado"
                      className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-[#16A34A] ring-2 ring-[#16A34A]/25"
                    />
                  )}
                  <div className="mt-8">
                    <VehicleAvatar
                      emoji={player.emoji}
                      color={player.color || COLOR_PRESETS[0].value}
                      size="lg"
                    />
                  </div>
                  <p className="mt-3 max-w-full truncate text-center text-base font-bold">
                    {player.name}
                  </p>
                  {isCurrentPlayer ? (
                    <div className="w-full [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
                      <VehicleCustomizer
                        player={player}
                        onChange={onCustomizationChange}
                      />
                    </div>
                  ) : (
                    <p className="theme-secondary mt-3 inline-flex items-center gap-1.5 text-sm font-medium">
                      Conectado
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <div className="flex flex-col items-center gap-4 pt-1">
          {isHost ? (
            <button
              type="button"
              onClick={onStartRace}
              className="w-full max-w-xs cursor-pointer rounded-xl bg-[#FF6B2B] px-8 py-3.5 text-lg font-extrabold text-white transition hover:bg-[#F45A1B] active:scale-[0.99]"
            >
              Iniciar Corrida
            </button>
          ) : (
            <p className="theme-secondary text-center text-base font-medium">
              Aguardando o professor iniciar a partida...
            </p>
          )}
          <button
            type="button"
            onClick={onLeaveRoom}
            className="theme-secondary cursor-pointer text-base font-medium transition hover:text-[var(--theme-text)]"
          >
            ← Sair da sala
          </button>
        </div>
      </section>
    </main>
  );
}
