import { COLOR_PRESETS, VEHICLE_EMOJIS } from './constants';

export default function VehicleCustomizer({ player, onChange }) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
      <div>
        <h3 className="font-semibold text-slate-200">Personalize seu veículo</h3>
        <p className="mt-1 text-sm text-slate-400">
          Escolha a cor e o emoji que aparecerão na pista.
        </p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-400">Cor do carro</legend>
        <div className="flex flex-wrap items-center gap-3">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange({ color: preset.value })}
              aria-label={`Cor ${preset.name}`}
              aria-pressed={player.color === preset.value}
              className={`h-9 w-9 rounded-full border-2 transition ${
                player.color === preset.value
                  ? 'scale-110 border-white ring-2 ring-slate-900 ring-offset-2 ring-offset-slate-800'
                  : 'border-transparent opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: preset.value }}
              title={preset.name}
            />
          ))}
          <input
            type="color"
            value={player.color || COLOR_PRESETS[0].value}
            onChange={(event) => onChange({ color: event.target.value })}
            className="h-9 w-9 cursor-pointer rounded-full border-0 bg-transparent p-0"
            aria-label="Escolher outra cor"
            title="Escolher outra cor"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-400">Emoji do veículo</legend>
        <div className="flex flex-wrap gap-2">
          {VEHICLE_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onChange({ emoji })}
              aria-label={`Escolher veículo ${emoji}`}
              aria-pressed={player.emoji === emoji}
              className={`rounded-lg border px-2 py-1 text-2xl transition ${
                player.emoji === emoji
                  ? 'border-sky-400 bg-sky-400/15'
                  : 'border-slate-700 bg-slate-950 hover:border-slate-500'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
