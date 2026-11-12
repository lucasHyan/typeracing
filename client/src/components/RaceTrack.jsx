export default function RaceTrack({ players }) {
  return (
    <section className="mb-5 rounded-xl bg-slate-900 p-4 sm:p-5">
      <h2 className="mb-3 text-xs font-bold tracking-widest text-slate-400">
        PISTA DE CORRIDA
      </h2>

      {players.map((player) => (
        <div
          key={player.id}
          className="relative h-12 border-b-2 border-dashed border-slate-700 last:border-0"
        >
          <div
            className="absolute top-1/2 flex -translate-y-1/2 items-center gap-2 transition-[left] duration-150 ease-out"
            style={{ left: `${player.progress}%` }}
          >
            <span className="text-2xl" aria-hidden="true">
              {player.emoji || '🚗'}
            </span>
            <span
              className="whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
              style={{ backgroundColor: player.color || '#2563eb' }}
            >
              {player.name} ({player.progress}%)
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}
