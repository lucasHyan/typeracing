const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { performance } = require("node:perf_hooks");

const app = express();
app.use(cors());

app.get("/", (_req, res) => {
  res.json({ status: "ok", activeRooms: Object.keys(rooms).length });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

const rooms = {};
const DEFAULT_TEXT = "Programar todos os dias melhora sua lógica e velocidade.";
const RACE_START_COUNTDOWN_SECONDS = 3;
const FINISH_COUNTDOWN_MS = 20_000;
const FINISH_TIME_EXTENSION_MS = 10_000;
const MAX_PLAYERS_PER_ROOM = 15;
// Prazo para reconectar (ex.: F5) depois de fechar/perder a aba sem clicar em "Sair".
const RECONNECT_GRACE_WAITING_MS = 5_000;
const RECONNECT_GRACE_RACING_MS = 15_000;
// playerId -> timeout de remoção pendente.
const disconnectTimers = new Map();
const VEHICLE_EMOJIS = new Set([
  "🚗",
  "🏎️",
  "🚙",
  "🚕",
  "🚓",
  "🚑",
  "🚒",
  "🚜",
  "🛵",
  "🚀",
]);

function generateRoomCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let roomCode;

  do {
    roomCode = "";
    for (let index = 0; index < 5; index += 1) {
      roomCode += characters[Math.floor(Math.random() * characters.length)];
    }
  } while (rooms[roomCode]);

  return roomCode;
}

function getRoomPlayerList(room) {
  return Object.values(room.players);
}

function getPublicPlayer(player) {
  const publicPlayer = { ...player };
  delete publicPlayer.socketId;
  return publicPlayer;
}

function getPublicPlayerList(room) {
  return getRoomPlayerList(room).map(getPublicPlayer);
}

function findPlayerRoom(playerId) {
  return Object.values(rooms).find((room) =>
    Object.hasOwn(room.players, playerId),
  );
}

function getSocketPlayer(socket, room) {
  const player = room?.players[socket.data.playerId];
  return player?.socketId === socket.id ? player : null;
}

function getRoomSnapshot(room) {
  const players = Object.fromEntries(
    Object.entries(room.players).map(([playerId, player]) => [
      playerId,
      getPublicPlayer(player),
    ]),
  );

  return {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    countdownSeconds: room.countdownSeconds,
    countdownTargetText: room.countdownTargetText,
    finishSecondsRemaining: room.finishSecondsRemaining,
    raceEndAt: room.raceEndAt || null,
    difficulty: room.difficulty || "Iniciante",
    targetText: room.targetText,
    isCustomText: Boolean(room.isCustomText),
    startedAt: room.startedAt,
    players,
    results: room.results,
  };
}

function isValidPlayerId(playerId) {
  return (
    typeof playerId === "string" &&
    /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(playerId)
  );
}

function cleanPlayerName(value, fallback) {
  const name = typeof value === "string" ? value.trim().slice(0, 18) : "";
  return name || fallback;
}

function cleanColor(value, fallback) {
  return typeof value === "string" && /^#[\da-f]{6}$/i.test(value)
    ? value
    : fallback;
}

const MIN_CUSTOM_TEXT_LENGTH = 10;

// Mantém quebras de linha (trechos de código), mas padroniza para "\n",
// troca tabs por espaços e remove espaços no fim das linhas.
function cleanTargetText(value, fallback = DEFAULT_TEXT) {
  if (typeof value !== "string") return fallback;
  const text = value
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, "    ")
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .trim()
    .slice(0, 1000);
  return text || fallback;
}

function createPlayer(id, name, color, socketId) {
  return {
    id,
    name,
    color,
    socketId,
    emoji: "🚗",
    progress: 0,
    input: "",
    wpm: 0,
    errors: 0,
    missedKeys: {},
    // Entrou com a corrida em andamento: só assiste e vira jogador quando ela acabar.
    isSpectator: false,
    isFinished: false,
    elapsedMs: null,
    finishTime: null,
  };
}

function resetRoomRaceState(room) {
  room.raceEndAt = null;
  room.finishDeadline = null;
  room.finishSecondsRemaining = null;
  Object.values(room.players).forEach((player) => {
    player.progress = 0;
    player.input = "";
    player.wpm = 0;
    player.errors = 0;
    player.missedKeys = {};
    player.isSpectator = false;
    player.isFinished = false;
    player.elapsedMs = null;
    player.finishTime = null;
  });
}

