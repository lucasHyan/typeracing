import { useEffect, useRef, useState } from 'react';
import socket from '../services/socket';
import {
  getRandomRaceText,
  playersById,
} from '../utils/gamePresentation';
import LobbyEntry from './lobby/LobbyEntry';
import WaitingRoom from './lobby/WaitingRoom';

function ToastAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed right-5 top-5 z-50 flex items-center gap-3 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-xl"
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

function LobbyHeader() {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-sky-400">
        TypeRacing
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Desafie seus amigos em uma corrida de digitação em tempo real
      </p>
    </header>
  );
}

export default function Lobby({ onRoomDataChange, initialMessage = '' }) {
  const [playerName, setPlayerName] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [errorMessage, setErrorMessage] = useState(initialMessage);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentRoomRef = useRef(null);

  useEffect(() => {
    const setRoom = (room) => {
      currentRoomRef.current = room;
      setCurrentRoom(room);
      onRoomDataChange?.(room);
    };

    const handleRoomJoined = ({ roomCode, room }) => {
      setRoom(room || { code: roomCode });
      setErrorMessage('');
      setIsSubmitting(false);
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
        typeof message === 'string' ? message : 'Ocorreu um erro inesperado.',
      );
      setIsSubmitting(false);
    };

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => {
      setIsConnected(false);
      setIsSubmitting(false);
      setRoom(null);
      setErrorMessage('Conexão perdida. Entre novamente na sala.');
    };
    const handleConnectError = () => {
      setIsConnected(false);
      setIsSubmitting(false);
      setErrorMessage('Não foi possível conectar ao servidor da sala.');
    };
    const handleRoomClosed = (message) => {
      setRoom(null);
      setErrorMessage(message || 'A sala foi encerrada pelo professor.');
    };

    socket.on('room_created', handleRoomJoined);
    socket.on('joined_successfully', handleRoomJoined);
    socket.on('player_joined', handlePlayerJoined);
    socket.on('update_players', handlePlayersUpdated);
    socket.on('player_customization_updated', handlePlayerJoined);
    socket.on('error_message', handleError);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('room_closed', handleRoomClosed);

    return () => {
      socket.off('room_created', handleRoomJoined);
      socket.off('joined_successfully', handleRoomJoined);
      socket.off('player_joined', handlePlayerJoined);
      socket.off('update_players', handlePlayersUpdated);
      socket.off('player_customization_updated', handlePlayerJoined);
      socket.off('error_message', handleError);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('room_closed', handleRoomClosed);
    };
  }, [onRoomDataChange]);

  useEffect(() => {
    if (!errorMessage) return undefined;
    const timeoutId = setTimeout(() => setErrorMessage(''), 4500);
    return () => clearTimeout(timeoutId);
  }, [errorMessage]);

  const handleCreateRoom = () => {
    const name = playerName.trim();
    if (!name) {
      setErrorMessage('Informe seu apelido para criar uma sala.');
      return;
    }
    if (!isConnected || isSubmitting) return;

    setIsSubmitting(true);
    socket.emit('create_room', {
      playerName: name,
      targetText: getRandomRaceText(),
    });
  };

  const handleJoinRoom = (event) => {
    event.preventDefault();
    const name = playerName.trim();
    const roomCode = roomCodeInput.trim().toUpperCase();

    if (!name) {
      setErrorMessage('Informe seu apelido para entrar na sala.');
      return;
    }
    if (roomCode.length !== 5) {
      setErrorMessage('O código da sala deve conter exatamente 5 caracteres.');
      return;
    }
    if (!isConnected || isSubmitting) return;

    setIsSubmitting(true);
    socket.emit('join_room', { roomCode, playerName: name });
  };

  const handleCustomizationChange = (customization) => {
    if (!currentRoom?.code) return;
    socket.emit('update_player_customization', {
      roomCode: currentRoom.code,
      ...customization,
    });
  };

  const handleStartRace = () => {
    if (!currentRoom?.code) return;
    socket.emit('start_race', {
      roomCode: currentRoom.code,
      targetText: currentRoom.targetText || getRandomRaceText(),
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <ToastAlert message={errorMessage} onClose={() => setErrorMessage('')} />
      <LobbyHeader />

      {!isConnected && (
        <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
          Conectando ao servidor da sala...
        </p>
      )}

      {currentRoom ? (
        <WaitingRoom
          room={currentRoom}
          socketId={socket.id}
          onStartRace={handleStartRace}
          onCustomizationChange={handleCustomizationChange}
        />
      ) : (
        <LobbyEntry
          playerName={playerName}
          roomCode={roomCodeInput}
          isBusy={!isConnected || isSubmitting}
          onPlayerNameChange={setPlayerName}
          onRoomCodeChange={setRoomCodeInput}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}
    </main>
  );
}
