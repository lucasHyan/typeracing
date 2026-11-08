import { useState, useEffect, useRef } from 'react';
import PlayerCustomizer from './PlayerCustomizer';
import RaceTrack from './RaceTrack';
import TypingArea from './TypingArea';
import paragraphs from '../paragraphs.json';
import { shakeElement } from './animations';
import {
  calculateProgress,
  calculateWpm,
  getInputUpdate,
  getRandomParagraph
} from './typingUtils';

const AVAILABLE_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea'];

export default function Typing() {
  const [targetText, setTargetText] = useState(() => getRandomParagraph(paragraphs));
  const [userInput, setUserInput] = useState('');

  const [playerName, setPlayerName] = useState('Aluno');
  const [carColor, setCarColor] = useState(AVAILABLE_COLORS[0]);

  const [startTimeMs, setStartTimeMs] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const screenRef = useRef(null);

  const handleInputChange = (event) => {
    if (isFinished) {
      return;
    }

    const { input: nextInput, shouldShake } = getInputUpdate(
      targetText,
      userInput,
      event.target.value
    );

    if (shouldShake) {
      shakeElement(screenRef.current);
    }

    setUserInput(nextInput);

    const nextStartTime = startTimeMs ?? Date.now();
    if (!startTimeMs && nextInput.length > 0) {
      setStartTimeMs(nextStartTime);
    }

    if (nextInput === targetText) {
      setElapsedMs(Date.now() - nextStartTime);
      setIsFinished(true);
    }
  };

  const progress = calculateProgress(userInput.length, targetText.length);
  const wpm = calculateWpm(userInput.length, elapsedMs);

  useEffect(() => {
    if (!startTimeMs || isFinished) {
      return;
    }

    const updateElapsedTime = () => setElapsedMs(Date.now() - startTimeMs);
    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 250);

    return () => clearInterval(interval);
  }, [startTimeMs, isFinished]);

  const players = [
    {
      id: 'local',
      name: playerName,
      color: carColor,
      progress,
      wpm
    }
  ];

  const restartGame = () => {
    setUserInput('');
    setStartTimeMs(null);
    setElapsedMs(0);
    setIsFinished(false);
    setTargetText(getRandomParagraph(paragraphs));
  };

  return (
    <div
      ref={screenRef}
      style={{ maxWidth: 820, margin: '30px auto', fontFamily: 'system-ui, sans-serif', padding: 20 }}
    >
      <h2>TypeRacing — Modo Solo</h2>

      <PlayerCustomizer
        playerName={playerName}
        onPlayerNameChange={setPlayerName}
        carColor={carColor}
        onCarColorChange={setCarColor}
        disabled={!!startTimeMs && !isFinished}
        colorOptions={AVAILABLE_COLORS}
      />

      <RaceTrack players={players} />

      <TypingArea
        targetText={targetText}
        userInput={userInput}
        onInputChange={handleInputChange}
        isFinished={isFinished}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 24, fontSize: 16, color: '#334155' }}>
          <span><strong>Velocidade:</strong> {wpm} PPM</span>
          <span><strong>Progresso:</strong> {progress}%</span>
        </div>

        {isFinished && (
          <button
            onClick={restartGame}
            style={{
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 6,
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Jogar Novamente
          </button>
        )}
      </div>
    </div>
  );
}