// Aceita só { "<caractere esperado>": contagem } com chaves de 1 caractere visível.
const MAX_MISSED_KEYS = 64;
function sanitizeMissedKeys(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value)
    .filter(
      ([key, count]) =>
        typeof key === "string" &&
        [...key].length === 1 &&
        Number.isSafeInteger(count) &&
        count > 0 &&
        count <= 10_000,
    )
    .slice(0, MAX_MISSED_KEYS);
  return Object.fromEntries(entries);
}

function getAccuracy(player) {
  const typed = (player.input || "").length;
  const errors = Math.max(0, player.errors || 0);
  if (typed + errors === 0) return 0;
  return Math.round((typed / (typed + errors)) * 1000) / 10;
}

// Jogadores que estão de fato correndo (sem os espectadores).
function getRacers(room) {
  return getRoomPlayerList(room).filter((player) => !player.isSpectator);
}

function getResults(room) {
  const elapsedAtFinish = Date.now() - room.startedAt;
  const normalizedPlayers = getRacers(room).map((player) => {
    const elapsedMs = Math.max(
      1,
      player.isFinished ? player.elapsedMs || elapsedAtFinish : elapsedAtFinish,
    );
    const progress = Math.max(0, Math.min(100, player.progress || 0));
    const wpm = player.isFinished
      ? player.wpm || 0
      : Math.round(player.input.length / 5 / (elapsedMs / 60000));

    return {
      ...getPublicPlayer(player),
      progress,
      wpm,
      elapsedMs: Math.max(0, elapsedMs),
      errors: Math.max(0, player.errors || 0),
      missedKeys: player.missedKeys || {},
      accuracy: getAccuracy(player),
      charsTyped: (player.input || "").length,
      totalChars: room.targetText.length,
    };
  });

  return normalizedPlayers
    .sort((first, second) => {
      if (first.isFinished !== second.isFinished)
        return first.isFinished ? -1 : 1;
      if (first.isFinished)
        return (first.elapsedMs || 0) - (second.elapsedMs || 0);
      return (
        (second.progress || 0) - (first.progress || 0) ||
        (second.wpm || 0) - (first.wpm || 0)
      );
    })
    .map((player, index) => ({ ...player, place: index + 1 }));
}

function clearFinishTimer(room) {
  if (room.finishTimeout) clearTimeout(room.finishTimeout);
  room.finishTimeout = null;
  room.finishDeadline = null;
  room.raceEndAt = null;
  room.finishSecondsRemaining = null;
}

function clearStartCountdown(room) {
  if (room.countdownTimeout) clearTimeout(room.countdownTimeout);
  room.countdownTimeout = null;
  room.countdownSeconds = null;
  room.countdownTargetText = null;
}

function finishRace(room) {
  if (room.status !== "racing") return;

  clearFinishTimer(room);
  room.status = "finished";
  room.results = getResults(room);
  // Fim da corrida: quem estava assistindo passa a ser jogador da sala.
  getRoomPlayerList(room).forEach((player) => {
    player.isSpectator = false;
  });
  io.to(room.code).emit("race_finished", {
    roomCode: room.code,
    players: getPublicPlayerList(room),
    results: room.results,
  });
}

function scheduleFinishTimer(room) {
  if (room.finishTimeout) clearTimeout(room.finishTimeout);
  if (!room.raceEndAt) return;
  const remainingMs = room.raceEndAt - Date.now();
  if (remainingMs <= 0) {
    finishRace(room);
    return;
  }
  room.finishSecondsRemaining = Math.ceil(remainingMs / 1000);
  io.to(room.code).emit("race_timer", {
    roomCode: room.code,
    secondsRemaining: room.finishSecondsRemaining,
    raceEndAt: room.raceEndAt,
  });
  room.finishTimeout = setTimeout(
    () => scheduleFinishTimer(room),
    Math.min(1000, remainingMs),
  );
}

