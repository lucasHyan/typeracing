import { COLOR_PRESETS } from './constants';

export default function VehicleCustomizer({ player, onChange }) {
  return (
    <fieldset className="mt-3">
      <legend className="sr-only">Cor do carro</legend>
      <div className="flex items-center justify-center gap-2">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange({ color: preset.value })}
            aria-label={`Cor ${preset.name}`}
            aria-pressed={player.color === preset.value}
            className={`h-3 w-3 rounded-full transition ${
              player.color === preset.value
                ? 'scale-110 ring-2 ring-[#FF6B2B] ring-offset-2 ring-offset-white'
                : 'hover:scale-110'
            }`}
            style={{ backgroundColor: preset.value }}
            title={preset.name}
          />
        ))}
      </div>
    </fieldset>
  );
}
