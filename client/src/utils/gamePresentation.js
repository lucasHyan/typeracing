import { RACE_TEXTS } from '../raceTexts.js';

// Sorteia um texto da dificuldade escolhida, evitando repetir o anterior.
export function getRandomRaceText(difficulty = 'Iniciante', previousText = '') {
  const pool = RACE_TEXTS[difficulty] || RACE_TEXTS.Iniciante;
  const options = pool.filter((text) => text !== previousText);
  const availableTexts = options.length > 0 ? options : pool;
  return availableTexts[Math.floor(Math.random() * availableTexts.length)];
}

// Texto da próxima corrida: o texto colado pelo dono da sala, se houver;
// senão, um sorteado da dificuldade da sala.
export function getNextRaceText(room) {
  if (room?.isCustomText && room.targetText) return room.targetText;
  return getRandomRaceText(room?.difficulty, room?.targetText);
}

export function formatRaceTime(milliseconds = 0) {
  const totalCentiseconds = Math.floor(milliseconds / 10);
  const minutes = Math.floor(totalCentiseconds / 6000);
  const seconds = String(Math.floor((totalCentiseconds % 6000) / 100)).padStart(2, '0');
  const centiseconds = String(totalCentiseconds % 100).padStart(2, '0');

  return `${minutes}:${seconds}.${centiseconds}`;
}

export function playersById(players = []) {
  return Object.fromEntries(players.map((player) => [player.id, player]));
}
