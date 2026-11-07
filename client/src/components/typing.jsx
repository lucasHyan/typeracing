import { useState } from 'react';

const TEXTO_ALVO_PADRAO = "A programacao desenvolve o raciocinio logico e a resolucao de problemas na sala de aula.";

export default function Typing() {
  const [targetText] = useState(TEXTO_ALVO_PADRAO);
  const [userInput, setUserInput] = useState('');

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif', padding: 20 }}>
      <h2>TypeRacing — Teste de Digitação</h2>

      <div 
        style={{ 
          fontSize: 20, 
          lineHeight: 1.6, 
          padding: 16, 
          background: '#f1f5f9', 
          borderRadius: 8, 
          marginBottom: 20,
          color: '#334155'
        }}
      >
        {targetText}
      </div>

      <textarea
        rows={3}
        value={userInput}
        onChange={handleInputChange}
        placeholder="Comece a digitar o texto acima..."
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

      <div style={{ marginTop: 10, color: '#64748b', fontSize: 14 }}>
        Caracteres digitados: {userInput.length} / {targetText.length}
      </div>
    </div>
  );
}