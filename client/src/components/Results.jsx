import { getRandomRaceText } from "../utils/gamePresentation";
import socket from "../services/socket";
import { getPlayerId } from "../utils/playerIdentity";
import ThemeToggle from "./ThemeToggle.jsx";

function PodiumCar({ color }) {
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

export default function Results({
  room,
  onLeaveRoom,
  theme = "light",
  onToggleTheme,
}) {
  const isHost = room.hostId === getPlayerId();
  const results = [...(room.results || [])].sort((first, second) => {
    if (first.isFinished !== second.isFinished)
      return first.isFinished ? -1 : 1;
    if (first.isFinished && second.isFinished)
      return (first.elapsedMs || 0) - (second.elapsedMs || 0);
    return (second.progress || 0) - (first.progress || 0);
  });
  const difficultyLabel = room.difficulty || "Intermediário";
  const firstPlace = results[0];
  const secondPlace = results[1];
  const thirdPlace = results[2];

  const handleStartAnotherRace = () => {
    socket.emit("return_to_lobby", {
      roomCode: room.code,
      targetText: getRandomRaceText(room.targetText),
    });
  };

  const handleExportCsv = () => {
    const escapeCsvValue = (value) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = [
      ["Posição", "Nome", "PPM", "Erros", "Tempo Final"],
      ...results.map((player, index) => [
        index + 1,
        player.name,
        player.wpm || 0,
        player.errors || 0,
        player.isFinished
          ? formatRaceTime(player.elapsedMs)
          : `${player.progress || 0}%`,
      ]),
    ];
    const csvContent = rows
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8",
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `typeracing-${room.code}-resultados.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  };

  const renderPodiumCard = (player, place) => {
    if (!player) return null;
    const isFirst = place === 1;
    const isSecond = place === 2;
    const errors = player.errors || 0;

    return (
      <div
        className={`flex flex-col items-center ${isFirst ? "md:-mt-6" : ""}`}
      >
        <div className="mb-1">
          <PodiumCar color={player.color || "#2563eb"} />
        </div>
        <section
          className={`relative flex w-full flex-col items-center justify-center rounded-2xl border text-center ${isFirst ? "h-56 border-[#FFB703] bg-[#FFB703] text-[#14181F]" : isSecond ? "theme-card h-44 border-t-4 border-t-[#00A8E8]" : "theme-card h-36 border-t-4 border-t-[#FF6B2B]"}`}
        >
          <span
            className={`absolute -top-5 grid h-11 w-11 place-items-center rounded-full border-4 border-white text-sm font-black ${isFirst ? "bg-[#FFF8F0] text-[#1E242B]" : "bg-[#FFF8F0] text-[#64748B]"}`}
          >
            {place}º
          </span>
          <p
            className={`${isFirst ? "mt-1 text-lg" : "mt-2 text-sm"} font-extrabold ${isFirst ? "text-[#14181F]" : ""}`}
          >
            {player.name}
          </p>
          <strong
            className={`${isFirst ? "mt-1 text-4xl" : "mt-2 text-2xl"} font-black ${isFirst ? "text-[#14181F]" : ""}`}
          >
            {player.wpm || 0} PPM
          </strong>
          <div className="mt-3 grid grid-cols-3 gap-1 px-2">
            <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold text-[#1E242B]">
              {player.progress || 0}%
            </span>
            <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold text-[#1E242B]">
              {formatFinalTime(player.elapsedMs)}
            </span>
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-bold ${errors === 0 ? "bg-white text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}
            >
              {errors} {errors === 1 ? "erro" : "erros"}
            </span>
          </div>
        </section>
      </div>
    );
  };

  function formatFinalTime(milliseconds = 0) {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  return (
    <main className="theme-main h-screen overflow-hidden px-4 py-3 sm:px-6">
      <header className="mx-auto flex h-14 max-w-[1280px] items-center justify-between">
        <div className="flex items-center text-2xl font-extrabold tracking-tight">
          <img
            src="/logo_small.png"
            alt=""
            className="mr-2 h-9 w-9 object-contain"
          />
          <span>
            Type<span className="text-[#FF6B2B]">Racing</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          <div className="theme-card flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
            Servidor Online
          </div>
        </div>
      </header>

      <div className="mx-auto flex h-[calc(100vh-68px)] max-w-4xl flex-col items-center">
        <header className="pt-1 text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Pódio da Corrida!
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Sala {room.code} • Dificuldade: {difficultyLabel}
          </p>
        </header>

        <section className="mt-8 grid w-full grid-cols-3 items-end gap-3 px-2 sm:gap-5">
          {results.length >= 2 ? renderPodiumCard(secondPlace, 2) : <div />}
          {renderPodiumCard(firstPlace, 1)}
          {results.length >= 3 ? renderPodiumCard(thirdPlace, 3) : <div />}
        </section>

        {results.length >= 4 && (
          <section className="theme-card mt-5 w-full rounded-2xl border px-4 py-3">
            {results.slice(3).map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-center gap-2 text-center text-xs font-semibold sm:text-sm"
              >
                <span>
                  {String(index + 4).padStart(2, "0")} • {player.name}
                </span>
                <span>
                  — {player.wpm || 0} PPM • {player.progress || 0}% •{" "}
                  {formatFinalTime(player.elapsedMs)} • {player.errors || 0}{" "}
                  {(player.errors || 0) === 1 ? "erro" : "erros"}
                </span>
              </div>
            ))}
          </section>
        )}

        <footer className="mt-auto flex flex-col items-center pb-4 pt-5">
          {isHost ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleStartAnotherRace}
                className="rounded-xl bg-[#FF6B2B] px-8 py-3.5 font-bold text-white transition hover:bg-[#E55A1F]"
              >
                Jogar Novamente
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="theme-card rounded-xl border-2 border-[#00A8E8] px-8 py-3.5 font-bold text-[#00A8E8] transition hover:bg-[#28303B]"
              >
                Exportar CSV
              </button>
            </div>
          ) : (
            <p className="text-sm font-medium text-[#64748B]">
              Aguardando o dono da sala...
            </p>
          )}
          <button
            type="button"
            onClick={onLeaveRoom}
            className="mt-4 text-sm font-medium text-[#64748B] transition hover:text-[#1E242B]"
          >
            ← Voltar à tela inicial
          </button>
        </footer>
      </div>
    </main>
  );
}
