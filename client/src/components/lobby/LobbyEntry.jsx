import { useState } from "react";
import ThemeToggle from "../ThemeToggle.jsx";

export default function LobbyEntry({
  playerName,
  roomCode,
  isRoomCodeFromLink,
  isBusy,
  isConnected,
  onPlayerNameChange,
  onRoomCodeChange,
  onCreateRoom,
  onJoinRoom,
  onSoloMode,
  theme = "light",
  onToggleTheme,
}) {
  const colorOptions = [
    { name: "Vermelho", value: "#FF6B2B" },
    { name: "Azul", value: "#00A8E8" },
    { name: "Amarelo", value: "#FFB703" },
    { name: "Verde", value: "#16A34A" },
    { name: "Roxo", value: "#9B5DE5" },
  ];
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);

  return (
    <main className="theme-main min-h-screen w-full px-4 sm:px-6">
      <header className="mx-auto h-24 px-8 max-w-6xl flex items-center justify-between">
        <div className="flex items-center gap-3.5 text-2xl font-extrabold tracking-tight">
          <span>
            Type<span className="text-[#FF6B2B]">Racing</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          <div className="theme-card flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-[#16A34A]" : "bg-[#FFB703]"
              }`}
            />
            {isConnected ? "Servidor Online" : "Conectando..."}
          </div>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-center pt-10 sm:pt-12">
        <img
          src="/logo.png"
          alt="Emblema TypeRacing"
          className="w-42 h-42 object-contain mx-auto"
        />

        <h1 className="mt-5 text-4xl text-center font-extrabold">
          Pronto para acelerar no teclado?
        </h1>
        <p className="theme-secondary mt-2 text-base text-center">
          Escolha seu piloto e entre na pista.
        </p>

        <div className="theme-card mt-10 rounded-2xl border shadow-md max-w-2xl w-full mx-auto p-2.5 pl-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <label htmlFor="player-name" className="sr-only">
            Seu apelido
          </label>
          <input
            id="player-name"
            type="text"
            value={playerName}
            onChange={(event) => onPlayerNameChange(event.target.value)}
            placeholder="Seu apelido"
            maxLength={18}
            autoComplete="nickname"
            autoFocus={isRoomCodeFromLink}
            className="theme-input flex-1 outline-none placeholder:text-slate-400 min-w-0 px-1 py-3"
          />

          <div
            className="flex items-center justify-center gap-2.5"
            aria-label="Cores do piloto"
          >
            {colorOptions.map((color) => {
              const isSelected = selectedColor === color.value;
              return (
                <button
                  key={color.name}
                  type="button"
                  title={color.name}
                  aria-label={color.name}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedColor(color.value)}
                  className={`h-5 w-5 shrink-0 rounded-full border-2 border-white transition ${
                    isSelected
                      ? "ring-2 ring-[#1E242B] ring-offset-2"
                      : "ring-0"
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={onCreateRoom}
            disabled={isBusy}
            className="px-7 py-3 rounded-xl font-bold text-white shrink-0 bg-[#FF6B2B] transition hover:bg-[#E55A1F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? "Conectando..." : "Criar Sala"}
          </button>
        </div>

        <form
          onSubmit={onJoinRoom}
          className="mt-6 flex items-center justify-center gap-3 flex-wrap sm:flex-nowrap"
        >
          <label htmlFor="room-code" className="theme-secondary text-sm">
            Ou entre com um código:
          </label>
          <input
            id="room-code"
            type="text"
            value={roomCode}
            onChange={(event) =>
              onRoomCodeChange(event.target.value.toUpperCase())
            }
            placeholder=""
            maxLength={5}
            autoComplete="off"
            className="theme-input w-32 py-2.5 px-3 text-center uppercase tracking-widest font-bold rounded-xl border shadow-sm outline-none"
          />
          <button
            type="submit"
            disabled={isBusy}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#00A8E8] transition hover:bg-[#0090C7] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Entrar
          </button>
        </form>

        <button
          type="button"
          onClick={onSoloMode}
          className="theme-secondary mt-10 text-center text-sm font-medium hover:opacity-80 transition"
        >
          Treinar no Modo Solo →
        </button>
      </section>
    </main>
  );
}
