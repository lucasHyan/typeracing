import { useState, useEffect } from 'react';

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

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#f1f5f9', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Apelido:</label>
          <input 
            type="text" 
            value={playerName} 
            onChange={(e) => setPlayerName(e.target.value)} 
            disabled={!!startTime && !isFinished}
            style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #cbd5e1', fontWeight: 'bold' }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Cor do Veículo:</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {CORES_DISPONIVEIS.map((cor) => (
              <button
                key={cor}
                onClick={() => setCarColor(cor)}
                disabled={!!startTime && !isFinished}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: cor,
                  border: carColor === cor ? '3px solid #0f172a' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#0f172a', padding: '20px 16px', borderRadius: 12, marginBottom: 20 }}>
        <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12, letterSpacing: '1px' }}>PISTA DE CORRIDA</div>
        
        {players.map((p) => (
          <div key={p.id} style={{ position: 'relative', height: 44, borderBottom: '2px dashed #334155' }}>
            <div 
              style={{ 
                position: 'absolute', 
                left: `${p.progress}%`, 
                transform: 'translateX(-50%)', 
                transition: 'left 0.15s ease-out',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span style={{ fontSize: 24 }}>🚀</span>
              <span style={{ 
                background: p.color, 
                color: '#fff', 
                fontSize: 11, 
                fontWeight: 'bold', 
                padding: '2px 8px', 
                borderRadius: 12 
              }}>
                {p.name} ({p.progress}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      <div 
        style={{ 
          fontSize: 20, 
          lineHeight: 1.8, 
          padding: 16, 
          background: '#f8fafc', 
          borderRadius: 8, 
          border: '1px solid #e2e8f0', 
          marginBottom: 16,
          userSelect: 'none'
        }}
      >
        {targetText.split('').map((char, index) => {
          let color = '#94a3b8';
          let backgroundColor = 'transparent';

          if (index < userInput.length) {
            const isCorrect = userInput[index] === char;
            color = isCorrect ? '#16a34a' : '#dc2626';
            backgroundColor = isCorrect ? 'transparent' : '#fee2e2';
          }

          return (
            <span key={index} style={{ color, backgroundColor, borderRadius: 2 }}>
              {char}
            </span>
          );
        })}
      </div>

      <textarea
        rows={3}
        value={userInput}
        onChange={handleInputChange}
        disabled={isFinished}
        placeholder={isFinished ? "Corrida concluída! Clique em Jogar Novamente abaixo." : "Comece a digitar o texto acima..."}
        style={{ 
          width: '100%', 
          fontSize: 16, 
          padding: 12, 
          boxSizing: 'border-box',
          borderRadius: 6,
          border: '2px solid #cbd5e1',
          outline: 'none'
        }}
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