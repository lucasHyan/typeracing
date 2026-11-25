import { VEHICLE_EMOJIS } from "./lobby/constants";

const DEFAULT_VEHICLE = VEHICLE_EMOJIS[0];
// Emojis de veículo apontam para a esquerda na maioria das fontes; espelhamos para
// que "andem" rumo à chegada. O foguete já aponta para cima/direita.
const NON_MIRRORED = new Set(["🚀"]);

// Largura em px de cada tamanho (o carro SVG tem proporção 64:36).
const WIDTHS = { sm: 60, md: 72, lg: 88 };

function CarSprite({ color, width }) {
  return (
    <svg
      viewBox="0 0 64 36"
      width={width}
      height={(width * 36) / 64}
      fill="none"
      aria-hidden="true"
      className="drop-shadow-sm"
    >
      <path
        d="M4 24c0-3.6 2.4-6.4 6-7l8-1 7-8.2C26.4 6.6 28 6 29.6 6H40c1.8 0 3.4.7 4.6 2l7.4 7.6 6 1.4c2.4.6 4 2.7 4 5.2V26a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2Z"
        fill={color}
      />
      <path
        d="M24 15.6 29.2 9.6c.4-.4.9-.6 1.4-.6H34v6.6H24ZM37 9h3c.8 0 1.5.3 2 .9l5.6 5.7H37V9Z"
        fill="#F8FAFC"
        fillOpacity="0.9"
      />
      <circle cx="16" cy="28" r="5.5" fill="#1E242B" stroke="#F8FAFC" strokeOpacity="0.35" />
      <circle cx="16" cy="28" r="2" fill="#CBD5E1" />
      <circle cx="48" cy="28" r="5.5" fill="#1E242B" stroke="#F8FAFC" strokeOpacity="0.35" />
      <circle cx="48" cy="28" r="2" fill="#CBD5E1" />
    </svg>
  );
}

export default function VehicleAvatar({
  emoji,
  color = "#2563eb",
  size = "md",
  className = "",
}) {
  const vehicle = emoji || DEFAULT_VEHICLE;
  const width = WIDTHS[size] || WIDTHS.md;

  if (vehicle === DEFAULT_VEHICLE) {
    return (
      <span className={`inline-flex shrink-0 ${className}`}>
        <CarSprite color={color} width={width} />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-end justify-center leading-none ${className}`}
      style={{ width, height: (width * 36) / 64 }}
    >
      <span
        className="block select-none"
        style={{
          fontSize: Math.round(width * 0.62),
          filter: `drop-shadow(0 3px 0 ${color})`,
          transform: NON_MIRRORED.has(vehicle) ? undefined : "scaleX(-1)",
        }}
      >
        {vehicle}
      </span>
    </span>
  );
}
