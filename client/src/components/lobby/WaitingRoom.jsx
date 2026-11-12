import VehicleCustomizer from './VehicleCustomizer';

function PlayerList({ players, hostId, socketId }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-300">Pilotos conectados</h3>
      <ul className="space-y-2">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-950/70 px-4 py-3"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="text-2xl" aria-hidden="true">{player.emoji || '🚗'}</span>
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full"
                style={{ backgroundColor: player.color || '#2563eb' }}
              />
              <span className="truncate font-medium text-slate-200">
                {player.name}
                {player.id === socketId && (
                  <span className="ml-1 text-xs text-sky-400">(Você)</span>
                )}
              </span>
            </span>
            {player.id === hostId && (
              <span className="ml-2 shrink-0 rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
                Professor
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function WaitingRoom({
  room,
  socketId,
  onStartRace,
  onCustomizationChange,
}) {
  const players = Object.values(room.players || {});
  const isHost = room.hostId === socketId;
  const currentPlayer = room.players?.[socketId];

  return (
    <section className="w-full max-w-xl space-y-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-5">
        <div>
          <p className="text-xs font-bold tracking-wider text-sky-400">SALA DE ESPERA</p>
          <h2 className="mt-1 text-xl font-bold text-slate-100">
            Código:{' '}
            <span className="font-mono tracking-widest text-sky-400">{room.code}</span>
          </h2>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
          {players.length} {players.length === 1 ? 'jogador' : 'jogadores'}
        </span>
      </header>

      <PlayerList players={players} hostId={room.hostId} socketId={socketId} />

      {currentPlayer && (
        <VehicleCustomizer player={currentPlayer} onChange={onCustomizationChange} />
      )}

      {isHost ? (
        <button
          type="button"
          onClick={onStartRace}
          className="w-full rounded-xl bg-emerald-600 py-3.5 font-semibold text-white transition hover:bg-emerald-500 active:scale-[0.99]"
        >
          Iniciar corrida
        </button>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-700 bg-slate-950/50 py-3 text-center text-sm text-slate-400">
          Aguardando o professor iniciar a corrida...
        </p>
      )}
    </section>
  );
}
