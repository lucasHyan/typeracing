import VehicleAvatar from "./VehicleAvatar.jsx";

// Largura do veículo "sm" (VehicleAvatar) e espaço reservado à faixa de chegada.
const VEHICLE_WIDTH = 60;
const FINISH_WIDTH = 20;
// Depois deste progresso a etiqueta alinha pela direita do veículo,
// para nunca ultrapassar a linha de chegada.
const LABEL_FLIP_PROGRESS = 60;

const CHECKER_PATTERN = {
  backgroundColor: "#F8FAFC",
  backgroundImage:
    "linear-gradient(45deg,#1E242B 25%,transparent 25%,transparent 75%,#1E242B 75%,#1E242B),linear-gradient(45deg,#1E242B 25%,transparent 25%,transparent 75%,#1E242B 75%,#1E242B)",
  backgroundPosition: "0 0,5px 5px",
  backgroundSize: "10px 10px",
};

export default function RaceTrack({ players, currentPlayerId }) {
  return (
    <div>
      <div className="max-h-[264px] overflow-y-auto">
        <div className="relative">
          <ol>
            {players.map((player) => {
              const progress = Math.max(0, Math.min(100, player.progress || 0));
              const isCurrent = player.id === currentPlayerId;
              const alignLabelRight = progress > LABEL_FLIP_PROGRESS;

              return (
                <li
                  key={player.id}
                  className={`relative h-[66px] rounded-lg ${isCurrent ? "bg-[var(--theme-highlight)]" : ""}`}
                >
                  {isCurrent && (
                    <span className="sr-only">Raia do jogador atual</span>
                  )}
                  {/* Linha da raia: o veículo "anda" sobre ela. */}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-[9px] left-3 border-t-2 border-dashed border-[#B6C2D1] dark:border-[#4B5A70]"
                    style={{ right: FINISH_WIDTH + 12 }}
                  />

                  <div
                    className="absolute inset-y-0 left-3"
                    style={{ right: FINISH_WIDTH + 12 }}
                  >
                    <div
                      className="absolute bottom-1 z-10 transition-[left] duration-300 ease-out"
                      style={{
                        left: `calc((100% - ${VEHICLE_WIDTH}px) * ${progress / 100})`,
                        width: VEHICLE_WIDTH,
                      }}
                    >
                      <span
                        className={`absolute bottom-full mb-1 flex max-w-[240px] items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-bold leading-none shadow-sm ${
                          alignLabelRight ? "right-0" : "left-0"
                        } ${
                          isCurrent
                            ? "bg-[#C2410C] text-white"
                            : "bg-[#EEF2F6] text-[#1E242B] ring-1 ring-[#D5DEE8] dark:bg-[#28303B] dark:text-[#F8FAFC] dark:ring-[#3E4C5E]"
                        }`}
                      >
                        <span className="truncate">
                          {player.name}
                          {isCurrent ? " · você" : ""}
                        </span>
                        <span className="tabular-nums">{progress}%</span>
                      </span>
                      <VehicleAvatar
                        emoji={player.emoji}
                        color={player.color || "#2563eb"}
                        size="sm"
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-2 rounded-sm ring-1 ring-[#1E242B]/20 dark:ring-[#F8FAFC]/30"
            style={{ ...CHECKER_PATTERN, width: FINISH_WIDTH }}
          />
        </div>
      </div>
      <div className="theme-secondary mt-2 flex justify-between px-3 text-xs font-bold uppercase tracking-widest">
        <span>Largada</span>
        <span>Chegada</span>
      </div>
    </div>
  );
}
