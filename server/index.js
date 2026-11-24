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
const FINISH_COUNTDOWN_MS = 30_000;
const FINISH_TIME_EXTENSION_MS = 10_000;
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
    targetText: room.targetText,
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

function cleanTargetText(value, fallback = DEFAULT_TEXT) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, 1000)
    : fallback;
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
    isFinished: false,
    elapsedMs: null,
    finishTime: null,
  };
}

function getResults(room) {
  return getRoomPlayerList(room)
    .sort((first, second) => {
      if (first.isFinished !== second.isFinished) {
        return first.isFinished ? -1 : 1;
      }
      if (first.isFinished) {
        return first.elapsedMs - second.elapsedMs;
      }
      return second.progress - first.progress || second.wpm - first.wpm;
    })
    .map((player, index) => ({
      ...getPublicPlayer(player),
      place: index + 1,
    }));
}

function clearFinishTimer(room) {
  if (room.finishTimeout) clearTimeout(room.finishTimeout);
  room.finishTimeout = null;
  room.finishDeadline = null;
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
  io.to(room.code).emit("race_finished", {
    roomCode: room.code,
    players: getPublicPlayerList(room),
    results: room.results,
  });
}

function scheduleFinishTimer(room) {
  if (room.finishTimeout) clearTimeout(room.finishTimeout);
  const remainingMs = room.finishDeadline - performance.now();
  if (remainingMs <= 0) {
    finishRace(room);
    return;
  }
  room.finishSecondsRemaining = Math.ceil(remainingMs / 1000);
  io.to(room.code).emit("race_timer", {
    roomCode: room.code,
    secondsRemaining: room.finishSecondsRemaining,
  });
  room.finishTimeout = setTimeout(
    () => scheduleFinishTimer(room),
    Math.min(1000, remainingMs),
  );
}

function startFinishTimer(room) {
  if (room.finishDeadline) return;
  room.finishDeadline = performance.now() + FINISH_COUNTDOWN_MS;
  scheduleFinishTimer(room);
}

function finishRaceIfReady(room) {
  const players = getRoomPlayerList(room);
  if (
    room.status !== "racing" ||
    players.length === 0 ||
    !players.every((player) => player.isFinished)
  ) {
    return;
  }

  finishRace(room);
}

function startRace(room, targetText) {
  clearStartCountdown(room);
  clearFinishTimer(room);
  room.status = "racing";
  room.targetText = cleanTargetText(targetText, room.targetText);
  room.startedAt = Date.now();
  room.results = [];

  Object.values(room.players).forEach((player) => {
    player.progress = 0;
    player.input = "";
    player.wpm = 0;
    player.errors = 0;
    player.isFinished = false;
    player.elapsedMs = null;
    player.finishTime = null;
  });

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
      targetText: cleanTargetText(data.targetText),
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

    if (!room || room.status !== "waiting") {
      socket.emit(
        "error_message",
        "Sala não encontrada ou indisponível para entrada.",
      );
      return;
    }

    room.players[playerId] = createPlayer(
      playerId,
      cleanPlayerName(data.playerName, "Jogador"),
      cleanColor(data.carColor, "#dc2626"),
      socket.id,
    );

    socket.data.playerId = playerId;
    socket.join(roomCode);
    socket.emit("joined_successfully", {
      roomCode,
      room: getRoomSnapshot(room),
    });
    io.to(roomCode).emit("player_joined", { room: getRoomSnapshot(room) });
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

    if (!room || room.status !== "racing" || !player || player.isFinished) {
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

  socket.on("extend_race_timer", (data = {}) => {
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
    if (room.status !== "racing" || !room.finishDeadline) {
      socket.emit("error_message", "O tempo extra ainda não está disponível.");
      return;
    }
    if (room.finishDeadline <= performance.now()) {
      finishRace(room);
      return;
    }

    room.finishDeadline += FINISH_TIME_EXTENSION_MS;
    scheduleFinishTimer(room);
  });

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
    Object.values(room.players).forEach((player) => {
      player.progress = 0;
      player.input = "";
      player.wpm = 0;
      player.errors = 0;
      player.isFinished = false;
      player.elapsedMs = null;
      player.finishTime = null;
    });

    io.to(roomCode).emit("room_lobby", { room: getRoomSnapshot(room) });
  });

  socket.on("leave_room", (data = {}) => {
    const roomCode = String(data.roomCode || "")
      .trim()
      .toUpperCase();
    const room = rooms[roomCode];

    const playerId = socket.data.playerId;
    if (!room || !getSocketPlayer(socket, room)) return;

    if (room.hostId === playerId) {
      io.to(roomCode).emit(
        "room_closed",
        "O dono da sala saiu. A sala foi encerrada.",
      );
      clearStartCountdown(room);
      clearFinishTimer(room);
      delete rooms[roomCode];
      socket.leave(roomCode);
      return;
    }

    delete room.players[playerId];
    socket.leave(roomCode);
    io.to(roomCode).emit("update_players", {
      roomCode,
      players: getPublicPlayerList(room),
    });

    if (Object.keys(room.players).length === 0) {
      clearStartCountdown(room);
      clearFinishTimer(room);
      delete rooms[roomCode];
      return;
    }

    finishRaceIfReady(room);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
