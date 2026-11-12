import socket from '../services/socket';
import { formatRaceTime, getRandomRaceText } from '../utils/gamePresentation';

export default function Results({ room }) {
  const isHost = room.hostId === socket.id;
  const results = room.results || [];

  const handleStartAnotherRace = () => {
    socket.emit('start_another_race', {
      roomCode: room.code,
      targetText: getRandomRaceText(room.targetText),
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <section className="w-full max-w-2xl space-y-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl sm:p-9">
        <header className="text-center">
          <p className="text-xs font-bold tracking-widest text-sky-400">
            RESULTADO DA SALA {room.code}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">Corrida finalizada!</h1>
          <p className="mt-2 text-sm text-slate-400">
            Confira a colocação de cada jogador.
          </p>
        </header>

        <ol className="space-y-3">
          {results.map((player, index) => (
            <li
              key={player.id}
              className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3"
            >
              <span className="w-10 text-center text-xl font-black text-amber-300">
                {index + 1}º
              </span>
              <span
                className="shrink-0 text-2xl"
                aria-hidden="true"
              >
                {player.emoji || '🚗'}
              </span>
              <span
                className="h-4 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: player.color || '#2563eb' }}
              />
              <span className="min-w-0 flex-1 truncate font-semibold">
                {player.name}
                {player.id === room.hostId && (
                  <span className="ml-2 text-xs font-normal text-amber-300">
                    Professor
                  </span>
                )}
              </span>
              <span className="text-right text-sm tabular-nums text-slate-300">
                <span className="block font-semibold text-sky-300">
                  {player.wpm || 0} PPM
                </span>
                <span className="block">
                  {player.isFinished
                    ? formatRaceTime(player.elapsedMs)
                    : `${player.progress || 0}%`}
                </span>
              </span>
            </li>
          ))}
        </ol>

        {isHost ? (
          <button
            type="button"
            onClick={handleStartAnotherRace}
            className="w-full rounded-xl bg-emerald-600 px-5 py-3.5 font-bold text-white transition hover:bg-emerald-500 active:scale-[0.99]"
          >
            Começar outra partida
          </button>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-700 px-4 py-3 text-center text-sm text-slate-400">
            Aguardando o professor iniciar outra partida...
          </p>
        )}
      </section>
    </main>
  );
}
