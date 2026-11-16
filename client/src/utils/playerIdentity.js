const PLAYER_ID_STORAGE_KEY = 'typeracing-player-id';
const PLAYER_ID_PATTERN =
  /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

function createPlayerId() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));

  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}

export function getPlayerId() {
  let playerId = sessionStorage.getItem(PLAYER_ID_STORAGE_KEY);
  if (!playerId || !PLAYER_ID_PATTERN.test(playerId)) {
    playerId = createPlayerId();
    sessionStorage.setItem(PLAYER_ID_STORAGE_KEY, playerId);
  }
  return playerId;
}
