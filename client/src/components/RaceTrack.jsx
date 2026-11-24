function RaceCar({ color }) {
  return (
    <svg
      width="58"
      height="38"
      viewBox="0 0 58 38"
      fill="none"
      aria-hidden="true"
      className="drop-shadow-sm"
    >
      <path
        d="M10 25H4c-2 0-3-1-3-3v-3c0-2 1-3 3-3h8l5-8c1-2 3-3 5-3h17c3 0 5 1 7 3l8 10h1c2 0 3 1 3 3v1c0 2-1 3-3 3h-6"
        fill={color}
      />
      <path d="M19 15l4-6h14l7 7H19v-1z" fill="#EAF3F7" />
      <rect x="12" y="22" width="38" height="5" rx="2.5" fill={color} />
      <circle cx="18" cy="27" r="6" fill="#1E242B" />
      <circle cx="18" cy="27" r="2.5" fill="#FFF8F0" />
      <circle cx="43" cy="27" r="6" fill="#1E242B" />
      <circle cx="43" cy="27" r="2.5" fill="#FFF8F0" />
    </svg>
  );
}

export default function RaceTrack({ players, currentPlayerId }) {
  return (
    <section className="relative h-[268px] overflow-hidden rounded-2xl border border-[#E9DCCB] bg-white px-5 pb-4 pt-14">
      <div className="relative h-[196px]">
        {players.map((player, index) => {
          const progress = Math.max(0, Math.min(100, player.progress || 0));
          const isCurrent = player.id === currentPlayerId;
          return (
            <div
              key={player.id}
              className={`relative h-[49px] border-t border-dashed border-[#CBD5E1] ${isCurrent ? "bg-[#FFF1E8]/70" : ""}`}
            >
              {isCurrent && (
                <div className="sr-only">Raia do jogador atual</div>
              )}
              <div
                className="absolute top-1/2 z-10 -translate-y-1/2 transition-[left] duration-300 ease-out"
                style={{
                  left: `calc(${progress}% - ${Math.min(progress * 0.58, 58)}px)`,
                }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FFF8F0] px-2 py-1 text-[10px] font-bold text-[#1E242B] shadow-sm">
                  {player.name}
                  {isCurrent ? " • você" : ""} {progress}%
                </div>
                <RaceCar color={player.color || "#2563eb"} />
              </div>
              {index === players.length - 1 && (
                <div
                  className="pointer-events-none absolute bottom-0 right-0 top-0 w-[22px] border-l border-[#E9DCCB]"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg,#1E242B 25%,transparent 25%,transparent 75%,#1E242B 75%,#1E242B),linear-gradient(45deg,#1E242B 25%,transparent 25%,transparent 75%,#1E242B 75%,#1E242B)",
                    backgroundPosition: "0 0,11px 11px",
                    backgroundSize: "22px 22px",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="pointer-events-none absolute bottom-2 left-5 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
        Largada
      </div>
      <div className="pointer-events-none absolute bottom-2 right-5 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
        Chegada
      </div>
    </section>
  );
}
