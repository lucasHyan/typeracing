import { useState, useEffect } from 'react';
import socket from '../services/socket';

const COLOR_PRESETS = [
  { name: 'Azul', value: '#2563eb' },
  { name: 'Vermelho', value: '#dc2626' },
  { name: 'Verde', value: '#16a34a' },
  { name: 'Amarelo', value: '#eab308' },
];

function ToastAlert({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-xl transition-all">
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 rounded p-1 text-white/80 hover:bg-white/20 hover:text-white"
        aria-label="Fechar"
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
        Desafie seus amigos em tempo real na corrida de digitação
      </p>
    </header>
  );
}

function PilotCustomizer({
  playerName,
  onPlayerNameChange,
  carColor,
  onCarColorChange,
  colorPresets,
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-200">
        Identificação do Piloto
      </h2>

      <div>
        <label htmlFor="player-name" className="mb-2 block text-sm font-medium text-slate-400">
          Apelido
        </label>
        <input
          id="player-name"
          type="text"
          value={playerName}
          onChange={(e) => onPlayerNameChange(e.target.value)}
          placeholder="Ex: Ayrton"
          maxLength={18}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-400">
          Cor do Veículo
        </label>
        <div className="flex items-center gap-3">
          {colorPresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onCarColorChange(preset.value)}
              className={`h-9 w-9 rounded-full border-2 transition-all ${
                carColor === preset.value
                  ? 'scale-110 border-white ring-2 ring-slate-900 ring-offset-2 ring-offset-slate-800'
                  : 'border-transparent opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: preset.value }}
              title={preset.name}
            />
          ))}
          <input
            type="color"
            value={carColor}
            onChange={(e) => onCarColorChange(e.target.value)}
            className="h-9 w-9 cursor-pointer rounded-full border-0 bg-transparent p-0"
            title="Escolher cor personalizada"
          />
        </div>
      </div>
    </section>
  );
}

function CreateRoomSection({ onCreateRoom }) {
  return (
    <div className="flex flex-col justify-between space-y-3">
      <div>
        <h3 className="text-base font-semibold text-slate-100">Criar uma Nova Sala</h3>
        <p className="mt-1 text-sm text-slate-400">
          Inicie uma nova partida e convide outros corredores.
        </p>
      </div>
      <button
        type="button"
        onClick={onCreateRoom}
        className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-blue-500 active:scale-[0.99]"
      >
        Criar Sala
      </button>
    </div>
  );
}

function JoinRoomSection({ roomCode, onRoomCodeChange, onJoinRoom }) {
  return (
    <div className="flex flex-col justify-between space-y-3">
      <div>
        <h3 className="text-base font-semibold text-slate-100">Entrar na Sala</h3>
        <p className="mt-1 text-sm text-slate-400">
          Possui um código de 5 dígitos? Digite-o abaixo.
        </p>
      </div>
      <form onSubmit={onJoinRoom} className="space-y-3">
        <input
          type="text"
          value={roomCode}
          onChange={(e) => onRoomCodeChange(e.target.value.toUpperCase())}
          placeholder="CÓDIGO (5 DÍGITOS)"
          maxLength={5}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-center font-mono text-base font-bold tracking-widest text-sky-400 placeholder-slate-600 outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-800 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-slate-700 active:scale-[0.99]"
        >
          Entrar na Sala
        </button>
      </form>
    </div>
  );
}

function WaitingRoomView({ room, socketId, onStartRace }) {
  const players = room?.players ? Object.values(room.players) : [];
  const isHost = room?.hostId === socketId;

  return (
    <div className="w-full max-w-xl space-y-6 rounded-2xl border border-slate-800 bg-slate-800/80 p-8 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-slate-700 pb-5">
        <div>
          <span className="block text-xs font-bold tracking-wider text-sky-400">
            SALA DE ESPERA
          </span>
          <h2 className="text-xl font-bold text-slate-100">
            Código:{' '}
            <span className="font-mono tracking-widest text-sky-400">
              {room.code}
            </span>
          </h2>
        </div>
        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
          {players.length} {players.length === 1 ? 'jogador' : 'jogadores'}
        </span>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Pilotos Conectados</h3>
        <ul className="space-y-2">
          {players.map((player) => {
            const isMe = player.id === socketId;
            const isRoomHost = player.id === room.hostId;

            return (
              <li
                key={player.id}
                className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/80 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: player.color || '#2563eb' }}
                  />
                  <span className="font-medium text-slate-200">
                    {player.name}
                    {isMe && <span className="ml-1 text-xs text-sky-400">(Você)</span>}
                  </span>
                </div>
                {isRoomHost && (
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
                    Anfitrião
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pt-2">
        {isHost ? (
          <button
            type="button"
            onClick={onStartRace}
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 active:scale-[0.99]"
          >
            Iniciar Corrida
          </button>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/50 py-3 text-center text-sm text-slate-400">
            Aguardando o anfitrião iniciar a corrida...
          </div>
        )}
      </div>
    </div>
  );
}

export default function Lobby({ onRaceStart, onRoomDataChange }) {
  const [playerName, setPlayerName] = useState('');
  const [carColor, setCarColor] = useState(COLOR_PRESETS[0].value);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleRoomCreated = ({ roomCode, room }) => {
      const roomData = room || { code: roomCode };
      setCurrentRoom(roomData);
      setErrorMessage('');
      if (onRoomDataChange) {
        onRoomDataChange(roomData);
      }
    };

    const handleJoinedSuccessfully = ({ roomCode, room }) => {
      const roomData = room || { code: roomCode };
      setCurrentRoom(roomData);
      setErrorMessage('');
      if (onRoomDataChange) {
        onRoomDataChange(roomData);
      }
    };

    const handlePlayerJoined = ({ room }) => {
      if (room) {
        setCurrentRoom(room);
        if (onRoomDataChange) {
          onRoomDataChange(room);
        }
      }
    };

    const handleUpdatePlayers = (data) => {
      if (Array.isArray(data?.players)) {
        setCurrentRoom((prevRoom) => {
          if (!prevRoom) return prevRoom;
          const updatedPlayers = {};
          data.players.forEach((player) => {
            updatedPlayers[player.id] = player;
          });
          const newRoom = { ...prevRoom, players: updatedPlayers };
          if (onRoomDataChange) {
            onRoomDataChange(newRoom);
          }
          return newRoom;
        });
      } else if (data?.room) {
        setCurrentRoom(data.room);
        if (onRoomDataChange) {
          onRoomDataChange(data.room);
        }
      }
    };

    const handleErrorMessage = (message) => {
      setErrorMessage(typeof message === 'string' ? message : 'Ocorreu um erro inesperado.');
    };

    const handleRaceStarted = (data) => {
      if (onRaceStart) {
        onRaceStart({
          ...data,
          room: currentRoom,
          roomCode: currentRoom?.code || roomCodeInput,
        });
      }
    };

    socket.on('room_created', handleRoomCreated);
    socket.on('joined_successfully', handleJoinedSuccessfully);
    socket.on('player_joined', handlePlayerJoined);
    socket.on('update_players', handleUpdatePlayers);
    socket.on('error_message', handleErrorMessage);
    socket.on('race_started', handleRaceStarted);

    return () => {
      socket.off('room_created', handleRoomCreated);
      socket.off('joined_successfully', handleJoinedSuccessfully);
      socket.off('player_joined', handlePlayerJoined);
      socket.off('update_players', handleUpdatePlayers);
      socket.off('error_message', handleErrorMessage);
      socket.off('race_started', handleRaceStarted);
    };
  }, [currentRoom, roomCodeInput, onRaceStart, onRoomDataChange]);

  useEffect(() => {
    if (!errorMessage) return;
    const timeoutId = setTimeout(() => {
      setErrorMessage('');
    }, 4500);

    return () => clearTimeout(timeoutId);
  }, [errorMessage]);

  const handleCreateRoom = (event) => {
    event.preventDefault();
    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setErrorMessage('Por favor, informe seu apelido para criar uma sala.');
      return;
    }

    socket.emit('create_room', {
      playerName: trimmedName,
      carColor,
    });
  };

  const handleJoinRoom = (event) => {
    event.preventDefault();
    const trimmedName = playerName.trim();
    const cleanRoomCode = roomCodeInput.trim().toUpperCase();

    if (!trimmedName) {
      setErrorMessage('Por favor, informe seu apelido para entrar na sala.');
      return;
    }

    if (cleanRoomCode.length !== 5) {
      setErrorMessage('O código da sala deve conter exatamente 5 caracteres.');
      return;
    }

    socket.emit('join_room', {
      roomCode: cleanRoomCode,
      playerName: trimmedName,
      carColor,
    });
  };

  const handleStartRace = () => {
    if (!currentRoom?.code) return;
    socket.emit('start_race', {
      roomCode: currentRoom.code,
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <ToastAlert
        message={errorMessage}
        onClose={() => setErrorMessage('')}
      />

      <LobbyHeader />

      {!currentRoom ? (
        <div className="w-full max-w-2xl space-y-8 rounded-2xl border border-slate-800 bg-slate-800/80 p-8 shadow-2xl backdrop-blur-sm">
          <PilotCustomizer
            playerName={playerName}
            onPlayerNameChange={setPlayerName}
            carColor={carColor}
            onCarColorChange={setCarColor}
            colorPresets={COLOR_PRESETS}
          />

          <hr className="border-slate-700" />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <CreateRoomSection onCreateRoom={handleCreateRoom} />
            <JoinRoomSection
              roomCode={roomCodeInput}
              onRoomCodeChange={setRoomCodeInput}
              onJoinRoom={handleJoinRoom}
            />
          </div>
        </div>
      ) : (
        <WaitingRoomView
          room={currentRoom}
          socketId={socket.id}
          onStartRace={handleStartRace}
        />
      )}
    </div>
  );
}
