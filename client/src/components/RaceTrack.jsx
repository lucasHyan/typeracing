export default function RaceTrack({ players }) {
  return (
    <div style={{ background: '#0f172a', padding: '20px 16px', borderRadius: 12, marginBottom: 20 }}>
      <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12, letterSpacing: '1px' }}>PISTA DE CORRIDA</div>

      {players.map((p) => (
        <div key={p.id} style={{ position: 'relative', height: 44, borderBottom: '2px dashed #334155' }}>
          <div
            style={{
              position: 'absolute',
              left: `${p.progress}%`,
              transform: 'translateX(-50%)',
              transition: 'left 0.15s ease-out',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span style={{ fontSize: 24 }}>🚀</span>
            <span style={{
              background: p.color,
              color: '#fff',
              fontSize: 11,
              fontWeight: 'bold',
              padding: '2px 8px',
              borderRadius: 12
            }}>
              {p.name} ({p.progress}%)
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
