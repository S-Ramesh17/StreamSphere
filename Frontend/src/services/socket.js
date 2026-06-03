import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
let socket = null;

export const initSocket = (token) => {
  if (socket) socket.disconnect();
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  socket.on('connect', () => console.log('Socket connected:', socket.id));
  socket.on('disconnect', () => console.log('Socket disconnected'));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

export const joinRoom = (room, roomType = 'global') => {
  if (socket) socket.emit('room:join', { room, roomType });
};

export const leaveRoom = (room) => {
  if (socket) socket.emit('room:leave', { room });
};

export const sendChatMessage = (room, message, roomType = 'global') => {
  if (socket) socket.emit('chat:send', { room, message, roomType });
};

export const sendTyping = (room, isTyping) => {
  if (socket) socket.emit('chat:typing', { room, isTyping });
};