function startFinishTimer(room) {
  if (room.raceEndAt) return;
  room.raceEndAt = Date.now() + FINISH_COUNTDOWN_MS;
  room.finishDeadline = room.raceEndAt;
  scheduleFinishTimer(room);
}

function clearDisconnectTimer(playerId) {
  const timeoutId = disconnectTimers.get(playerId);
  if (timeoutId) clearTimeout(timeoutId);
  disconnectTimers.delete(playerId);
}

// Encerra a sala para todos (dono saiu ou não voltou a tempo).
function closeRoom(room, message) {
  io.to(room.code).emit("room_closed", message);
  clearStartCountdown(room);
  clearFinishTimer(room);
  Object.keys(room.players).forEach(clearDisconnectTimer);
  io.socketsLeave(room.code);
  delete rooms[room.code];
}

// Remove um jogador da sala (clicou em "Sair" ou não reconectou no prazo).
// Se for o dono, a sala é encerrada para todos.
function removePlayerFromRoom(room, playerId, hostLeftMessage) {
  clearDisconnectTimer(playerId);
  if (!room.players[playerId]) return;

  if (room.hostId === playerId) {
    closeRoom(room, hostLeftMessage);
    return;
  }

  const { socketId } = room.players[playerId];
  delete room.players[playerId];
  io.sockets.sockets.get(socketId)?.leave(room.code);

  if (Object.keys(room.players).length === 0) {
    clearStartCountdown(room);
    clearFinishTimer(room);
    delete rooms[room.code];
    return;
  }

  io.to(room.code).emit("update_players", {
    roomCode: room.code,
    players: getPublicPlayerList(room),
  });
  finishRaceIfReady(room);
}

function finishRaceIfReady(room) {
  if (room.status !== "racing" || getRoomPlayerList(room).length === 0) return;
  // Espectadores não contam: encerra quando todos os que correm terminaram
  // (ou se só sobraram espectadores na sala).
  const racers = getRacers(room);
  if (!racers.every((player) => player.isFinished)) return;

  finishRace(room);
}

function startRace(room, targetText) {
  clearStartCountdown(room);
  clearFinishTimer(room);
  resetRoomRaceState(room);
  room.status = "racing";
  room.targetText = cleanTargetText(targetText, room.targetText);
  room.startedAt = Date.now();
  room.results = [];

  io.to(room.code).emit("race_started", {
    roomCode: room.code,
    targetText: room.targetText,
    startTime: room.startedAt,
    players: getPublicPlayerList(room),
  });
}

function tickRaceCountdown(room, secondsRemaining) {
  if (room.status !== "countdown") return;
  if (secondsRemaining <= 0) {
    startRace(room, room.countdownTargetText);
    return;
  }

  room.countdownSeconds = secondsRemaining;
  io.to(room.code).emit("race_countdown", {
    roomCode: room.code,
    targetText: room.countdownTargetText,
    secondsRemaining,
  });
  room.countdownTimeout = setTimeout(
    () => tickRaceCountdown(room, secondsRemaining - 1),
    1000,
  );
}

