import { formatRaceTime, getNextRaceText } from "../utils/gamePresentation";
import socket from "../services/socket";
import { getPlayerId } from "../utils/playerIdentity";
import AppHeader from "./AppHeader.jsx";
import VehicleAvatar from "./VehicleAvatar.jsx";

// Intervalo entre a revelação de cada colocado (3º → 2º → 1º), em segundos.
const REVEAL_STEP = 0.8;
const REVEAL_START = 0.2;

const PODIUM_STYLES = {
  1: {
    card: "min-h-[360px] bg-[#FFB703] text-[#14181F] podium-winner",
    badge: "h-14 w-14 text-xl border-[#A16207]/40 bg-[#FFF3C4] text-[#7C4A03]",
    name: "text-2xl sm:text-3xl",
    wpm: "text-5xl sm:text-6xl",
    stat: "bg-white/75 text-[#14181F]",
    statLabel: "text-[#5B4300]",
    key: "border-[#A16207]/30 bg-white text-[#14181F]",
    muted: "text-[#5B4300]",
  },
  2: {
    card: "theme-card min-h-[320px] border border-t-[6px] border-t-[#00A8E8]",
    badge:
      "h-11 w-11 text-base border-[#CBD5E1] bg-[#F1F5F9] text-[#475569] dark:border-[#52617A] dark:bg-[#28303B] dark:text-[#E2E8F0]",
    name: "text-xl sm:text-2xl",
    wpm: "text-4xl",
    stat: "bg-[var(--theme-elevated)]",
    statLabel: "theme-secondary",
    key: "border-[var(--theme-border)] bg-[var(--theme-elevated)]",
    muted: "theme-secondary",
  },
  3: {
    card: "theme-card min-h-[296px] border border-t-[6px] border-t-[#FF6B2B]",
    badge:
      "h-10 w-10 text-sm border-[#F4B08A] bg-[#FFE4D4] text-[#9A3412] dark:border-[#9A3412] dark:bg-[#3A2A22] dark:text-[#FFB48F]",
    name: "text-xl",
    wpm: "text-4xl",
    stat: "bg-[var(--theme-elevated)]",
    statLabel: "theme-secondary",
    key: "border-[var(--theme-border)] bg-[var(--theme-elevated)]",
    muted: "theme-secondary",
  },
};

function formatKey(key) {
  if (key === " ") return "espaço";
  if (key === "\n") return "enter";
  return key;
}

function getTopMissedKeys(missedKeys = {}, limit = 4) {
  return Object.entries(missedKeys)
    .filter(([, count]) => count > 0)
    .sort((first, second) => second[1] - first[1])
    .slice(0, limit);
}

function getAccuracy(player) {
  if (typeof player.accuracy === "number") return player.accuracy;
  const typed = player.charsTyped ?? (player.input || "").length;
  const errors = player.errors || 0;
  if (typed + errors === 0) return null;
  return Math.round((typed / (typed + errors)) * 1000) / 10;
}

function formatAccuracy(player) {
  const accuracy = getAccuracy(player);
  return accuracy === null ? "—" : `${accuracy.toLocaleString("pt-BR")}%`;
}

function formatTime(player) {
  return player.isFinished ? formatRaceTime(player.elapsedMs || 0) : "—";
}

function MissedKeys({ missedKeys, keyClassName, mutedClassName, limit }) {
  const topKeys = getTopMissedKeys(missedKeys, limit);
  if (topKeys.length === 0) {
    return (
      <span className={`text-sm font-semibold ${mutedClassName}`}>
        Nenhuma tecla errada
      </span>
    );
  }

  return (
    <span className="flex flex-wrap justify-center gap-1.5">
      {topKeys.map(([key, count]) => (
        <span
          key={key}
          className={`inline-flex items-center gap-1 rounded-md border-2 border-b-4 px-2 py-0.5 text-sm font-bold ${keyClassName}`}
          title={`Errou "${formatKey(key)}" ${count} ${count === 1 ? "vez" : "vezes"}`}
        >
          <kbd className="font-mono">{formatKey(key)}</kbd>
          <span className="text-xs opacity-75">×{count}</span>
        </span>
      ))}
    </span>
  );
}

