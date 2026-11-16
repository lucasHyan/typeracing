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
import { getPlayerId } from '../utils/playerIdentity';

export default function Race({ room, race, onLeaveRoom }) {
  const targetText = race.targetText || room.targetText;
  const currentPlayer = room.players?.[getPlayerId()];
  const [userInput, setUserInput] = useState(currentPlayer?.input || '');
  const [elapsedMs, setElapsedMs] = useState(currentPlayer?.elapsedMs ?? 0);
  const [isFinished, setIsFinished] = useState(
    currentPlayer?.isFinished || false,
  );
  const [finalWpm, setFinalWpm] = useState(
    currentPlayer?.isFinished ? currentPlayer.wpm : null,
  );
  const [errorCount, setErrorCount] = useState(currentPlayer?.errors || 0);
  const screenRef = useRef(null);
  const errorCountRef = useRef(currentPlayer?.errors || 0);
  const startTime = race.startTime;
  const isHost = room.hostId === getPlayerId();

  useEffect(() => {
    const updateElapsedTime = () => {
      if (!isFinished) {
        setElapsedMs(Math.max(0, Date.now() - startTime));
      }
    };

    updateElapsedTime();
    const intervalId = setInterval(updateElapsedTime, 100);
    return () => clearInterval(intervalId);
  }, [startTime, isFinished]);

  const handleInputChange = (event) => {
    if (isFinished) return;

    const { input: nextInput, shouldShake } = getInputUpdate(
      targetText,
      userInput,
      event.target.value,
    );

    if (shouldShake) shakeElement(screenRef.current);
    setUserInput(nextInput);

    let newErrors = 0;
    for (let index = 0; index < nextInput.length; index += 1) {
      if (
        nextInput[index] !== userInput[index] &&
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

    socket.emit('send_progress', {
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
  const remainingSeconds = room.finishSecondsRemaining ?? null;
  const players = Object.values(room.players || {});

  return (
    <main
      ref={screenRef}
      className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100"
    >
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="text-center">
          <button
            type="button"
            onClick={onLeaveRoom}
            className="mb-4 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Voltar à tela inicial
          </button>
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
          <p>
            <span className="block text-xs uppercase text-slate-400">Erros</span>
            <strong className="text-xl">{errorCount}</strong>
          </p>
        </section>

        {remainingSeconds !== null && (
          <section className="flex flex-wrap items-center justify-center gap-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-center">
            <p>
              <span className="block text-xs uppercase text-amber-200">
                Tempo para concluir
              </span>
              <strong className="text-xl tabular-nums text-amber-300">
                {Math.floor(remainingSeconds / 60)}:
                {String(remainingSeconds % 60).padStart(2, '0')}
              </strong>
            </p>
            {isHost && (
              <button
                type="button"
                onClick={() =>
                  socket.emit('extend_race_timer', {
                    roomCode: race.roomCode || room.code,
                  })
                }
                className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 transition hover:bg-amber-400"
              >
                Adicionar 10 segundos
              </button>
            )}
          </section>
        )}

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
