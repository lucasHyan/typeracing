import { useEffect, useRef } from "react";

export default function TypingArea({
  targetText,
  userInput,
  onInputChange,
  isFinished,
  difficulty = "Intermediário",
  raceStartTime = null,
  onBlockedAction,
  isCode = false,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isFinished && raceStartTime) {
      inputRef.current?.focus();
    }
  }, [targetText, raceStartTime, isFinished]);

  // Bloqueia copiar, recortar, colar, arrastar e o menu de contexto durante a corrida.
  const blockClipboard = (event) => {
    event.preventDefault();
    onBlockedAction?.();
  };

  // No modo código, Tab preenche de uma vez os espaços de indentação esperados.
  const handleKeyDown = (event) => {
    if (event.key !== "Tab" || !isCode) return;
    event.preventDefault();
    let index = userInput.length;
    let spaces = "";
    while (targetText[index] === " ") {
      spaces += " ";
      index += 1;
    }
    if (!spaces) return;
    onInputChange({
      target: { value: userInput + spaces },
      nativeEvent: { inputType: "insertAutoIndent" },
    });
  };

  const hasError = targetText
    .split("")
    .slice(0, userInput.length)
    .some((character, index) => character !== userInput[index]);

  return (
    <section className="theme-card flex flex-col rounded-2xl border p-6 shadow-sm sm:p-7">
      <div>
        <h2 className="text-xl font-extrabold">Continue digitando</h2>
        <p className="theme-secondary mt-1 text-xs font-bold uppercase tracking-widest">
          Trecho atual · {difficulty}
        </p>
      </div>

      <div
        className={`theme-pending mt-5 select-none whitespace-pre-wrap break-words ${
          isCode
            ? "theme-elevated rounded-xl px-4 py-3 font-mono text-lg leading-[1.7] sm:text-xl"
            : "text-[22px] leading-[1.6] sm:text-2xl"
        }`}
        onCopy={blockClipboard}
        onCut={blockClipboard}
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
      >
        {targetText.split("").map((character, index) => {
          let className = "text-[#475569] dark:text-[#CBD5E1]";

          if (index < userInput.length) {
            className =
              userInput[index] === character
                ? "text-[#15803D] dark:text-[#4ADE80]"
                : "rounded-sm bg-[#FEE2E2] text-[#B91C1C] dark:bg-[#4C1D24] dark:text-[#FCA5A5]";
          } else if (index === userInput.length) {
            className = "typing-pending";
          }

          return (
            <span
              key={`${character}-${index}`}
              className={className}
            >
              {character === "\n" ? (
                <>
                  <span aria-hidden="true" className="opacity-60">
                    ↵
                  </span>
                  {"\n"}
                </>
              ) : (
                character
              )}
            </span>
          );
        })}
      </div>

      <div className="mt-6">
        <textarea
          ref={inputRef}
          rows={isCode ? 5 : 1}
          onKeyDown={handleKeyDown}
          value={userInput}
          onChange={onInputChange}
          disabled={isFinished}
          maxLength={targetText.length}
          placeholder={isFinished ? "Corrida concluída!" : ""}
          aria-label="Digite o texto da corrida"
          onPaste={blockClipboard}
          onDrop={blockClipboard}
          onCopy={blockClipboard}
          onCut={blockClipboard}
          onContextMenu={(event) => event.preventDefault()}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={`theme-input w-full resize-none rounded-xl border-2 px-4 py-3 outline-none ${isCode ? "font-mono text-base leading-[1.6]" : "h-14 text-lg"} transition placeholder:text-[var(--theme-secondary)] ${hasError ? "border-[#F87171] ring-2 ring-[#F87171]/10" : "border-[#FF6B2B] focus:ring-2 focus:ring-[#FF6B2B]/15"}`}
        />
        {hasError ? (
          <p className="theme-secondary mt-2 text-sm font-medium">
            Continue de onde parou. Corrija a letra em vermelho.
          </p>
        ) : (
          isCode && (
            <p className="theme-secondary mt-2 text-sm font-medium">
              Use <strong>Enter</strong> para quebrar a linha (↵) e{" "}
              <strong>Tab</strong> para completar a indentação.
            </p>
          )
        )}
      </div>
    </section>
  );
}
