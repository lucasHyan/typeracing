import { COLOR_PRESETS, VEHICLE_EMOJIS } from "./constants";

export default function VehicleCustomizer({ player, onChange }) {
  return (
    <section className="mt-1 flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-1.5">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange({ color: preset.value })}
            aria-label={`Cor ${preset.name}`}
            aria-pressed={player.color === preset.value}
            className={`h-4 w-4 rounded-full border border-white ${
              player.color === preset.value
                ? "ring-2 ring-[#FF6B2B] ring-offset-1"
                : ""
            }`}
            style={{ backgroundColor: preset.value }}
            title={preset.name}
          />
        ))}
      </div>
      <select
        value={player.emoji || VEHICLE_EMOJIS[0]}
        onChange={(event) => onChange({ emoji: event.target.value })}
        aria-label="Escolher veículo"
        className="h-7 max-w-16 rounded-md border border-slate-200 bg-white px-1 text-xs text-[#1E242B]"
      >
        {VEHICLE_EMOJIS.map((emoji) => (
          <option key={emoji} value={emoji}>
            {emoji}
          </option>
        ))}
      </select>
    </section>
  );
}
