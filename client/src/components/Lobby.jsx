import { useEffect, useRef, useState } from "react";
import socket from "../services/socket";
import { getRandomRaceText, playersById } from "../utils/gamePresentation";
import { getPlayerId } from "../utils/playerIdentity";
import LobbyEntry from "./lobby/LobbyEntry";
import { COLOR_PRESETS } from "./lobby/constants";
import WaitingRoom from "./lobby/WaitingRoom";
import TypingPage from "../pages/TypingPage.jsx";

function ToastAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-xl"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="rounded p-1 text-white/80 hover:bg-white/20 hover:text-white"
        aria-label="Fechar mensagem"
      >
        ✕
      </button>
    </div>
  );
}

export default function Lobby({
  initialRoom = null,
  onRoomDataChange,
  onLeaveRoom,
  initialMessage = "",
  theme = "light",
  onToggleTheme,
}) {
  const roomCodeFromLink =
    new URLSearchParams(window.location.search).get("roomCode")?.trim() || "";
  const [playerName, setPlayerName] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState(() =>
    roomCodeFromLink.toUpperCase(),
  );
  const [currentRoom, setCurrentRoom] = useState(initialRoom);
  const [errorMessage, setErrorMessage] = useState(initialMessage);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomLinkCopied, setRoomLinkCopied] = useState(false);
  const [isSoloMode, setIsSoloMode] = useState(false);
  const currentRoomRef = useRef(initialRoom);

  useEffect(() => {
    const setRoom = (room) => {
      currentRoomRef.current = room;
      setCurrentRoom(room);
      onRoomDataChange?.(room);
    };

    const handleRoomJoined = ({ roomCode, room }) => {
      setRoom(room || { code: roomCode });
      setErrorMessage("");
      setIsSubmitting(false);
      setRoomLinkCopied(false);
    };

    const handlePlayerReconnected = ({ room }) => {
      if (room) setRoom(room);
    };

    const handlePlayerJoined = ({ room }) => {
      if (room) setRoom(room);
    };

    const handlePlayersUpdated = ({ players, room }) => {
      if (Array.isArray(players)) {
        const currentRoom = currentRoomRef.current;
        if (!currentRoom) return;
        setRoom({ ...currentRoom, players: playersById(players) });
        return;
      }

      if (room) setRoom(room);
    };

    const handleError = (message) => {
      setErrorMessage(
        typeof message === "string" ? message : "Ocorreu um erro inesperado.",
      );
      setIsSubmitting(false);
    };

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => {
      setIsConnected(false);
      setIsSubmitting(false);
      setRoom(null);
      setErrorMessage("Conexão perdida. Entre novamente na sala.");
    };
    const handleConnectError = () => {
      setIsConnected(false);
      setIsSubmitting(false);
      setErrorMessage("Não foi possível conectar ao servidor da sala.");
    };
    const handleRoomClosed = (message) => {
      setRoom(null);
      setErrorMessage(message || "A sala foi encerrada pelo dono da sala.");
    };

    socket.on("room_created", handleRoomJoined);
    socket.on("joined_successfully", handleRoomJoined);
    socket.on("player_reconnected", handlePlayerReconnected);
    socket.on("player_joined", handlePlayerJoined);
    socket.on("update_players", handlePlayersUpdated);
    socket.on("player_customization_updated", handlePlayerJoined);
    socket.on("room_difficulty_updated", handlePlayerJoined);
    socket.on("room_text_updated", handlePlayerJoined);
    socket.on("error_message", handleError);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("room_closed", handleRoomClosed);

    return () => {
      socket.off("room_created", handleRoomJoined);
      socket.off("joined_successfully", handleRoomJoined);
      socket.off("player_reconnected", handlePlayerReconnected);
      socket.off("player_joined", handlePlayerJoined);
      socket.off("update_players", handlePlayersUpdated);
      socket.off("player_customization_updated", handlePlayerJoined);
      socket.off("room_difficulty_updated", handlePlayerJoined);
      socket.off("room_text_updated", handlePlayerJoined);
      socket.off("error_message", handleError);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("room_closed", handleRoomClosed);
    };
  }, [onRoomDataChange]);

  useEffect(() => {
    if (!errorMessage) return undefined;
    const timeoutId = setTimeout(() => setErrorMessage(""), 4500);
    return () => clearTimeout(timeoutId);
  }, [errorMessage]);

  const handleCreateRoom = () => {
    const name = playerName.trim();
    if (!name) {
      setErrorMessage("Informe seu apelido para criar uma sala.");
      return;
    }
    if (!isConnected || isSubmitting) return;

    setIsSubmitting(true);
    socket.emit("create_room", {
      playerId: getPlayerId(),
      playerName: name,
      targetText: getRandomRaceText("Iniciante"),
      carColor: COLOR_PRESETS[0].value,
    });
  };

  const handleJoinRoom = (event) => {
    event.preventDefault();
    const name = playerName.trim();
    const roomCode = roomCodeInput.trim().toUpperCase();

    if (!name) {
      setErrorMessage("Informe seu apelido para entrar na sala.");
      return;
    }
    if (roomCode.length !== 5) {
      setErrorMessage("O código da sala deve conter exatamente 5 caracteres.");
      return;
    }
    if (!isConnected || isSubmitting) return;

    setIsSubmitting(true);
    socket.emit("join_room", {
      roomCode,
      playerId: getPlayerId(),
      playerName: name,
      carColor: COLOR_PRESETS[1].value,
    });
  };

  const handleCustomizationChange = (customization) => {
    if (!currentRoom?.code) return;
    // Atualiza o card na hora; o servidor confirma via player_customization_updated
    // (ou reverte o estado enviando o snapshot da sala, caso recuse a mudança).
    const playerId = getPlayerId();
    const currentPlayer = currentRoom.players?.[playerId];
    if (currentPlayer) {
      const nextRoom = {
        ...currentRoom,
        players: {
          ...currentRoom.players,
          [playerId]: { ...currentPlayer, ...customization },
        },
      };
      currentRoomRef.current = nextRoom;
      setCurrentRoom(nextRoom);
      onRoomDataChange?.(nextRoom);
    }
    socket.emit("update_player_customization", {
      roomCode: currentRoom.code,
      ...customization,
    });
  };

  const handleCopyRoomLink = async () => {
    if (!currentRoom?.code) return;

    const roomUrl = new URL(window.location.href);
    roomUrl.search = "";
    roomUrl.hash = "";
    roomUrl.searchParams.set("roomCode", currentRoom.code);

    try {
      await navigator.clipboard.writeText(roomUrl.toString());
      setRoomLinkCopied(true);
      setErrorMessage("");
    } catch {
      setRoomLinkCopied(false);
      setErrorMessage(
        `Não foi possível copiar o link. Compartilhe o código ${currentRoom.code}.`,
      );
    }
  };

  const handleStartRace = () => {
    if (!currentRoom?.code) return;
    socket.emit("start_race", {
      roomCode: currentRoom.code,
      // Usa exatamente o texto exibido no card "Texto da partida".
      targetText: currentRoom.targetText || getRandomRaceText(currentRoom.difficulty),
    });
  };

  const handleLeaveRoom = () => {
    currentRoomRef.current = null;
    setCurrentRoom(null);
    setRoomLinkCopied(false);
    onLeaveRoom?.();
  };

  // Dificuldade "Customizado": texto colado pelo dono da sala.
  const handleRoomTextChange = (text) => {
    if (!currentRoom?.code) return;
    socket.emit("update_room_text", {
      roomCode: currentRoom.code,
      targetText: text,
    });
  };

  // Dificuldade padrão: já sorteia o texto agora, para todos verem o texto real.
  // Escolher a mesma dificuldade de novo sorteia outro texto.
  const handleDifficultyChange = (difficulty) => {
    if (!currentRoom?.code) return;
    socket.emit("update_room_difficulty", {
      roomCode: currentRoom.code,
      difficulty,
      targetText: getRandomRaceText(difficulty, currentRoom.targetText),
    });
  };

  return (
    <>
      <ToastAlert message={errorMessage} onClose={() => setErrorMessage("")} />
      {isSoloMode ? (
        <main className="min-h-screen bg-[#FFF8F0] px-4 py-6 text-[#1E242B]">
          <button
            type="button"
            onClick={() => setIsSoloMode(false)}
            className="mx-auto block rounded-lg border border-[#E9DCCB] bg-white px-4 py-2 text-sm font-bold"
          >
            Voltar à tela inicial
          </button>
          <TypingPage />
        </main>
      ) : currentRoom ? (
        <WaitingRoom
          room={currentRoom}
          playerId={getPlayerId()}
          isConnected={isConnected}
          onStartRace={handleStartRace}
          onCustomizationChange={handleCustomizationChange}
          onDifficultyChange={handleDifficultyChange}
          onRoomTextChange={handleRoomTextChange}
          onLeaveRoom={handleLeaveRoom}
          onCopyRoomLink={handleCopyRoomLink}
          roomLinkCopied={roomLinkCopied}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
      ) : (
        <LobbyEntry
          playerName={playerName}
          roomCode={roomCodeInput}
          isRoomCodeFromLink={Boolean(roomCodeFromLink)}
          isBusy={!isConnected || isSubmitting}
          isConnected={isConnected}
          onPlayerNameChange={setPlayerName}
          onRoomCodeChange={setRoomCodeInput}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onSoloMode={() => setIsSoloMode(true)}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
      )}
    </>
  );
}
