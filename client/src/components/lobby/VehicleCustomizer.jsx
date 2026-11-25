import { COLOR_PRESETS, VEHICLE_EMOJIS } from "./constants";

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function VehicleCustomizer({ player, onChange }) {
  const selectedColor = player.color;
  const selectedEmoji = player.emoji || VEHICLE_EMOJIS[0];

  return (
    <div className="mt-3 flex w-full flex-col gap-3 border-t border-[var(--theme-border)] pt-3">
      <fieldset>
        <legend className="theme-secondary mb-1.5 text-xs font-bold uppercase tracking-wider">
          Cor
        </legend>
        <div className="flex flex-wrap justify-center gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = selectedColor === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChange({ color: preset.value })}
                aria-label={`Cor ${preset.name}`}
                aria-pressed={isSelected}
                title={preset.name}
                className={`grid h-7 w-7 place-items-center rounded-full border-2 border-[var(--theme-card)] transition hover:scale-110 ${
                  isSelected
                    ? "ring-2 ring-[var(--theme-text)] ring-offset-1 ring-offset-[var(--theme-card)]"
                    : "ring-1 ring-[var(--theme-border)]"
                }`}
                style={{ backgroundColor: preset.value }}
              >
                {isSelected && <CheckIcon />}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="theme-secondary mb-1.5 text-xs font-bold uppercase tracking-wider">
          Veículo
        </legend>
        <div className="grid grid-cols-5 gap-1.5">
          {VEHICLE_EMOJIS.map((emoji) => {
            const isSelected = selectedEmoji === emoji;
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => onChange({ emoji })}
                aria-label={`Veículo ${emoji}`}
                aria-pressed={isSelected}
                className={`grid h-9 place-items-center rounded-lg border-2 text-xl leading-none transition hover:scale-105 ${
                  isSelected
                    ? "border-[#FF6B2B] bg-[var(--theme-highlight)]"
                    : "border-[var(--theme-border)] bg-[var(--theme-elevated)] hover:border-[var(--theme-highlight-border)]"
                }`}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
