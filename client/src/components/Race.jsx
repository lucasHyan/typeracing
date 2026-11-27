import { useEffect, useRef, useState } from "react";
import RaceTrack from "./RaceTrack";
import TypingArea from "./TypingArea";
import { shakeElement } from "./animations";
import { calculateProgress, calculateWpm, getInputUpdate } from "./typingUtils";
import socket from "../services/socket";
import { playSound, stopSound } from "../services/sound.js";
import { getPlayerId } from "../utils/playerIdentity.js";
import AppHeader from "./AppHeader.jsx";

export default function Race({
  room,
  race,
  countdownSeconds = null,
  onLeaveRoom,
  theme = "light",
  onToggleTheme,
}) {
  const targetText = race?.targetText || room.targetText || "";
  const raceStartTime = race?.startTime || null;
  const playerId = getPlayerId();
  const [userInput, setUserInput] = useState("");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [finalWpm, setFinalWpm] = useState(null);
  const [errorCount, setErrorCount] = useState(0);
  const [clockTick, setClockTick] = useState(Date.now());
  const [startTime, setStartTime] = useState(raceStartTime);
  const screenRef = useRef(null);
  const errorCountRef = useRef(0);
  // Tecla esperada -> quantas vezes o jogador errou nela (vai para o pódio).
  const missedKeysRef = useRef({});
  const isHost = room.hostId === playerId;

  useEffect(() => {
    setUserInput("");
    setIsFinished(false);
    setStartTime(raceStartTime);
    setFinalWpm(null);
    setElapsedMs(0);
    setErrorCount(0);
    setClockTick(Date.now());
    errorCountRef.current = 0;
    missedKeysRef.current = {};
  }, [targetText, raceStartTime, room?.status]);

  useEffect(() => {
    if (!startTime || isFinished) return undefined;
    const updateElapsedTime = () =>
      setElapsedMs(Math.max(0, Date.now() - startTime));
    updateElapsedTime();
    const intervalId = setInterval(updateElapsedTime, 100);
    return () => clearInterval(intervalId);
  }, [startTime, isFinished]);

  useEffect(() => {
    if (!room.raceEndAt) return undefined;
    const intervalId = setInterval(() => setClockTick(Date.now()), 100);
    return () => clearInterval(intervalId);
  }, [room.raceEndAt]);

  // Contagem regressiva 3-2-1 e largada (só no PC do dono da sala).
  // A ref evita tocar duas vezes o mesmo momento (ex.: StrictMode em desenvolvimento).
  const lastCueRef = useRef(null);
  useEffect(() => {
    if (typeof countdownSeconds === "number" && countdownSeconds > 0) {
      const cue = `countdown-${countdownSeconds}`;
      if (lastCueRef.current === cue) return;
      lastCueRef.current = cue;
      playSound("countdownTick", { isHost });
    }
  }, [countdownSeconds, isHost]);

  // Largada: só quando a corrida acabou de começar (não para quem entra no meio).
  useEffect(() => {
    if (!raceStartTime || Date.now() - raceStartTime > 2000) return;
    const cue = `start-${raceStartTime}`;
    if (lastCueRef.current === cue) return;
    lastCueRef.current = cue;
    playSound("raceStart", { isHost });
  }, [raceStartTime, isHost]);

  const handleInputChange = (event) => {
    if (isFinished || countdownSeconds !== null || !startTime) return;

    // Anti-cola: ignora texto colado/arrastado e saltos de vários caracteres de uma vez.
    const inputType = event.nativeEvent?.inputType || "";
    // Tab no modo código (TypingArea) insere só os espaços de indentação esperados.
    // Fim de uma composição de acento: pode entrar mais de 1 caractere de uma vez
    // (ex.: ´ + d vira "´d"), então não conta como "colar".
    const isComposition =
      inputType === "insertCompositionText" &&
      event.target.value.length - userInput.length <= 3;
    const isAutoIndent =
      inputType === "insertAutoIndent" &&
      event.target.value.startsWith(userInput) &&
      /^ +$/.test(event.target.value.slice(userInput.length));
    const isPasteLike =
      !isAutoIndent &&
      !isComposition &&
      (inputType === "insertFromPaste" ||
        inputType === "insertFromDrop" ||
        inputType === "insertFromPasteAsQuotation" ||
        event.target.value.length - userInput.length > 1);
    if (isPasteLike) {
      shakeElement(screenRef.current);
      return;
    }

    const { input: nextInput, shouldShake } = getInputUpdate(
      targetText,
      userInput,
      event.target.value,
    );
    if (shouldShake) shakeElement(screenRef.current);
    setUserInput(nextInput);

    let newErrors = 0;
    const maximumLength = Math.max(userInput.length, nextInput.length);
    for (let index = 0; index < maximumLength; index += 1) {
      if (
        userInput[index] !== nextInput[index] &&
        nextInput[index] !== undefined &&
        nextInput[index] !== targetText[index]
      ) {
        newErrors += 1;
        const expectedKey = targetText[index];
        if (expectedKey !== undefined) {
          missedKeysRef.current = {
            ...missedKeysRef.current,
            [expectedKey]: (missedKeysRef.current[expectedKey] || 0) + 1,
          };
        }
      }
    }
    if (newErrors > 0) playSound("typingError");
    const nextErrorCount = errorCountRef.current + newErrors;
    errorCountRef.current = nextErrorCount;
    setErrorCount(nextErrorCount);

    const nextElapsedMs = Math.max(1, Date.now() - startTime);
    const nextWpm = calculateWpm(nextInput.length, nextElapsedMs);
    const finished = nextInput === targetText;

    socket.emit("send_progress", {
      roomCode: race.roomCode || room.code,
      input: nextInput,
      wpm: nextWpm,
      errors: nextErrorCount,
      missedKeys: missedKeysRef.current,
    });

    if (finished) {
      playSound("finished");
      setElapsedMs(nextElapsedMs);
      setFinalWpm(nextWpm);
      setIsFinished(true);
    }
  };

  const handleLeaveRace = () => {
    const isWatching = Boolean(room.players?.[playerId]?.isSpectator);
    const message = isHost
      ? "Você é o dono da sala: sair agora encerra a corrida para todos. Deseja sair?"
      : isWatching
        ? "Deseja sair da sala?"
        : "Deseja sair da corrida? Seu progresso será perdido.";
    if (window.confirm(message)) onLeaveRoom?.();
  };

  const progress = calculateProgress(userInput.length, targetText.length);
  const wpm = finalWpm ?? calculateWpm(userInput.length, elapsedMs);
  const allPlayers = Object.values(room.players || {});
  // Espectadores (entraram com a corrida em andamento) ficam fora da pista e do ranking.
  const players = allPlayers.filter((player) => !player.isSpectator);
  const spectatorCount = allPlayers.length - players.length;
  const isSpectator = Boolean(room.players?.[playerId]?.isSpectator);
  const isCodeText =
    room.difficulty === "Programador" || targetText.includes("\n");
  const ranking = [...players].sort(
    (first, second) => (second.progress || 0) - (first.progress || 0),
  );
  const remainingSeconds = room.raceEndAt
    ? Math.max(0, Math.ceil((room.raceEndAt - clockTick) / 1000))
    : null;
  // Aviso de tempo: toca quando o 1º carro cruza a chegada e o servidor liga o
  // timer de 20s (raceEndAt aparece). SÓ no PC do dono da sala, uma vez por corrida
  // (o +10s não toca de novo).
  const timeWarningRef = useRef(null);
  const timeWarningPlayedRef = useRef(false);
  const finishTimerStarted = Boolean(room.raceEndAt);
  useEffect(() => {
    if (!finishTimerStarted || timeWarningPlayedRef.current) return;
    timeWarningPlayedRef.current = true;
    timeWarningRef.current = playSound("timeWarning", { isHost });
  }, [finishTimerStarted, isHost]);
  useEffect(
    () => () => {
      stopSound(timeWarningRef.current);
      timeWarningRef.current = null;
    },
    [],
  );
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const elapsedTime = `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;

  return (
    <main ref={screenRef} className="theme-main min-h-screen px-4 pb-8 pt-3 sm:px-6">
      <AppHeader
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLeave={handleLeaveRace}
        onHome={handleLeaveRace}
      />

      <div className="mx-auto mt-6 flex max-w-[960px] flex-col gap-6">
        <section className="theme-card relative rounded-2xl border p-5 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h1 className="text-xl font-extrabold sm:text-2xl">
              A corrida está valendo!
            </h1>
            <div className="flex items-center gap-2">
              {spectatorCount > 0 && (
                <span className="theme-elevated theme-secondary rounded-full px-3 py-1.5 text-xs font-bold">
                  👀 {spectatorCount} assistindo
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full bg-[#DDF7E8] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#15803D] dark:bg-[#163026] dark:text-[#4ADE80]">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Ao vivo
              </span>
            </div>
          </div>
          <RaceTrack players={players} currentPlayerId={playerId} />
          {countdownSeconds !== null && countdownSeconds !== undefined && (
            <div
              className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-[var(--theme-background)]/50 backdrop-blur-[2px]"
              aria-live="polite"
            >
              <span className="grid h-24 w-24 place-items-center rounded-full border-4 border-white bg-[#FF6B2B] text-5xl font-black text-white shadow-xl">
                {countdownSeconds}
              </span>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
          {isSpectator ? (
            <section className="theme-card flex flex-col rounded-2xl border p-6 shadow-sm sm:p-7">
              <span className="w-fit rounded-full bg-[var(--theme-highlight)] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[var(--theme-highlight-text)]">
                👀 Modo espectador
              </span>
              <h2 className="mt-3 text-xl font-extrabold">
                A corrida já estava em andamento
              </h2>
              <p className="theme-secondary mt-1 text-base">
                Acompanhe pela pista e pelo ranking. Quando esta corrida
                terminar, você entra como jogador e participa da próxima.
              </p>
              <p className="theme-secondary mt-5 text-xs font-bold uppercase tracking-widest">
                Texto desta corrida
              </p>
              <pre
                className={`theme-elevated mt-2 whitespace-pre-wrap break-words rounded-xl px-4 py-3 leading-relaxed ${
                  isCodeText ? "font-mono text-base" : "font-sans text-lg"
                }`}
              >
                {targetText}
              </pre>
            </section>
          ) : (
            <TypingArea
              targetText={targetText}
              userInput={userInput}
              onInputChange={handleInputChange}
              isFinished={isFinished || countdownSeconds !== null}
              raceStartTime={raceStartTime}
              difficulty={
                room.isCustomText
                  ? "Customizado"
                  : room.difficulty || "Intermediário"
              }
              isCode={isCodeText}
              onBlockedAction={() => shakeElement(screenRef.current)}
            />
          )}

          <aside className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <section className="theme-card rounded-2xl border px-4 py-4 shadow-sm">
                <strong className="block text-[28px] font-extrabold leading-tight tabular-nums">
                  {isSpectator ? players.length : `${wpm} PPM`}
                </strong>
                <span className="theme-secondary mt-1 block text-sm">
                  {isSpectator ? "Correndo agora" : "Velocidade"}
                </span>
              </section>
              <section className="theme-card rounded-2xl border px-4 py-4 shadow-sm">
                <strong className="block text-[28px] font-extrabold leading-tight tabular-nums">
                  {elapsedTime}
                </strong>
                <span className="theme-secondary mt-1 block text-sm">
                  Tempo decorrido
                </span>
              </section>
            </div>

            <section className="theme-card flex-1 rounded-2xl border p-3 shadow-sm">
              <h2 className="px-2 pb-2 pt-2 text-lg font-extrabold">
                Ranking ao Vivo
              </h2>
              <ol className="space-y-1">
                {ranking.map((player, index) => {
                  const isCurrent = player.id === playerId;
                  return (
                    <li
                      key={player.id}
                      className={`flex items-center rounded-lg px-2.5 py-2.5 text-sm ${isCurrent ? "bg-[var(--theme-highlight)]" : ""}`}
                    >
                      <span
                        className={`w-8 font-bold tabular-nums ${isCurrent ? "text-[var(--theme-highlight-text)]" : "theme-secondary"}`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="mr-2.5 h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: player.color || "#2563eb" }}
                      />
                      <span
                        className={`min-w-0 flex-1 truncate ${isCurrent ? "font-extrabold" : "font-medium"}`}
                      >
                        {player.name}
                      </span>
                      <strong className="tabular-nums">
                        {player.progress || 0}%
                      </strong>
                    </li>
                  );
                })}
              </ol>
              {remainingSeconds !== null && (
                <div className="theme-elevated mt-3 flex items-center justify-between rounded-lg px-3 py-2">
                  <span className="theme-secondary text-sm font-bold">
                    Encerrando em {remainingSeconds}s
                  </span>
                  {isHost && (
                    <button
                      type="button"
                      onClick={() => {
                        playSound("timeAdded", { isHost });
                        socket.emit("add_race_time", {
                          roomCode: race.roomCode || room.code,
                        });
                      }}
                      className="cursor-pointer rounded-lg bg-[#FF6B2B] px-3 py-2 text-xs font-bold text-white"
                    >
                      +10s
                    </button>
                  )}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
