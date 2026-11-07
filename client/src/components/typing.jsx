import { useState, useEffect } from 'react';
import PlayerCustomizer from './PlayerCustomizer.jsx';
import RaceTrack from './RaceTrack.jsx';
import TypingArea from './TypingArea.jsx';

const TEXTO_ALVO_PADRAO = "A programacao desenvolve o raciocinio logico e a resolucao de problemas na sala de aula.";

const CORES_DISPONIVEIS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea'];

export default function Typing() {
  const [targetText] = useState(TEXTO_ALVO_PADRAO);
  const [userInput, setUserInput] = useState('');
  
  const [playerName, setPlayerName] = useState('Aluno');
  const [carColor, setCarColor] = useState(CORES_DISPONIVEIS[0]);

  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleInputChange = (e) => {
    if (isFinished) return;

    const val = e.target.value;

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    setUserInput(val);

    if (val.length >= targetText.length) {
      setIsFinished(true);
    }
  };

  const progresso = Math.min(100, Math.round((userInput.length / targetText.length) * 100));

  useEffect(() => {
    if (!startTime || userInput.length === 0 || isFinished) return;

    const interval = setInterval(() => {
      const minutos = (Date.now() - startTime) / 1000 / 60;
      if (minutos > 0) {
        const calculoWpm = Math.round((userInput.length / 5) / minutos);
        setWpm(calculoWpm);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [startTime, userInput, isFinished]);

  const players = [
    {
      id: 'local',
      name: playerName,
      color: carColor,
      progress: progresso,
      wpm: wpm
    }
  ];

  const reiniciarJogo = () => {
    setUserInput('');
    setStartTime(null);
    setWpm(0);
    setIsFinished(false);
  };

  return (
    <div style={{ maxWidth: 820, margin: '30px auto', fontFamily: 'system-ui, sans-serif', padding: 20 }}>
      <h2>TypeRacing</h2>

      <PlayerCustomizer
        playerName={playerName}
        setPlayerName={setPlayerName}
        carColor={carColor}
        setCarColor={setCarColor}
        disabled={!!startTime && !isFinished}
        CORES_DISPONIVEIS={CORES_DISPONIVEIS}
      />

      <RaceTrack players={players} />

      <TypingArea
        targetText={targetText}
        userInput={userInput}
        handleInputChange={handleInputChange}
        isFinished={isFinished}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 24, fontSize: 16, color: '#334155' }}>
          <span><strong>Velocidade:</strong> {wpm} PPM</span>
          <span><strong>Progresso:</strong> {progresso}%</span>
        </div>

        {isFinished && (
          <button
            onClick={reiniciarJogo}
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