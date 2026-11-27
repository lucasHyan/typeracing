// Sons do jogo.
//
// Regra (estilo Kahoot): sons de "anúncio" da sala tocam só no PC do dono da sala
// (hostOnly), para a escola inteira não tocar o mesmo som ao mesmo tempo.
// Sons de feedback pessoal (cliques, erros de digitação, sua chegada) e o pódio
// tocam em cada PC. Para mudar onde um som toca, basta alterar `hostOnly` aqui.

const SOUNDS = {
  // Pódio (revelação 3º → 2º → 1º)
  podium3: { src: "/3rd.mp3", volume: 0.9 },
  podium2: { src: "/2nd.mp3", volume: 0.9 },
  podium1: { src: "/1st.mp3", volume: 1 },

  // Anúncios da sala: só no PC do dono
  // Toca quando o 1º carro cruza a chegada e começa o timer de 20s.
  timeWarning: { src: "/time_warning.mp3", volume: 0.35, hostOnly: true },
  countdownTick: { src: "/Audio/bong_001.ogg", volume: 0.8, hostOnly: true },
  raceStart: { src: "/Audio/maximize_003.ogg", volume: 0.9, hostOnly: true },
  playerJoined: { src: "/Audio/pluck_001.ogg", volume: 0.7, hostOnly: true },
  playerLeft: { src: "/Audio/minimize_003.ogg", volume: 0.6, hostOnly: true },
  timeAdded: { src: "/Audio/switch_002.ogg", volume: 0.7, hostOnly: true },

  // Feedback pessoal: em cada PC
  click: { src: "/Audio/click_001.ogg", volume: 0.5 },
  select: { src: "/Audio/select_002.ogg", volume: 0.6 },
  toggle: { src: "/Audio/toggle_001.ogg", volume: 0.6 },
  confirm: { src: "/Audio/confirmation_001.ogg", volume: 0.7 },
  joinedRoom: { src: "/Audio/open_001.ogg", volume: 0.7 },
  leave: { src: "/Audio/back_001.ogg", volume: 0.6 },
  error: { src: "/Audio/error_006.ogg", volume: 0.5 },
  typingError: { src: "/Audio/error_004.ogg", volume: 0.35 },
  finished: { src: "/Audio/confirmation_002.ogg", volume: 0.8 },
  roomClosed: { src: "/Audio/close_002.ogg", volume: 0.7 },
};

const MUTE_STORAGE_KEY = "typeracing_muted";
const cache = new Map();
const listeners = new Set();

let muted = (() => {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
})();

function getBaseAudio(src) {
  let audio = cache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = "auto";
    cache.set(src, audio);
  }
  return audio;
}

// Pré-carrega os arquivos para o primeiro play não atrasar.
export function preloadSounds() {
  Object.values(SOUNDS).forEach(({ src }) => getBaseAudio(src));
}

/**
 * Toca um som. Retorna o elemento de áudio (para poder parar) ou null.
 * @param {keyof typeof SOUNDS} name
 * @param {{ isHost?: boolean }} [options] obrigatório para sons hostOnly
 */
export function playSound(name, { isHost = false } = {}) {
  const sound = SOUNDS[name];
  if (!sound || muted) return null;
  if (sound.hostOnly && !isHost) return null;

  // cloneNode permite sobrepor o mesmo som (ex.: erros seguidos).
  const audio = getBaseAudio(sound.src).cloneNode();
  audio.volume = sound.volume ?? 1;
  // O navegador bloqueia áudio antes da primeira interação; nesse caso só ignora.
  audio.play().catch(() => {});
  return audio;
}

export function stopSound(audio) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = Boolean(value);
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
  } catch {
    // armazenamento indisponível: vale só nesta sessão
  }
  listeners.forEach((listener) => listener());
}

export function subscribeMuted(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
