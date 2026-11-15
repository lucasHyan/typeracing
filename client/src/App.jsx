import { useCallback, useEffect, useState } from 'react';
import Lobby from './components/Lobby.jsx';
import Race from './components/Race.jsx';
import Results from './components/Results.jsx';
import socket from './services/socket.js';
import { playersById } from './utils/gamePresentation.js';

function RaceCountdown({ room, onLeaveRoom }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <section className="w-full max-w-lg space-y-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl">
        <p className="text-sm font-bold tracking-widest text-sky-400">
          SALA {room.code}
        </p>
        <h1 className="text-2xl font-extrabold">Prepare-se!</h1>
        <p className="text-slate-400">A corrida começa em</p>
        <p
          aria-live="polite"
          className="text-8xl font-black tabular-nums text-emerald-400"
        >
          {room.countdownSeconds}
        </p>
        <button
          type="button"
          onClick={onLeaveRoom}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
        >
          Voltar à tela inicial
        </button>
      </section>
    </main>
  );
}

function App() {
  const [room, setRoom] = useState(null);
  const [race, setRace] = useState(null);
  const [roomMessage, setRoomMessage] = useState('');

  const handleRoomDataChange = useCallback((roomData) => {
    setRoom(roomData);
  }, []);

  const handleLeaveRoom = useCallback(() => {
    if (room?.code) {
      socket.emit('leave_room', { roomCode: room.code });
    }
    setRoom(null);
    setRace(null);
    setRoomMessage('');
  }, [room]);

  useEffect(() => {
    const handleRaceStarted = (data) => {
      setRoom((currentRoom) =>
        currentRoom
          ? {
              ...currentRoom,
              code: data.roomCode || currentRoom.code,
              status: 'racing',
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
      setRoomMessage('');
    };

    const handleRaceCountdown = (data) => {
      setRoom((currentRoom) =>
        currentRoom?.code === data.roomCode
          ? {
              ...currentRoom,
              status: 'countdown',
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
            }
          : currentRoom,
      );
    };

    const handleRaceFinished = (data) => {
      setRoom((currentRoom) =>
        currentRoom
          ? {
              ...currentRoom,
              status: 'finished',
              finishDeadline: null,
              finishSecondsRemaining: null,
              players: data.players
                ? playersById(data.players)
                : currentRoom.players,
              results: data.results || [],
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
      setRoomMessage(message || 'A sala foi encerrada pelo anfitrião.');
    };

    const handleDisconnect = () => {
      setRoom(null);
      setRace(null);
      setRoomMessage('Conexão perdida. Entre novamente na sala.');
    };

    socket.on('race_started', handleRaceStarted);
    socket.on('race_countdown', handleRaceCountdown);
    socket.on('update_players', handlePlayersUpdated);
    socket.on('race_timer', handleRaceTimer);
    socket.on('race_finished', handleRaceFinished);
    socket.on('room_lobby', handleRoomLobby);
    socket.on('room_closed', handleRoomClosed);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('race_started', handleRaceStarted);
      socket.off('race_countdown', handleRaceCountdown);
      socket.off('update_players', handlePlayersUpdated);
      socket.off('race_timer', handleRaceTimer);
      socket.off('race_finished', handleRaceFinished);
      socket.off('room_lobby', handleRoomLobby);
      socket.off('room_closed', handleRoomClosed);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  if (room?.status === 'countdown') {
    return <RaceCountdown room={room} onLeaveRoom={handleLeaveRoom} />;
  }

  if (room?.status === 'racing' && race) {
    return <Race room={room} race={race} onLeaveRoom={handleLeaveRoom} />;
  }

  if (room?.status === 'finished') {
    return <Results room={room} onLeaveRoom={handleLeaveRoom} />;
  }

  return (
    <Lobby
      initialRoom={room}
      onRoomDataChange={handleRoomDataChange}
      onLeaveRoom={handleLeaveRoom}
      initialMessage={roomMessage}
    />
  );
}

export default App;
