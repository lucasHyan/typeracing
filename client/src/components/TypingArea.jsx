export default function TypingArea({
  targetText,
  userInput,
  onInputChange,
  isFinished
}) {
  return (
    <div className="space-y-4">
      <div
        className="select-none rounded-lg border border-slate-700 bg-slate-950 p-4 text-left text-lg leading-relaxed sm:text-xl"
      >
        {targetText.split('').map((char, index) => {
          let className = 'text-slate-500';

          if (index < userInput.length) {
            const isCorrect = userInput[index] === char;
            className = isCorrect
              ? 'text-emerald-400'
              : 'rounded-sm bg-red-500/20 text-red-300';
          }

          return (
            <span key={index} className={className}>
              {char}
            </span>
          );
        })}
      </div>

      <textarea
        rows={3}
        value={userInput}
        onChange={onInputChange}
        disabled={isFinished}
        maxLength={targetText.length}
        placeholder={isFinished ? 'Corrida concluída!' : 'Comece a digitar o texto acima...'}
        aria-label="Digite o texto da corrida"
        className="min-h-28 w-full resize-y rounded-lg border border-slate-600 bg-slate-950 p-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-70"
      />
    </div>
  );
}
