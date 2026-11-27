import { useEffect, useRef, useState } from "react";
import { playSound } from "../../services/sound.js";
import {
  CUSTOM_DIFFICULTY,
  DIFFICULTIES,
  MAX_RACE_TEXT_LENGTH,
  MIN_RACE_TEXT_LENGTH,
  normalizeRaceText,
} from "../../raceTexts.js";

const DIFFICULTY_HINTS = {
  Iniciante: "Frases curtas",
  Intermediário: "Frases longas",
  Programador: "Trechos de código",
  [CUSTOM_DIFFICULTY]: "Seu Ctrl+C",
};

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

function TextPreview({ text, isCode }) {
  return (
    <pre
      className={`theme-elevated max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-xl px-4 py-3 leading-relaxed ${
        isCode ? "font-mono text-[15px]" : "font-sans text-base"
      }`}
    >
      {text}
    </pre>
  );
}

export default function RaceTextPanel({
  room,
  isHost,
  onDifficultyChange,
  onRoomTextChange,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState(null); // { message, isError }
  const editorRef = useRef(null);
  const difficulty = room.isCustomText
    ? CUSTOM_DIFFICULTY
    : room.difficulty || "Iniciante";
  const isCustom = difficulty === CUSTOM_DIFFICULTY;
  const text = room.targetText || "";
  const isCode = difficulty === "Programador" || text.includes("\n");

  const showFeedback = (message, isError = false) =>
    setFeedback({ message, isError });

  const applyText = (rawText) => {
    const nextText = normalizeRaceText(rawText);
    if (nextText.length < MIN_RACE_TEXT_LENGTH) {
      playSound("error");
      showFeedback(
        `O texto precisa ter pelo menos ${MIN_RACE_TEXT_LENGTH} caracteres.`,
        true,
      );
      return false;
    }
    onRoomTextChange?.(nextText);
    playSound("confirm");
    setIsEditing(false);
    showFeedback(
      rawText.length > MAX_RACE_TEXT_LENGTH
        ? `Texto colado! Ele foi cortado em ${MAX_RACE_TEXT_LENGTH} caracteres.`
        : "Texto colado! Ele será usado na próxima corrida.",
    );
    return true;
  };

  const openEditor = (initialText = "", message = null) => {
    setDraft(initialText);
    setIsEditing(true);
    setFeedback(message);
    requestAnimationFrame(() => editorRef.current?.focus());
  };

  // "Customizado": lê direto o que o dono da sala copiou (Ctrl+C).
  // A leitura só funciona em HTTPS/localhost e com permissão do navegador;
  // se falhar, abre o editor já focado para ele dar Ctrl+V.
  const pasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText.trim()) {
        if (applyText(clipboardText)) return;
        openEditor(clipboardText);
        return;
      }
      openEditor("", {
        message: "A área de transferência está vazia. Copie um texto e dê Ctrl+V aqui.",
        isError: true,
      });
    } catch {
      openEditor("", {
        message: "O navegador não deixou ler a área de transferência. Dê Ctrl+V aqui.",
        isError: false,
      });
    }
  };

  const handleDifficultyClick = (option) => {
    playSound("select");
    setFeedback(null);
    if (option === CUSTOM_DIFFICULTY) {
      pasteFromClipboard();
      return;
    }
    setIsEditing(false);
    onDifficultyChange?.(option);
  };

  // Ctrl+V em qualquer lugar da sala de espera (fora de campos de texto)
  // também vira o texto customizado.
  const applyTextRef = useRef(applyText);
  useEffect(() => {
    applyTextRef.current = applyText;
  });
  useEffect(() => {
    if (!isHost) return undefined;
    const handlePaste = (event) => {
      if (isEditableTarget(event.target)) return;
      const pasted = event.clipboardData?.getData("text/plain") || "";
      if (!pasted.trim()) return;
      event.preventDefault();
      applyTextRef.current(pasted);
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [isHost]);

  useEffect(() => {
    if (!feedback || feedback.isError) return undefined;
    const timeoutId = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timeoutId);
  }, [feedback]);

  // No editor vazio, o próprio Ctrl+V já aplica o texto (um passo só).
  const handleEditorPaste = (event) => {
    if (draft.trim()) return;
    const pasted = event.clipboardData?.getData("text/plain") || "";
    if (!pasted.trim()) return;
    event.preventDefault();
    if (!applyText(pasted)) setDraft(pasted);
  };

  const normalizedDraftLength = normalizeRaceText(draft).length;

  return (
    <section className="theme-card rounded-2xl border p-6 shadow-sm sm:px-7">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold sm:text-lg">Texto da partida</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            isCustom
              ? "bg-[var(--theme-highlight)] text-[var(--theme-highlight-text)]"
              : "theme-elevated theme-secondary"
          }`}
        >
          {difficulty}
        </span>
      </header>

      {isHost && (
        <fieldset className="mt-4">
          <legend className="theme-secondary mb-1.5 text-xs font-bold uppercase tracking-wider">
            Dificuldade
          </legend>
          <div className="theme-elevated grid grid-cols-2 gap-1 rounded-xl p-1 sm:grid-cols-4">
            {DIFFICULTIES.map((option) => {
              const isSelected =
                option === difficulty ||
                (option === CUSTOM_DIFFICULTY && isEditing);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleDifficultyClick(option)}
                  aria-pressed={isSelected}
                  title={
                    option === CUSTOM_DIFFICULTY
                      ? "Usa o texto que você copiou (Ctrl+C)"
                      : option === difficulty
                        ? "Sortear outro texto deste nível"
                        : undefined
                  }
                  className={`cursor-pointer rounded-lg border px-2 py-2 text-center transition ${
                    isSelected
                      ? "theme-card border-[#FF6B2B] shadow-sm"
                      : "border-transparent hover:bg-[var(--theme-card)]"
                  }`}
                >
                  <span className="block text-sm font-bold">
                    {option === CUSTOM_DIFFICULTY ? "📋 " : ""}
                    {option}
                  </span>
                  <span className="theme-secondary block text-xs">
                    {DIFFICULTY_HINTS[option]}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {isHost && isEditing ? (
        <div className="mt-4">
          <label htmlFor="custom-race-text" className="sr-only">
            Texto customizado da partida
          </label>
          <textarea
            id="custom-race-text"
            ref={editorRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onPaste={handleEditorPaste}
            rows={6}
            maxLength={MAX_RACE_TEXT_LENGTH * 2}
            placeholder="Dê Ctrl+V aqui para colar uma frase, um parágrafo ou um trecho de código..."
            spellCheck={false}
            className="theme-input w-full resize-y rounded-xl border-2 px-4 py-3 font-mono text-[15px] leading-relaxed outline-none transition placeholder:font-sans placeholder:text-[var(--theme-secondary)] focus:border-[#FF6B2B]"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <span
              className={`text-sm font-medium ${
                normalizedDraftLength > 0 &&
                normalizedDraftLength < MIN_RACE_TEXT_LENGTH
                  ? "text-[#B91C1C] dark:text-[#FCA5A5]"
                  : "theme-secondary"
              }`}
            >
              {normalizedDraftLength}/{MAX_RACE_TEXT_LENGTH} caracteres
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFeedback(null);
                }}
                className="theme-secondary cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold hover:text-[var(--theme-text)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => applyText(draft)}
                disabled={normalizedDraftLength < MIN_RACE_TEXT_LENGTH}
                className="cursor-pointer rounded-lg bg-[#FF6B2B] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#E55A1F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Usar este texto
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <p className="theme-secondary mb-1.5 text-xs font-bold uppercase tracking-wider">
            Texto que será digitado
          </p>
          <TextPreview text={text} isCode={isCode} />
          {isHost && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {isCustom ? (
                <>
                  <button
                    type="button"
                    onClick={pasteFromClipboard}
                    className="cursor-pointer rounded-lg border-2 border-[#FF6B2B] px-4 py-2 text-sm font-bold text-[#C2410C] transition hover:bg-[var(--theme-highlight)] dark:text-[#FFB48F]"
                  >
                    📋 Colar outro texto
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditor(text)}
                    className="theme-elevated cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition hover:opacity-80"
                  >
                    Editar texto
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDifficultyClick(difficulty)}
                  className="theme-elevated cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition hover:opacity-80"
                >
                  🎲 Sortear outro texto
                </button>
              )}
              <p className="theme-secondary text-sm">
                Ou dê{" "}
                <kbd className="theme-elevated rounded border border-[var(--theme-border)] px-1.5 py-0.5 font-mono text-xs font-bold">
                  Ctrl
                </kbd>{" "}
                +{" "}
                <kbd className="theme-elevated rounded border border-[var(--theme-border)] px-1.5 py-0.5 font-mono text-xs font-bold">
                  V
                </kbd>{" "}
                nesta tela para usar um texto copiado.
              </p>
            </div>
          )}
        </div>
      )}

      {feedback && (
        <p
          role="status"
          className={`mt-3 text-sm font-semibold ${
            feedback.isError
              ? "text-[#B91C1C] dark:text-[#FCA5A5]"
              : "text-[#15803D] dark:text-[#4ADE80]"
          }`}
        >
          {feedback.message}
        </p>
      )}
    </section>
  );
}
