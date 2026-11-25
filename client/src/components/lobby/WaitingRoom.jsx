import { useState } from "react";
import VehicleCustomizer from "./VehicleCustomizer";
import { COLOR_PRESETS } from "./constants";
import ThemeToggle from "../ThemeToggle.jsx";

function VehicleIcon({ color }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 72 48"
      className="h-12 w-[72px]"
      fill="none"
    >
      <path
        d="M10 28.5c0-2 1.4-3.7 3.4-4.1l6.3-1.3 7.1-9.2a6 6 0 0 1 4.8-2.4h9a6 6 0 0 1 4.7 2.3l7.5 9.3 6.1 1.3a5 5 0 0 1 4 4.9v3.2a3.5 3.5 0 0 1-3.5 3.5H13.5a3.5 3.5 0 0 1-3.5-3.5v-4Z"
        fill={color}
      />
      <path
        d="m24 22.5 5.2-6.7a3 3 0 0 1 2.4-1.2h3.1v7.9H24Zm13.7-7.9h2.9a3 3 0 0 1 2.4 1.2l5.4 6.7H37.7v-7.9Z"
        fill="white"
      />
      <circle cx="23" cy="34.5" r="7.5" fill="#1E242B" />
      <circle cx="53" cy="34.5" r="7.5" fill="#1E242B" />
    </svg>
  );
}

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
  theme = "light",
  onToggleTheme,
}) {
  const players = Object.values(room.players || {});
  const isHost = room.hostId === playerId;
  const [difficulty, setDifficulty] = useState(room.difficulty || "Iniciante");

  return (
    <main className="theme-main min-h-screen px-4 py-5 sm:px-6 sm:py-7">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <div className="text-xl font-extrabold tracking-tight text-[#1E242B]">
          Type
          <span className="text-[#FF6B2B]">Racing</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          <span className="theme-card inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isConnected ? "bg-[#16A34A]" : "bg-amber-500"
              }`}
            />
            {isConnected ? "Servidor Online" : "Conectando..."}
          </span>
        </div>
      </header>

      <section className="mx-auto mt-12 w-full max-w-3xl space-y-7 pb-5">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Sala de espera
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            Todo mundo na pista? Prepare os dedos para a largada.
          </p>
        </header>

        <section className="theme-card grid gap-6 rounded-2xl border p-6 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center sm:px-7">
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] text-slate-500">
              CÓDIGO DA SALA
            </p>
            <p className="mt-1 font-mono text-4xl font-black tracking-[0.12em] text-[#1E242B] sm:text-5xl">
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
            {isHost && (
              <fieldset>
                <legend className="mb-1.5 text-[10px] font-bold tracking-wider text-slate-500">
                  DIFICULDADE
                </legend>
                <div className="theme-elevated grid grid-cols-3 rounded-lg p-1">
                  {["Iniciante", "Intermediário", "Programador"].map(
                    (option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setDifficulty(option);
                          onDifficultyChange?.(option);
                        }}
                        disabled={!isHost}
                        aria-pressed={difficulty === option}
                        className={`cursor-pointer rounded-md px-2 py-2 text-xs font-semibold transition disabled:cursor-not-allowed sm:text-sm ${
                          difficulty === option
                            ? "theme-card shadow-sm"
                            : "theme-secondary hover:opacity-80"
                        }`}
                      >
                        {option}
                      </button>
                    ),
                  )}
                </div>
              </fieldset>
            )}
          </div>
        </section>

        <section>
          <header className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold sm:text-lg">
              Jogadores conectados
            </h2>
            <p className="text-xs font-medium text-slate-500 sm:text-sm">
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
                  className={`theme-card relative flex min-h-40 flex-col items-center rounded-2xl border px-3 pb-3 pt-3 shadow-sm ${
                    isCurrentPlayer ? "border-2 border-[#FF6B2B]" : ""
                  }`}
                >
                  {isCurrentPlayer ? (
                    <>
                      {isPlayerHost && (
                        <span className="absolute left-3 top-3 rounded-full bg-[#FF6B2B] px-2.5 py-1 text-[9px] font-extrabold tracking-wide text-white">
                          HOST
                        </span>
                      )}
                      <span className="absolute right-3 top-3 text-[9px] font-bold tracking-wide text-slate-500">
                        VOCÊ
                      </span>
                    </>
                  ) : (
                    <span
                      aria-label="Conectado"
                      className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-[#16A34A]"
                    />
                  )}
                  <div className="mt-7">
                    <VehicleIcon
                      color={player.color || COLOR_PRESETS[0].value}
                    />
                  </div>
                  <p className="mt-2 max-w-full truncate text-center text-sm font-bold">
                    {player.name}
                  </p>
                  {isCurrentPlayer ? (
                    <div className="[&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
                      <VehicleCustomizer
                        player={player}
                        onChange={onCustomizationChange}
                      />
                    </div>
                  ) : (
                    <p className="mt-3 text-[11px] font-medium text-slate-500">
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
            <p className="text-center text-sm font-medium text-slate-500">
              Aguardando o professor iniciar a partida...
            </p>
          )}
          <button
            type="button"
            onClick={onLeaveRoom}
            className="cursor-pointer text-sm font-medium text-slate-500 transition hover:text-[#1E242B]"
          >
            ← Sair da sala
          </button>
        </div>
      </section>
    </main>
  );
}
