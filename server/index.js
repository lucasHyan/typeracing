const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

const rooms = {};
const DEFAULT_TEXT = "Programar todos os dias melhora sua lógica e velocidade.";
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

function findPlayerRoom(playerId) {
  return Object.values(rooms).find((room) =>
    Object.hasOwn(room.players, playerId),
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

function createPlayer(id, name, color) {
  return {
    id,
    name,
    color,
    emoji: "🚗",
    progress: 0,
    wpm: 0,
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
    .map((player, index) => ({ ...player, place: index + 1 }));
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

  room.status = "finished";
  room.results = getResults(room);
  io.to(room.code).emit("race_finished", {
    roomCode: room.code,
    players,
    results: room.results,
  });
}

function startRace(room, targetText) {
  room.status = "racing";
  room.targetText = cleanTargetText(targetText, room.targetText);
  room.startedAt = Date.now();
  room.results = [];

  Object.values(room.players).forEach((player) => {
    player.progress = 0;
    player.wpm = 0;
    player.isFinished = false;
    player.elapsedMs = null;
    player.finishTime = null;
  });

  io.to(room.code).emit("race_started", {
    roomCode: room.code,
    targetText: room.targetText,
    startTime: room.startedAt,
    players: getRoomPlayerList(room),
  });
}

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("create_room", (data = {}) => {
    if (findPlayerRoom(socket.id)) {
      socket.emit("error_message", "Você já está em uma sala.");
      return;
    }

    const roomCode = generateRoomCode();
    const room = {
      code: roomCode,
      hostId: socket.id,
      status: "waiting",
      targetText: cleanTargetText(data.targetText),
      players: {
        [socket.id]: createPlayer(
          socket.id,
          cleanPlayerName(data.playerName, "Professor"),
          cleanColor(data.carColor, "#2563eb"),
        ),
      },
      results: [],
    };

    rooms[roomCode] = room;
    socket.join(roomCode);
    socket.emit("room_created", { roomCode, room });
  });

  socket.on("join_room", (data = {}) => {
    const roomCode = String(data.roomCode || "").trim().toUpperCase();
    const room = rooms[roomCode];

    if (findPlayerRoom(socket.id)) {
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

    room.players[socket.id] = createPlayer(
      socket.id,
      cleanPlayerName(data.playerName, "Jogador"),
      cleanColor(data.carColor, "#dc2626"),
    );

    socket.join(roomCode);
    socket.emit("joined_successfully", { roomCode, room });
    io.to(roomCode).emit("player_joined", { room });
  });

  socket.on("update_player_customization", (data = {}) => {
    const roomCode = String(data.roomCode || "").trim().toUpperCase();
    const room = rooms[roomCode];
    const player = room?.players[socket.id];

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

    io.to(roomCode).emit("player_customization_updated", { room });
  });

  socket.on("start_race", (data = {}) => {
    const roomCode = String(data.roomCode || "").trim().toUpperCase();
    const room = rooms[roomCode];

    if (!room) {
      socket.emit("error_message", "Sala não encontrada.");
      return;
    }
    if (room.hostId !== socket.id) {
      socket.emit("error_message", "Somente o professor pode iniciar a corrida.");
      return;
    }
    if (room.status !== "waiting") {
      socket.emit("error_message", "A corrida desta sala já foi iniciada.");
      return;
    }

    startRace(room, data.targetText);
  });

  socket.on("send_progress", (data = {}) => {
    const roomCode = String(data.roomCode || data.roomId || "")
      .trim()
      .toUpperCase();
    const room = rooms[roomCode];
    const player = room?.players[socket.id];

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
    player.wpm = Math.round((input.length / 5) / (elapsedMs / 60000));

    if (input === room.targetText) {
      player.isFinished = true;
      player.elapsedMs = elapsedMs;
      player.finishTime = Date.now();
    }

    const players = getRoomPlayerList(room);
    io.to(roomCode).emit("update_players", { roomCode, players });
    finishRaceIfReady(room);
  });

  socket.on("start_another_race", (data = {}) => {
    const roomCode = String(data.roomCode || "").trim().toUpperCase();
    const room = rooms[roomCode];

    if (!room) {
      socket.emit("error_message", "Sala não encontrada.");
      return;
    }
    if (room.hostId !== socket.id) {
      socket.emit("error_message", "Somente o professor pode iniciar outra partida.");
      return;
    }
    if (room.status !== "finished") {
      socket.emit("error_message", "A partida atual ainda não foi finalizada.");
      return;
    }

    startRace(room, data.targetText);
  });

  socket.on("disconnect", () => {
    const room = findPlayerRoom(socket.id);

    if (!room) {
      console.log(`Client disconnected: ${socket.id}`);
      return;
    }

    if (room.hostId === socket.id) {
      io.to(room.code).emit(
        "room_closed",
        "O professor desconectou. A sala foi encerrada.",
      );
      delete rooms[room.code];
      console.log(`Room closed by host: ${room.code}`);
      return;
    }

    delete room.players[socket.id];
    io.to(room.code).emit("update_players", {
      roomCode: room.code,
      players: getRoomPlayerList(room),
    });

    if (Object.keys(room.players).length === 0) {
      delete rooms[room.code];
      console.log(`Room deleted: ${room.code}`);
      return;
    }

    finishRaceIfReady(room);
    console.log(`Client disconnected from room: ${room.code}`);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