export default function Results({
  room,
  onLeaveRoom,
  theme = "light",
  onToggleTheme,
}) {
  const playerId = getPlayerId();
  const isHost = room.hostId === playerId;
  const results = [...(room.results || [])].sort((first, second) => {
    if (first.isFinished !== second.isFinished)
      return first.isFinished ? -1 : 1;
    if (first.isFinished && second.isFinished)
      return (first.elapsedMs || 0) - (second.elapsedMs || 0);
    return (second.progress || 0) - (first.progress || 0);
  });
  const difficultyLabel = room.isCustomText
    ? "Customizado"
    : room.difficulty || "Intermediário";
  const podiumCount = Math.min(3, results.length);
  const revealDelay = (place) =>
    REVEAL_START + (podiumCount - place) * REVEAL_STEP;
  const detailsDelay = REVEAL_START + podiumCount * REVEAL_STEP + 0.2;

  // Ordem visual do pódio: 2º, 1º, 3º (só os que existem).
  const podiumOrder = [2, 1, 3].filter((place) => place <= results.length);

  // Resumo da turma.
  const finishedCount = results.filter((player) => player.isFinished).length;
  const averageWpm = results.length
    ? Math.round(
        results.reduce((sum, player) => sum + (player.wpm || 0), 0) /
          results.length,
      )
    : 0;
  const mostAccurate = results.reduce((best, player) => {
    const accuracy = getAccuracy(player);
    if (accuracy === null) return best;
    return !best || accuracy > best.accuracy ? { player, accuracy } : best;
  }, null);
  const classMissedKeys = results.reduce((totals, player) => {
    Object.entries(player.missedKeys || {}).forEach(([key, count]) => {
      totals[key] = (totals[key] || 0) + count;
    });
    return totals;
  }, {});
  const [classTopKey] = getTopMissedKeys(classMissedKeys, 1);

  const handleStartAnotherRace = () => {
    socket.emit("return_to_lobby", {
      roomCode: room.code,
      targetText: getNextRaceText(room),
    });
  };

  const handleExportCsv = () => {
    const escapeCsvValue = (value) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = [
      [
        "Posição",
        "Nome",
        "PPM",
        "Tempo Final",
        "Progresso",
        "Precisão",
        "Erros",
        "Teclas erradas",
      ],
      ...results.map((player, index) => [
        index + 1,
        player.name,
        player.wpm || 0,
        player.isFinished ? formatRaceTime(player.elapsedMs) : "Não terminou",
        `${player.progress || 0}%`,
        formatAccuracy(player),
        player.errors || 0,
        getTopMissedKeys(player.missedKeys, Infinity)
          .map(([key, count]) => `${formatKey(key)} x${count}`)
          .join("; "),
      ]),
    ];
    const csvContent = rows
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");
    const blob = new Blob([`﻿${csvContent}`], {
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

  const handleLeave = () => {
    if (
      isHost &&
      !window.confirm(
        "Você é o dono da sala: sair agora encerra a sala para todos. Deseja sair?",
      )
    )
      return;
    onLeaveRoom?.();
  };

  const renderPodiumCard = (place) => {
    const player = results[place - 1];
    if (!player) return null;
    const style = PODIUM_STYLES[place];
    const isFirst = place === 1;
    const isCurrent = player.id === playerId;
    const delay = { "--reveal-delay": `${revealDelay(place)}s` };

    return (
      <div
        key={player.id}
        className="podium-reveal flex w-full min-w-0 max-w-[300px] flex-1 flex-col items-center"
        style={delay}
      >
        <VehicleAvatar
          emoji={player.emoji}
          color={player.color || "#2563eb"}
          size={isFirst ? "lg" : "md"}
          className="podium-car mb-3"
        />
        <section
          className={`flex w-full flex-col items-center rounded-2xl px-3 pb-5 pt-5 text-center shadow-sm sm:px-4 ${style.card}`}
          style={delay}
          aria-label={`${place}º lugar: ${player.name}`}
        >
          <span
            className={`grid shrink-0 place-items-center rounded-full border-2 font-black ${style.badge}`}
          >
            {place}º
          </span>
          <p
            className={`mt-2 max-w-full truncate font-extrabold leading-tight ${style.name}`}
          >
            {player.name}
            {isCurrent && (
              <span className={`ml-1.5 text-sm font-bold ${style.muted}`}>
                (você)
              </span>
            )}
          </p>
          <strong
            className={`mt-1 font-black leading-none tracking-tight ${style.wpm}`}
          >
            {player.wpm || 0}
            <span className="ml-1.5 text-[0.45em] font-extrabold">PPM</span>
          </strong>

          <dl className="mt-4 grid w-full grid-cols-3 gap-1.5 text-center">
            {[
              ["Tempo", formatTime(player)],
              ["Precisão", formatAccuracy(player)],
              ["Erros", player.errors || 0],
            ].map(([label, value]) => (
              <div
                key={label}
                className={`flex flex-col-reverse rounded-lg px-1 py-2 ${style.stat}`}
              >
                <dt
                  className={`mt-0.5 text-[11px] font-bold uppercase tracking-wide ${style.statLabel}`}
                >
                  {label}
                </dt>
                <dd className="text-sm font-extrabold tabular-nums sm:text-base">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {!player.isFinished && (
            <p className={`mt-2 text-sm font-semibold ${style.muted}`}>
              Não terminou · {player.progress || 0}% concluído
            </p>
          )}

          <div className="mt-auto w-full pt-4">
            <p
              className={`mb-1.5 text-[11px] font-bold uppercase tracking-wide ${style.statLabel}`}
            >
              Teclas que mais errou
            </p>
            <MissedKeys
              missedKeys={player.missedKeys}
              keyClassName={style.key}
              mutedClassName={style.muted}
              limit={4}
            />
          </div>
        </section>
      </div>
    );
  };

  return (
    <main className="theme-main min-h-screen px-4 pb-12 pt-3 sm:px-6">
      <AppHeader
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLeave={handleLeave}
        leaveLabel="Sair"
      />

      <div className="mx-auto flex max-w-[960px] flex-col items-center">
        <header className="pt-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Pódio da Corrida!
          </h1>
          <p className="theme-secondary mt-3 text-lg">
            Sala {room.code} • Dificuldade: {difficultyLabel}
          </p>
        </header>

        <section className="mt-8 flex w-full items-end justify-center gap-3 sm:gap-6">
          {podiumOrder.map(renderPodiumCard)}
        </section>

        <div
          className="fade-up mt-8 w-full space-y-6"
          style={{ "--reveal-delay": `${detailsDelay}s` }}
        >
          <section
            aria-label="Resumo da turma"
            className="grid grid-cols-2 gap-3 md:grid-cols-4"
          >
            {[
              ["Média da sala", `${averageWpm} PPM`],
              ["Concluíram", `${finishedCount} de ${results.length}`],
              [
                "Mais preciso",
                mostAccurate
                  ? `${mostAccurate.player.name} · ${mostAccurate.accuracy.toLocaleString("pt-BR")}%`
                  : "—",
              ],
              [
                "Tecla mais errada",
                classTopKey
                  ? `${formatKey(classTopKey[0])} (${classTopKey[1]}×)`
                  : "Nenhuma",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="theme-card rounded-2xl border px-4 py-3 shadow-sm"
              >
                <p className="theme-secondary text-xs font-bold uppercase tracking-wide">
                  {label}
                </p>
                <p className="mt-1 truncate text-lg font-extrabold">{value}</p>
              </div>
            ))}
          </section>

          <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
            <h2 className="px-5 pb-2 pt-4 text-lg font-extrabold">
              Classificação completa
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="theme-secondary text-xs font-bold uppercase tracking-wide">
                  <tr className="border-b border-[var(--theme-border)]">
                    <th className="px-5 py-2.5">#</th>
                    <th className="px-3 py-2.5">Jogador</th>
                    <th className="px-3 py-2.5 text-right">PPM</th>
                    <th className="px-3 py-2.5 text-right">Tempo</th>
                    <th className="px-3 py-2.5 text-right">Precisão</th>
                    <th className="px-3 py-2.5 text-right">Erros</th>
                    <th className="px-5 py-2.5">Teclas mais erradas</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((player, index) => {
                    const isCurrent = player.id === playerId;
                    return (
                      <tr
                        key={player.id}
                        className={`border-b border-[var(--theme-border)] last:border-b-0 ${isCurrent ? "bg-[var(--theme-highlight)]" : ""}`}
                      >
                        <td className="px-5 py-3 font-extrabold tabular-nums">
                          {String(index + 1).padStart(2, "0")}
                        </td>
                        <td className="px-3 py-3">
                          <span className="flex items-center gap-2 font-semibold">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor: player.color || "#2563eb",
                              }}
                            />
                            <span className="max-w-[180px] truncate">
                              {player.name}
                            </span>
                            {isCurrent && (
                              <span className="text-xs font-bold text-[var(--theme-highlight-text)]">
                                você
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-bold tabular-nums">
                          {player.wpm || 0}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {player.isFinished
                            ? formatRaceTime(player.elapsedMs || 0)
                            : `${player.progress || 0}%`}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {formatAccuracy(player)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">
                          {player.errors || 0}
                        </td>
                        <td className="px-5 py-2.5">
                          <span className="flex">
                            <MissedKeys
                              missedKeys={player.missedKeys}
                              keyClassName="border-[var(--theme-border)] bg-[var(--theme-elevated)]"
                              mutedClassName="theme-secondary"
                              limit={5}
                            />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="flex flex-col items-center pt-2">
            {isHost ? (
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleStartAnotherRace}
                  className="cursor-pointer rounded-xl bg-[#FF6B2B] px-11 py-4 text-lg font-bold text-white shadow-sm transition hover:bg-[#E55A1F]"
                >
                  Jogar Novamente
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="cursor-pointer rounded-xl border-2 border-[#00A8E8] bg-[var(--theme-card)] px-10 py-[14px] text-lg font-bold text-[#0284C7] transition hover:bg-[#E0F2FE] dark:border-[#38BDF8] dark:text-[#7DD3FC] dark:hover:bg-[#38BDF8]/15"
                >
                  Exportar CSV
                </button>
              </div>
            ) : (
              <p className="theme-secondary text-base font-medium">
                Aguardando o dono da sala iniciar outra corrida...
              </p>
            )}
          </footer>
        </div>
      </div>
    </main>
  );
}
