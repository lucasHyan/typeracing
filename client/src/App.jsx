import { useCallback, useEffect, useState } from 'react';
import Lobby from './components/Lobby.jsx';
import Race from './components/Race.jsx';
import Results from './components/Results.jsx';
import socket from './services/socket.js';
import { playersById } from './utils/gamePresentation.js';

function App() {
  const [room, setRoom] = useState(null);
  const [race, setRace] = useState(null);
  const [roomMessage, setRoomMessage] = useState('');

  const handleRoomDataChange = useCallback((roomData) => {
    setRoom(roomData);
  }, []);

  useEffect(() => {
    const handleRaceStarted = (data) => {
      setRoom((currentRoom) =>
        currentRoom
          ? {
              ...currentRoom,
              code: data.roomCode || currentRoom.code,
              status: 'racing',
              targetText: data.targetText,
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

    const handleRaceFinished = (data) => {
      setRoom((currentRoom) =>
        currentRoom
          ? {
              ...currentRoom,
              status: 'finished',
              players: data.players
                ? playersById(data.players)
                : currentRoom.players,
              results: data.results || [],
            }
          : currentRoom,
      );
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
    socket.on('update_players', handlePlayersUpdated);
    socket.on('race_finished', handleRaceFinished);
    socket.on('room_closed', handleRoomClosed);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('race_started', handleRaceStarted);
      socket.off('update_players', handlePlayersUpdated);
      socket.off('race_finished', handleRaceFinished);
      socket.off('room_closed', handleRoomClosed);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  if (room?.status === 'racing' && race) {
    return <Race room={room} race={race} />;
  }

  if (room?.status === 'finished') {
    return <Results room={room} />;
  }

  return (
    <Lobby
      onRoomDataChange={handleRoomDataChange}
      initialMessage={roomMessage}
    />
  );
}

export default App;
