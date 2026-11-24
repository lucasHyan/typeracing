export default function TypingArea({
  targetText,
  userInput,
  onInputChange,
  isFinished,
  difficulty = "Intermediário",
}) {
  const hasError = targetText
    .split("")
    .slice(0, userInput.length)
    .some((character, index) => character !== userInput[index]);

  return (
    <section className="flex h-full flex-col rounded-2xl border border-[#E9DCCB] bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-extrabold text-[#1E242B]">
          Continue digitando
        </h2>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
          Trecho atual • {difficulty}
        </p>
      </div>

      <div className="mt-4 select-none text-[19px] leading-[1.55] text-[#94A3B8] sm:text-xl">
        {targetText.split("").map((character, index) => {
          let className = "text-[#94A3B8]";

          if (index < userInput.length) {
            className =
              userInput[index] === character
                ? "text-[#16A34A]"
                : "rounded-sm bg-[#FEE2E2] text-[#DC2626]";
          } else if (index === userInput.length) {
            className =
              "rounded-sm bg-[#FFF1E8] text-[#FF6B2B] underline decoration-[#FF6B2B] decoration-2 underline-offset-2";
          }

          return (
            <span key={`${character}-${index}`} className={className}>
              {character}
            </span>
          );
        })}
      </div>

      <div className="mt-auto pt-4">
        <textarea
          rows={1}
          value={userInput}
          onChange={onInputChange}
          disabled={isFinished}
          maxLength={targetText.length}
          placeholder={isFinished ? "Corrida concluída!" : ""}
          aria-label="Digite o texto da corrida"
          className={`h-12 w-full resize-none rounded-xl border bg-white px-3 py-3 text-base text-[#1E242B] outline-none transition placeholder:text-slate-400 ${hasError ? "border-[#FF6B2B] ring-2 ring-[#FF6B2B]/10" : "border-[#FF6B2B] focus:ring-2 focus:ring-[#FF6B2B]/15"}`}
        />
        {hasError && (
          <p className="mt-2 text-xs text-[#64748B]">
            Continue de onde parou. Corrija a letra em vermelho.
          </p>
        )}
      </div>
    </section>
  );
}
