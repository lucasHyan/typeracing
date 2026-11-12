export default function LobbyEntry({
  playerName,
  roomCode,
  isBusy,
  onPlayerNameChange,
  onRoomCodeChange,
  onCreateRoom,
  onJoinRoom,
}) {
  return (
    <section className="w-full max-w-2xl space-y-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl sm:p-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-200">Identificação do piloto</h2>
        <label
          htmlFor="player-name"
          className="mb-2 mt-4 block text-sm font-medium text-slate-400"
        >
          Apelido
        </label>
        <input
          id="player-name"
          type="text"
          value={playerName}
          onChange={(event) => onPlayerNameChange(event.target.value)}
          placeholder="Ex.: Ayrton"
          maxLength={18}
          autoComplete="nickname"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 border-t border-slate-700 pt-6 md:grid-cols-2">
        <section className="flex flex-col justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-100">Criar uma sala</h3>
            <p className="mt-1 text-sm text-slate-400">
              Professor, crie a sala e compartilhe o código com os alunos.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateRoom}
            disabled={isBusy}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? 'Conectando...' : 'Criar sala'}
          </button>
        </section>

        <section className="flex flex-col justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-100">Entrar em uma sala</h3>
            <p className="mt-1 text-sm text-slate-400">
              Digite o código de 5 caracteres fornecido pelo professor.
            </p>
          </div>
          <form onSubmit={onJoinRoom} className="space-y-3">
            <label htmlFor="room-code" className="sr-only">Código da sala</label>
            <input
              id="room-code"
              type="text"
              value={roomCode}
              onChange={(event) => onRoomCodeChange(event.target.value.toUpperCase())}
              placeholder="CÓDIGO"
              maxLength={5}
              autoComplete="off"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-center font-mono font-bold tracking-widest text-sky-400 placeholder-slate-600 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={isBusy}
              className="w-full rounded-lg bg-slate-800 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? 'Conectando...' : 'Entrar na sala'}
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}
