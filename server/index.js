const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Estrutura de dados em memória RAM
const rooms = {};

function generateRoomCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let roomCode = "";

  for (let index = 0; index < 5; index += 1) {
    roomCode += characters[Math.floor(Math.random() * characters.length)];
  }

  return roomCode;
}

function getRoomPlayerList(room) {
  return Object.values(room.players);
}

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // 1. Criar sala
  socket.on("create_room", ({ playerName, carColor, targetText } = {}) => {
    const roomCode = generateRoomCode();
    const room = {
      code: roomCode,
      hostId: socket.id,
      status: "waiting",
      targetText:
        targetText ||
        "Programar todos os dias melhora sua lógica e velocidade.",
      players: {
        [socket.id]: {
          id: socket.id,
          name: playerName || "Host",
          color: carColor || "#2563eb",
          progress: 0,
          wpm: 0,
          isFinished: false,
        },
      },
    };

    rooms[roomCode] = room;
    socket.join(roomCode);
    socket.emit("room_created", { roomCode, room });
  });

  // 2. Entrar na sala
  socket.on("join_room", ({ roomCode, playerName, carColor } = {}) => {
    const cleanRoomCode = String(roomCode || "")
      .trim()
      .toUpperCase();
    const room = rooms[cleanRoomCode];

    if (!room || room.status !== "waiting") {
      return socket.emit(
        "error_message",
        "Sala não encontrada ou indisponível para entrada.",
      );
    }

    room.players[socket.id] = {
      id: socket.id,
      name: playerName || "Jogador",
      color: carColor || "#dc2626",
      progress: 0,
      wpm: 0,
      isFinished: false,
    };

    socket.join(cleanRoomCode);
    socket.emit("joined_successfully", { roomCode: cleanRoomCode, room });
    io.to(cleanRoomCode).emit("player_joined", { room });
  });

  // 3. Iniciar a corrida (Apenas o Host)
  socket.on("start_race", ({ roomCode } = {}) => {
    const cleanRoomCode = String(roomCode || "")
      .trim()
      .toUpperCase();
    const room = rooms[cleanRoomCode];

    if (!room) {
      return socket.emit("error_message", "Sala não encontrada.");
    }

    if (room.hostId !== socket.id) {
      return socket.emit("error_message", "Você não é o host desta sala.");
    }

    room.status = "racing";
    const startTime = Date.now();

    io.to(cleanRoomCode).emit("race_started", {
      roomCode: cleanRoomCode,
      startTime,
    });
  });

  // 4. Receber progresso (Servidor Autoritativo)
  socket.on("send_progress", ({ roomId, currentLength, wpm }) => {
    const room = rooms[roomId];
    if (!room || !room.players[socket.id]) return;

    const player = room.players[socket.id];
    const totalChars = room.targetText.length;

    // Cálculo e autoridade mantidos no backend
    player.progress = Math.min(
      100,
      Math.round((currentLength / totalChars) * 100),
    );
    player.wpm = wpm;

    if (player.progress >= 100) {
      player.isFinished = true;
    }

    io.to(roomId).emit("update_players", {
      players: Object.values(room.players),
    });
  });

  // 5. Desconexão
  socket.on("disconnect", () => {
    let roomCodeToRemove = null;

    for (const roomCode of Object.keys(rooms)) {
      const room = rooms[roomCode];

      if (room.players[socket.id]) {
        roomCodeToRemove = roomCode;
        delete room.players[socket.id];
        break;
      }
    }

    if (!roomCodeToRemove) {
      console.log(`Client disconnected: ${socket.id}`);
      return;
    }

    const room = rooms[roomCodeToRemove];

    if (!room || Object.keys(room.players).length === 0) {
      delete rooms[roomCodeToRemove];
      console.log(`Room deleted: ${roomCodeToRemove}`);
      return;
    }

    io.to(roomCodeToRemove).emit("update_players", {
      roomCode: roomCodeToRemove,
      players: getRoomPlayerList(room),
    });

    console.log(`Client disconnected from room: ${roomCodeToRemove}`);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
