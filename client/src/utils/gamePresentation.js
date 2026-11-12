import paragraphs from '../paragraphs.json';

export function getRandomRaceText(previousText = '') {
  const options = paragraphs.filter((paragraph) => paragraph !== previousText);
  const availableTexts = options.length > 0 ? options : paragraphs;
  return availableTexts[Math.floor(Math.random() * availableTexts.length)];
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
