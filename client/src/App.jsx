import { useCallback, useEffect, useState } from "react";
import LobbyPage from "./pages/LobbyPage.jsx";
import RacePage from "./pages/RacePage.jsx";
import ResultsPage from "./pages/ResultsPage.jsx";
import socket from "./services/socket.js";
import { playersById } from "./utils/gamePresentation.js";
import { getPlayerId } from "./utils/playerIdentity.js";

function App() {
  const [room, setRoom] = useState(null);
  const [race, setRace] = useState(null);
  const [roomMessage, setRoomMessage] = useState("");

  const handleRoomDataChange = useCallback((roomData) => {
    setRoom(roomData);
  }, []);

  const handleLeaveRoom = useCallback(() => {
    if (room?.code) {
      socket.emit("leave_room", { roomCode: room.code });
    }
    sessionStorage.removeItem("typeracing-player-id");
    setRoom(null);
    setRace(null);
    setRoomMessage("");
  }, [room]);

  useEffect(() => {
    const handleConnect = () => {
      socket.emit("reconnect_player", { playerId: getPlayerId() });
    };

    const handlePlayerReconnected = ({ room }) => {
      if (!room) return;
      setRoom(room);
      setRoomMessage("");
      setRace(
        room.status === "racing"
          ? {
              roomCode: room.code,
              targetText: room.targetText,
              startTime: room.startedAt,
            }
          : null,
      );
    };

    const handleRaceStarted = (data) => {
      setRoom((currentRoom) =>
        currentRoom
          ? {
              ...currentRoom,
              code: data.roomCode || currentRoom.code,
              status: "racing",
              targetText: data.targetText,
              countdownSeconds: null,
              finishDeadline: null,
              finishSecondsRemaining: null,
              players: data.players
                ? playersById(data.players)
                : currentRoom.players,
            }
          : currentRoom,
      );
      setRace({
        roomCode: data.roomCode,
        targetText: data.targetText,
        startTime: data.startTime,
      });
      setRoomMessage("");
    };

    const handleRaceCountdown = (data) => {
      setRoom((currentRoom) =>
        currentRoom?.code === data.roomCode
          ? {
              ...currentRoom,
              status: "countdown",
              targetText: data.targetText,
              countdownSeconds: data.secondsRemaining,
              finishDeadline: null,
              finishSecondsRemaining: null,
            }
          : currentRoom,
      );
      setRace(null);
    };

    const handlePlayersUpdated = (data) => {
      if (!Array.isArray(data?.players)) return;
      setRoom((currentRoom) =>
        currentRoom
          ? {
              ...currentRoom,
              players: playersById(data.players),
            }
          : currentRoom,
      );
    };

    const handleRaceTimer = (data) => {
      setRoom((currentRoom) =>
        currentRoom?.code === data.roomCode
          ? {
              ...currentRoom,
              finishSecondsRemaining: data.secondsRemaining,
              raceEndAt: data.raceEndAt || currentRoom.raceEndAt,
            }
          : currentRoom,
      );
    };

    const handleRaceFinished = (data) => {
      setRoom((currentRoom) =>
        currentRoom
          ? {
              ...currentRoom,
              status: "finished",
              finishDeadline: null,
              finishSecondsRemaining: null,
              players: data.players
                ? playersById(data.players)
                : currentRoom.players,
              results: data.results || [],
              raceEndAt: null,
            }
          : currentRoom,
      );
    };

    const handleRoomLobby = (data) => {
      setRoom({
        ...data.room,
        countdownSeconds: null,
        finishDeadline: null,
        finishSecondsRemaining: null,
      });
      setRace(null);
    };

    const handleRoomClosed = (message) => {
      setRoom(null);
      setRace(null);
      setRoomMessage(message || "A sala foi encerrada pelo anfitrião.");
    };

    const handleDisconnect = () => {
      setRoom(null);
      setRace(null);
      setRoomMessage("Conexão perdida. Entre novamente na sala.");
    };

    socket.on("race_started", handleRaceStarted);
    socket.on("race_countdown", handleRaceCountdown);
    socket.on("update_players", handlePlayersUpdated);
    socket.on("race_timer", handleRaceTimer);
    socket.on("race_finished", handleRaceFinished);
    socket.on("room_lobby", handleRoomLobby);
    socket.on("player_reconnected", handlePlayerReconnected);
    socket.on("room_closed", handleRoomClosed);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleConnect);
    if (socket.connected) handleConnect();

    return () => {
      socket.off("race_started", handleRaceStarted);
      socket.off("race_countdown", handleRaceCountdown);
      socket.off("update_players", handlePlayersUpdated);
      socket.off("race_timer", handleRaceTimer);
      socket.off("race_finished", handleRaceFinished);
      socket.off("room_lobby", handleRoomLobby);
      socket.off("player_reconnected", handlePlayerReconnected);
      socket.off("room_closed", handleRoomClosed);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleConnect);
    };
  }, []);

  if (room?.status === "countdown") {
    return (
      <RacePage
        room={room}
        race={{
          roomCode: room.code,
          targetText: room.targetText,
          startTime: null,
        }}
        countdownSeconds={room.countdownSeconds}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  if (room?.status === "racing" && race) {
    return <RacePage room={room} race={race} onLeaveRoom={handleLeaveRoom} />;
  }

  if (room?.status === "finished") {
    return <ResultsPage room={room} onLeaveRoom={handleLeaveRoom} />;
  }

  return (
    <LobbyPage
      initialRoom={room}
      onRoomDataChange={handleRoomDataChange}
      onLeaveRoom={handleLeaveRoom}
      initialMessage={roomMessage}
    />
  );
}

export default App;
