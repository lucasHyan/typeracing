import { useState, useEffect, useRef } from "react";
import RaceTrack from "./RaceTrack";
import TypingArea from "./TypingArea";
import { RACE_TEXTS } from "../raceTexts.js";
import { shakeElement } from "./animations";
import {
  calculateProgress,
  calculateWpm,
  getInputUpdate,
  getRandomParagraph,
} from "./typingUtils";

// Modo solo: frases dos níveis Iniciante e Intermediário.
const paragraphs = [...RACE_TEXTS.Iniciante, ...RACE_TEXTS.Intermediário];

export default function Typing() {
  const [targetText, setTargetText] = useState(() =>
    getRandomParagraph(paragraphs),
  );
  const [userInput, setUserInput] = useState("");
  const [playerName, setPlayerName] = useState("Aluno");
  const [carColor, setCarColor] = useState("#2563eb");
  const [startTimeMs, setStartTimeMs] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const screenRef = useRef(null);

  const handleInputChange = (event) => {
    if (isFinished) return;
    const { input: nextInput, shouldShake } = getInputUpdate(
      targetText,
      userInput,
      event.target.value,
    );
    if (shouldShake) shakeElement(screenRef.current);
    setUserInput(nextInput);

    const nextStartTime = startTimeMs ?? Date.now();
    if (!startTimeMs && nextInput.length > 0) setStartTimeMs(nextStartTime);

    if (nextInput === targetText) {
      setElapsedMs(Date.now() - nextStartTime);
      setIsFinished(true);
    }
  };

  const progress = calculateProgress(userInput.length, targetText.length);
  const wpm = calculateWpm(userInput.length, elapsedMs);

  useEffect(() => {
    if (!startTimeMs || isFinished) return undefined;
    const updateElapsedTime = () => setElapsedMs(Date.now() - startTimeMs);
    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 250);
    return () => clearInterval(interval);
  }, [startTimeMs, isFinished]);

  const players = [
    { id: "local", name: playerName, color: carColor, progress, wpm },
  ];
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const elapsedTime = `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;

  const restartGame = () => {
    setUserInput("");
    setStartTimeMs(null);
    setElapsedMs(0);
    setIsFinished(false);
    setTargetText(getRandomParagraph(paragraphs));
  };

  return (
    <main
      ref={screenRef}
      className="h-[calc(100vh-48px)] overflow-hidden bg-[#FFF8F0] text-[#1E242B]"
    >
      <header className="mx-auto flex h-14 max-w-[1280px] items-center justify-between">
        <button
          type="button"
          className="text-2xl font-extrabold tracking-tight"
          onClick={restartGame}
        >
          Type<span className="text-[#FF6B2B]">Racing</span>
        </button>
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
          Modo Solo
        </div>
      </header>

      <div className="mx-auto flex h-[calc(100%-56px)] max-w-[1280px] flex-col gap-4">
        <section className="relative">
          <div className="mb-2 flex h-10 items-end justify-between px-1">
            <h1 className="text-xl font-extrabold">A corrida está valendo!</h1>
            <span className="rounded-full bg-[#DDF7E8] px-3 py-1.5 text-[10px] font-bold uppercase text-[#16A34A]">
              • Ao vivo
            </span>
          </div>
          <RaceTrack players={players} currentPlayerId="local" />
        </section>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[65%_35%]">
          <TypingArea
            targetText={targetText}
            userInput={userInput}
            onInputChange={handleInputChange}
            isFinished={isFinished}
            difficulty="Iniciante"
          />
          <aside className="grid min-h-0 grid-rows-[86px_1fr] gap-4">
            <div className="grid grid-cols-2 gap-4">
              <section className="grid place-items-center rounded-2xl border border-[#E9DCCB] bg-white px-3 text-center">
                <div>
                  <strong className="block text-2xl font-extrabold">
                    {wpm} PPM
                  </strong>
                  <span className="mt-1 block text-xs text-[#64748B]">
                    Velocidade
                  </span>
                </div>
              </section>
              <section className="grid place-items-center rounded-2xl border border-[#E9DCCB] bg-white px-3 text-center">
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
            <section className="rounded-2xl border border-[#E9DCCB] bg-white p-4">
              <h2 className="mb-3 text-base font-extrabold">Ranking ao Vivo</h2>
              <div className="flex items-center rounded-lg bg-[#FFF1E8] px-2 py-3 text-xs">
                <span className="w-8 font-bold text-[#94A3B8]">01</span>
                <span
                  className="mr-2 h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: carColor }}
                />
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {playerName}
                </span>
                <strong>{progress}%</strong>
              </div>
              {isFinished && (
                <button
                  type="button"
                  onClick={restartGame}
                  className="mt-4 w-full rounded-xl bg-[#16A34A] py-3 text-sm font-bold text-white"
                >
                  Jogar Novamente
                </button>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