function startRaceCountdown(room, targetText) {
  clearStartCountdown(room);
  resetRoomRaceState(room);
  room.status = "countdown";
  room.countdownTargetText = cleanTargetText(targetText, room.targetText);
  tickRaceCountdown(room, RACE_START_COUNTDOWN_SECONDS);
}

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("reconnect_player", (data = {}) => {
    const playerId = data.playerId;
    if (!isValidPlayerId(playerId)) return;

    const room = findPlayerRoom(playerId);
    if (!room) return;

    const player = room.players[playerId];
    // Voltou dentro do prazo: cancela a remoção pendente.
    clearDisconnectTimer(playerId);
    if (player.socketId && player.socketId !== socket.id) {
      const previousSocket = io.sockets.sockets.get(player.socketId);
      if (previousSocket) {
        previousSocket.leave(room.code);
        previousSocket.data.playerId = null;
      }
    }

    socket.data.playerId = playerId;
    player.socketId = socket.id;
    socket.join(room.code);
    socket.emit("player_reconnected", {
      roomCode: room.code,
      room: getRoomSnapshot(room),
    });
    io.to(room.code).emit("update_players", {
      roomCode: room.code,
      players: getPublicPlayerList(room),
    });
  });

  socket.on("create_room", (data = {}) => {
    const playerId = data.playerId;
    if (!isValidPlayerId(playerId)) {
      socket.emit("error_message", "A identificação do jogador é inválida.");
      return;
    }
    if (findPlayerRoom(playerId)) {
      socket.emit("error_message", "Você já está em uma sala.");
      return;
    }

    const roomCode = generateRoomCode();
    const room = {
      code: roomCode,
      hostId: playerId,
      status: "waiting",
      countdownSeconds: null,
      countdownTargetText: null,
      countdownTimeout: null,
      finishDeadline: null,
      finishTimeout: null,
      finishSecondsRemaining: null,
      raceEndAt: null,
      difficulty: "Iniciante",
      targetText: cleanTargetText(data.targetText),
      isCustomText: false,
      players: {
        [playerId]: createPlayer(
          playerId,
          cleanPlayerName(data.playerName, "Dono da sala"),
          cleanColor(data.carColor, "#2563eb"),
          socket.id,
        ),
      },
      results: [],
    };

    socket.data.playerId = playerId;
    rooms[roomCode] = room;
    socket.join(roomCode);
    socket.emit("room_created", { roomCode, room: getRoomSnapshot(room) });
  });

  socket.on("join_room", (data = {}) => {
    const roomCode = String(data.roomCode || "")
      .trim()
      .toUpperCase();
    const room = rooms[roomCode];
    const playerId = data.playerId;

    if (!isValidPlayerId(playerId)) {
      socket.emit("error_message", "A identificação do jogador é inválida.");
      return;
    }
    if (findPlayerRoom(playerId)) {
      socket.emit("error_message", "Você já está em uma sala.");
      return;
    }

    if (!room) {
      socket.emit("error_message", "Sala não encontrada.");
      return;
    }
    if (Object.keys(room.players).length >= MAX_PLAYERS_PER_ROOM) {
      socket.emit(
        "error_message",
        `A sala está cheia (máximo de ${MAX_PLAYERS_PER_ROOM} jogadores).`,
      );
      return;
    }

    room.players[playerId] = createPlayer(
      playerId,
      cleanPlayerName(data.playerName, "Jogador"),
      cleanColor(data.carColor, "#dc2626"),
      socket.id,
    );
    // Corrida em andamento: entra como espectador e vira jogador quando ela acabar.
    // (Na contagem regressiva ainda dá tempo de correr; no pódio ele já é jogador.)
    if (room.status === "racing") {
      room.players[playerId].isSpectator = true;
    }

    socket.data.playerId = playerId;
    socket.join(roomCode);
    socket.emit("joined_successfully", {
      roomCode,
      room: getRoomSnapshot(room),
    });
    io.to(roomCode).emit("player_joined", { room: getRoomSnapshot(room) });
    // As telas de corrida/pódio escutam update_players (não player_joined).
    io.to(roomCode).emit("update_players", {
      roomCode,
      players: getPublicPlayerList(room),
    });
  });

  socket.on("update_player_customization", (data = {}) => {
    const roomCode = String(data.roomCode || "")
      .trim()
      .toUpperCase();
    const room = rooms[roomCode];
    const player = getSocketPlayer(socket, room);

    if (!room || room.status !== "waiting" || !player) {
      socket.emit(
        "error_message",
        "A personalização só pode ser alterada na sala de espera.",
      );
      return;
    }

    if (
      data.color !== undefined &&
      (typeof data.color !== "string" || !/^#[\da-f]{6}$/i.test(data.color))
    ) {
      socket.emit("error_message", "A cor selecionada não é válida.");
      return;
    }

    if (
      data.emoji !== undefined &&
      (typeof data.emoji !== "string" || !VEHICLE_EMOJIS.has(data.emoji))
    ) {
      socket.emit("error_message", "O emoji selecionado não está disponível.");
      return;
    }

    if (data.color !== undefined) player.color = data.color;
    if (data.emoji !== undefined) player.emoji = data.emoji;

    io.to(roomCode).emit("player_customization_updated", {
      room: getRoomSnapshot(room),
    });
  });

  socket.on("start_race", (data = {}) => {
    const roomCode = String(data.roomCode || "")
      .trim()
      .toUpperCase();
    const room = rooms[roomCode];

    if (!room) {
      socket.emit("error_message", "Sala não encontrada.");
      return;
    }
    if (
      room.hostId !== socket.data.playerId ||
      !getSocketPlayer(socket, room)
    ) {
      socket.emit(
        "error_message",
        "Somente o dono da sala pode iniciar a corrida.",
      );
      return;
    }
    if (room.status !== "waiting") {
      socket.emit("error_message", "A corrida desta sala já foi iniciada.");
      return;
    }

    startRaceCountdown(room, data.targetText);
  });

  socket.on("send_progress", (data = {}) => {
    const roomCode = String(data.roomCode || data.roomId || "")
      .trim()
      .toUpperCase();
    const room = rooms[roomCode];
    const player = getSocketPlayer(socket, room);

    if (
      !room ||
      room.status !== "racing" ||
      !player ||
      player.isFinished ||
      player.isSpectator
    ) {
      return;
    }

    const input =
      typeof data.input === "string"
        ? data.input.slice(0, room.targetText.length)
        : "";
    const elapsedMs = Math.max(1, Date.now() - room.startedAt);
    player.progress = Math.min(
      100,
      Math.round((input.length / room.targetText.length) * 100),
    );
    player.input = input;
    player.wpm = Math.round(input.length / 5 / (elapsedMs / 60000));
    if (Number.isSafeInteger(data.errors) && data.errors >= 0) {
      player.errors = data.errors;
    }
    const missedKeys = sanitizeMissedKeys(data.missedKeys);
    if (missedKeys) player.missedKeys = missedKeys;

    if (input === room.targetText) {
      player.isFinished = true;
      player.elapsedMs = elapsedMs;
      player.finishTime = Date.now();
      startFinishTimer(room);
    }

    const players = getRoomPlayerList(room);
    io.to(roomCode).emit("update_players", {
      roomCode,
      players: getPublicPlayerList(room),
    });
    finishRaceIfReady(room);
  });

  const handleAddRaceTime = (data = {}) => {
    const roomCode = String(data.roomCode || "")
      .trim()
      .toUpperCase();
    const room = rooms[roomCode];

    if (!room || !getSocketPlayer(socket, room)) {
      socket.emit("error_message", "Você não está nesta sala.");
      return;
    }
    if (room.hostId !== socket.data.playerId) {
      socket.emit(
        "error_message",
        "Somente o dono da sala pode aumentar o tempo.",
      );
      return;
    }
    if (room.status !== "racing") {
      socket.emit("error_message", "A partida não está em andamento.");
      return;
    }

    room.raceEndAt = (room.raceEndAt || Date.now()) + FINISH_TIME_EXTENSION_MS;
    room.finishDeadline = room.raceEndAt;
    scheduleFinishTimer(room);
  };

  socket.on("add_race_time", handleAddRaceTime);
  socket.on("extend_race_timer", handleAddRaceTime);

  socket.on("start_another_race", (data = {}) => {
    const roomCode = String(data.roomCode || "")
      .trim()
      .toUpperCase();
    const room = rooms[roomCode];

    if (!room) {
      socket.emit("error_message", "Sala não encontrada.");
      return;
    }
    if (
      room.hostId !== socket.data.playerId ||
      !getSocketPlayer(socket, room)
    ) {
      socket.emit(
        "error_message",
        "Somente o dono da sala pode iniciar outra partida.",
      );
      return;
    }
    if (room.status !== "finished") {
      socket.emit("error_message", "A partida atual ainda não foi finalizada.");
      return;
    }

    startRaceCountdown(room, data.targetText);
  });

  socket.on("return_to_lobby", (data = {}) => {
    const roomCode = String(data.roomCode || "")
      .trim()
      .toUpperCase();
    const room = rooms[roomCode];

    if (!room || !getSocketPlayer(socket, room)) {
      socket.emit("error_message", "Você não está nesta sala.");
      return;
    }
    if (room.hostId !== socket.data.playerId) {
      socket.emit(
        "error_message",
        "Somente o dono da sala pode voltar ao lobby.",
      );
      return;
    }
    if (room.status !== "finished") {
      socket.emit("error_message", "A partida atual ainda não foi finalizada.");
      return;
    }

    room.status = "waiting";
    room.targetText = cleanTargetText(data.targetText, room.targetText);
    room.results = [];
    clearFinishTimer(room);
    clearStartCountdown(room);
    resetRoomRaceState(room);

    const lobbyRoom = getRoomSnapshot(room);
    io.to(roomCode).emit("room_lobby", { room: lobbyRoom });
    io.to(roomCode).emit("returned_to_lobby", { room: lobbyRoom });
  });

  socket.on("leave_room", (data = {}) => {
    const roomCode = String(data.roomCode || "")
      .trim()
      .toUpperCase();
    const room = rooms[roomCode];

    const playerId = socket.data.playerId;
    if (!room || !getSocketPlayer(socket, room)) return;

    socket.leave(roomCode);
    removePlayerFromRoom(
      room,
      playerId,
      "O dono da sala saiu. A sala foi encerrada.",
    );
  });

  socket.on("update_room_difficulty", (data = {}) => {
    const roomCode = String(data.roomCode || "")
      .trim()
      .toUpperCase();
    const room = rooms[roomCode];
    if (!room || room.status !== "waiting") return;
    if (room.hostId !== socket.data.playerId || !getSocketPlayer(socket, room))
      return;
    const difficultyOptions = ["Iniciante", "Intermediário", "Programador"];
    if (!difficultyOptions.includes(data.difficulty)) return;
    room.difficulty = data.difficulty;
    // O cliente do dono já sorteia o texto ao escolher a dificuldade, para que
    // todos vejam na sala de espera exatamente o texto que será usado.
    if (typeof data.targetText === "string") {
      room.targetText = cleanTargetText(data.targetText, room.targetText);
    }
    room.isCustomText = false;
    io.to(roomCode).emit("room_difficulty_updated", {
      room: getRoomSnapshot(room),
    });
  });

  // Dificuldade "Customizado": o dono da sala cola (Ctrl+V / área de transferência)
  // um texto próprio. Escolher outra dificuldade volta aos textos sorteados.
  socket.on("update_room_text", (data = {}) => {
    const roomCode = String(data.roomCode || "")
      .trim()
      .toUpperCase();
    const room = rooms[roomCode];
    if (!room || !getSocketPlayer(socket, room)) return;
    if (room.hostId !== socket.data.playerId) {
      socket.emit(
        "error_message",
        "Somente o dono da sala pode alterar o texto da partida.",
      );
      return;
    }
    if (room.status !== "waiting") {
      socket.emit(
        "error_message",
        "O texto só pode ser alterado na sala de espera.",
      );
      return;
    }

    const text = cleanTargetText(data.targetText, "");
    if (text.length < MIN_CUSTOM_TEXT_LENGTH) {
      socket.emit(
        "error_message",
        `O texto precisa ter pelo menos ${MIN_CUSTOM_TEXT_LENGTH} caracteres.`,
      );
      return;
    }
    room.targetText = text;
    room.isCustomText = true;
    room.difficulty = "Customizado";

    io.to(roomCode).emit("room_text_updated", {
      room: getRoomSnapshot(room),
    });
  });

  // Fechou a aba / caiu a conexão sem clicar em "Sair": espera um prazo para
  // reconexão (F5) e, se não voltar, remove o jogador (ou encerra a sala, se for o dono).
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    const playerId = socket.data.playerId;
    if (!playerId) return;
    const room = findPlayerRoom(playerId);
    // Se já reconectou por outro socket, não há o que fazer.
    if (!room || room.players[playerId].socketId !== socket.id) return;

    const graceMs =
      room.status === "waiting"
        ? RECONNECT_GRACE_WAITING_MS
        : RECONNECT_GRACE_RACING_MS;

    clearDisconnectTimer(playerId);
    disconnectTimers.set(
      playerId,
      setTimeout(() => {
        disconnectTimers.delete(playerId);
        const currentRoom = rooms[room.code];
        const player = currentRoom?.players[playerId];
        // Só remove se continuar desconectado (não voltou com outro socket).
        if (!player || player.socketId !== socket.id) return;
        removePlayerFromRoom(
          currentRoom,
          playerId,
          "O dono da sala desconectou. A sala foi encerrada.",
        );
      }, graceMs),
    );
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
