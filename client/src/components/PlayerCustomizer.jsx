export default function PlayerCustomizer({
  playerName,
  setPlayerName,
  carColor,
  setCarColor,
  disabled,
  CORES_DISPONIVEIS
}) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: '#f1f5f9', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>
      <div>
        <label style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Apelido:</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          disabled={disabled}
          style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #cbd5e1', fontWeight: 'bold' }}
        />
      </div>

      <div>
        <label style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Cor do Veículo:</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {CORES_DISPONIVEIS.map((cor) => (
            <button
              key={cor}
              onClick={() => setCarColor(cor)}
              disabled={disabled}
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: cor,
                border: carColor === cor ? '3px solid #0f172a' : '1px solid transparent',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
