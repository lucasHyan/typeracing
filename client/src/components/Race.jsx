import { useEffect, useRef, useState } from "react";
import RaceTrack from "./RaceTrack";
import TypingArea from "./TypingArea";
import { shakeElement } from "./animations";
import { calculateProgress, calculateWpm, getInputUpdate } from "./typingUtils";
import socket from "../services/socket";
import { getPlayerId } from "../utils/playerIdentity.js";
import ThemeToggle from "./ThemeToggle.jsx";

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

  const handleInputChange = (event) => {
    if (isFinished || countdownSeconds !== null || !startTime) return;

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
      }
    }
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
    });

    if (finished) {
      setElapsedMs(nextElapsedMs);
      setFinalWpm(nextWpm);
      setIsFinished(true);
    }
  };

  const progress = calculateProgress(userInput.length, targetText.length);
  const wpm = finalWpm ?? calculateWpm(userInput.length, elapsedMs);
  const players = Object.values(room.players || {});
  const ranking = [...players].sort(
    (first, second) => (second.progress || 0) - (first.progress || 0),
  );
  const remainingSeconds = room.raceEndAt
    ? Math.max(0, Math.ceil((room.raceEndAt - clockTick) / 1000))
    : null;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const elapsedTime = `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;

  return (
    <main
      ref={screenRef}
      className="theme-main h-screen overflow-hidden px-4 py-3 sm:px-6"
    >
      <header className="mx-auto flex h-14 max-w-[1280px] items-center justify-between">
        <button
          type="button"
          onClick={onLeaveRoom}
          className="text-2xl font-extrabold tracking-tight"
          aria-label="Voltar à tela inicial"
        >
          Type<span className="text-[#FF6B2B]">Racing</span>
        </button>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          <div className="theme-card flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
            Servidor Online
          </div>
        </div>
      </header>

      <div className="mx-auto flex h-[calc(100vh-68px)] max-w-[1280px] flex-col gap-4">
        <section className="relative">
          <div className="mb-2 flex h-10 items-end justify-between px-1">
            <h1 className="text-xl font-extrabold">A corrida está valendo!</h1>
            <span className="rounded-full bg-[#DDF7E8] px-3 py-1.5 text-[10px] font-bold uppercase text-[#16A34A]">
              • Ao vivo
            </span>
          </div>
          <RaceTrack players={players} currentPlayerId={playerId} />
          {countdownSeconds !== null && countdownSeconds !== undefined && (
            <div
              className="absolute inset-12 z-30 flex items-center justify-center rounded-2xl bg-[var(--theme-background)]/35 backdrop-blur-[1px]"
              aria-live="polite"
            >
              <span className="grid h-24 w-24 place-items-center rounded-full border-4 border-white bg-[#FF6B2B] text-5xl font-black text-white shadow-xl">
                {countdownSeconds}
              </span>
            </div>
          )}
        </section>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[65%_35%]">
          <TypingArea
            targetText={targetText}
            userInput={userInput}
            onInputChange={handleInputChange}
            isFinished={isFinished || countdownSeconds !== null}
            raceStartTime={raceStartTime}
            difficulty={room.difficulty || "Intermediário"}
          />

          <aside className="grid min-h-0 grid-rows-[86px_1fr] gap-4">
            <div className="grid grid-cols-2 gap-4">
              <section className="theme-card grid place-items-center rounded-2xl border px-3 text-center shadow-sm">
                <div>
                  <strong className="block text-2xl font-extrabold">
                    {wpm} PPM
                  </strong>
                  <span className="mt-1 block text-xs text-[#64748B]">
                    Velocidade
                  </span>
                </div>
              </section>
              <section className="theme-card grid place-items-center rounded-2xl border px-3 text-center shadow-sm">
                <div>
                  <strong className="block text-2xl font-extrabold tabular-nums">
                    {elapsedTime}
                  </strong>
                  <span className="mt-1 block text-xs text-[#64748B]">
                    Tempo decorrido
                  </span>
                </div>
              </section>
            </div>

            <section className="theme-card min-h-0 overflow-hidden rounded-2xl border p-4 shadow-sm">
              <h2 className="mb-3 text-base font-extrabold">Ranking ao Vivo</h2>
              <ol className="space-y-1">
                {ranking.map((player, index) => {
                  const isCurrent = player.id === playerId;
                  return (
                    <li
                      key={player.id}
                      className={`flex items-center rounded-lg px-2 py-2 text-xs ${isCurrent ? "bg-[#FFF1E8]" : ""}`}
                    >
                      <span className="w-8 font-bold text-[#94A3B8]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="mr-2 h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: player.color || "#2563eb" }}
                      />
                      <span className="min-w-0 flex-1 truncate font-semibold">
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
                  <span className="text-xs font-bold text-[#64748B]">
                    Encerrando em {remainingSeconds}s
                  </span>
                  {isHost && (
                    <button
                      type="button"
                      onClick={() =>
                        socket.emit("add_race_time", {
                          roomCode: race.roomCode || room.code,
                        })
                      }
                      className="rounded-lg bg-[#FF6B2B] px-3 py-2 text-xs font-bold text-white"
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
