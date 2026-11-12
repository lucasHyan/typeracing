import { useEffect, useRef, useState } from 'react';
import RaceTrack from './RaceTrack';
import TypingArea from './TypingArea';
import { shakeElement } from './animations';
import {
  calculateProgress,
  calculateWpm,
  getInputUpdate,
} from './typingUtils';
import socket from '../services/socket';
import { formatRaceTime } from '../utils/gamePresentation';

export default function Race({ room, race }) {
  const targetText = race.targetText || room.targetText;
  const [userInput, setUserInput] = useState('');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const screenRef = useRef(null);
  const startTime = race.startTime;

  useEffect(() => {
    const updateElapsedTime = () => {
      setElapsedMs(Math.max(0, Date.now() - startTime));
    };

    updateElapsedTime();
    const intervalId = setInterval(updateElapsedTime, 100);
    return () => clearInterval(intervalId);
  }, [startTime]);

  const handleInputChange = (event) => {
    if (isFinished) return;

    const { input: nextInput, shouldShake } = getInputUpdate(
      targetText,
      userInput,
      event.target.value,
    );

    if (shouldShake) shakeElement(screenRef.current);
    setUserInput(nextInput);

    const nextElapsedMs = Math.max(1, Date.now() - startTime);
    const nextWpm = calculateWpm(nextInput.length, nextElapsedMs);
    const finished = nextInput === targetText;

    socket.emit('send_progress', {
      roomCode: race.roomCode || room.code,
      input: nextInput,
      wpm: nextWpm,
    });

    if (finished) {
      setElapsedMs(nextElapsedMs);
      setIsFinished(true);
    }
  };

  const progress = calculateProgress(userInput.length, targetText.length);
  const wpm = calculateWpm(userInput.length, elapsedMs);
  const players = Object.values(room.players || {});

  return (
    <main
      ref={screenRef}
      className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100"
    >
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="text-center">
          <p className="text-sm font-bold tracking-widest text-sky-400">
            CORRIDA EM ANDAMENTO · SALA {room.code}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">TypeRacing</h1>
        </header>

        <section className="flex flex-wrap justify-center gap-8 rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
          <p>
            <span className="block text-xs uppercase text-slate-400">Tempo</span>
            <strong className="text-xl tabular-nums">{formatRaceTime(elapsedMs)}</strong>
          </p>
          <p>
            <span className="block text-xs uppercase text-slate-400">Velocidade</span>
            <strong className="text-xl">{wpm} PPM</strong>
          </p>
          <p>
            <span className="block text-xs uppercase text-slate-400">Progresso</span>
            <strong className="text-xl">{progress}%</strong>
          </p>
        </section>

        <RaceTrack players={players} />

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl sm:p-8">
          <TypingArea
            targetText={targetText}
            userInput={userInput}
            onInputChange={handleInputChange}
            isFinished={isFinished}
          />
          {isFinished && (
            <p className="mt-4 text-center font-semibold text-emerald-400">
              Você terminou! Aguarde os outros jogadores.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
