export default function TypingArea({ targetText, userInput, handleInputChange, isFinished }) {
  return (
    <>
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
    </>
  );
}
