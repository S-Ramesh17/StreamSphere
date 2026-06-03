const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');
const LiveStream = require('../models/LiveStream');

// Track online users per room
const roomUsers = new Map();

const socketHandler = (io) => {
  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('username avatar role');
        socket.user = user;
      }
      next();
    } catch (err) {
      next(); // Allow unauthenticated connections
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a room
    socket.on('room:join', async ({ room, roomType = 'global' }) => {
      socket.join(room);

      if (!roomUsers.has(room)) roomUsers.set(room, new Set());

      if (socket.user) {
        roomUsers.get(room).add(socket.id);

        const userInfo = {
          socketId: socket.id,
          userId: socket.user._id,
          username: socket.user.username,
          avatar: socket.user.avatar,
        };

        socket.to(room).emit('room:user_joined', userInfo);

        // Send system message
        const systemMsg = {
          _id: Date.now(),
          sender: { username: 'System' },
          message: `${socket.user.username} joined the chat`,
          messageType: 'system',
          createdAt: new Date(),
        };
        io.to(room).emit('chat:message', systemMsg);

        // Update viewer count for streams
        if (roomType === 'stream') {
          const streamId = room.replace('stream:', '');
          const count = roomUsers.get(room).size;
          io.to(room).emit('stream:viewer_count', { count });
          await LiveStream.findByIdAndUpdate(streamId, {
            viewerCount: count,
            $max: { peakViewers: count },
            $inc: { totalViewers: 1 },
          });
        }
      }

      // Send online users list
      const usersInRoom = Array.from(roomUsers.get(room) || []).length;
      io.to(room).emit('room:user_count', { count: usersInRoom });
    });

    // Leave room
    socket.on('room:leave', ({ room }) => {
      socket.leave(room);
      if (roomUsers.has(room)) {
        roomUsers.get(room).delete(socket.id);
        const count = roomUsers.get(room).size;
        io.to(room).emit('room:user_count', { count });
      }

      if (socket.user) {
        socket.to(room).emit('room:user_left', { socketId: socket.id, username: socket.user.username });

        const systemMsg = {
          _id: Date.now(),
          sender: { username: 'System' },
          message: `${socket.user.username} left the chat`,
          messageType: 'system',
          createdAt: new Date(),
        };
        io.to(room).emit('chat:message', systemMsg);
      }
    });

    // Chat message
    socket.on('chat:send', async ({ room, message, roomType = 'global' }) => {
      if (!socket.user) {
        socket.emit('error', { message: 'Authentication required to send messages' });
        return;
      }

      if (!message || message.trim().length === 0) return;
      if (message.length > 1000) {
        socket.emit('error', { message: 'Message too long' });
        return;
      }

      try {
        const chatMessage = await ChatMessage.create({
          sender: socket.user._id,
          room,
          roomType,
          message: message.trim(),
        });

        const populated = {
          _id: chatMessage._id,
          sender: {
            _id: socket.user._id,
            username: socket.user.username,
            avatar: socket.user.avatar,
            role: socket.user.role,
          },
          message: chatMessage.message,
          messageType: 'text',
          createdAt: chatMessage.createdAt,
          room,
        };

        io.to(room).emit('chat:message', populated);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('chat:typing', ({ room, isTyping }) => {
      if (!socket.user) return;
      socket.to(room).emit('chat:typing', {
        userId: socket.user._id,
        username: socket.user.username,
        isTyping,
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);

      // Remove from all rooms
      for (const [room, users] of roomUsers.entries()) {
        if (users.has(socket.id)) {
          users.delete(socket.id);
          const count = users.size;
          io.to(room).emit('room:user_count', { count });

          // Update stream viewer count
          if (room.startsWith('stream:')) {
            const streamId = room.replace('stream:', '');
            await LiveStream.findByIdAndUpdate(streamId, { viewerCount: count });
          }

          if (socket.user) {
            socket.to(room).emit('room:user_left', {
              socketId: socket.id,
              username: socket.user.username,
            });
          }
        }
      }
    });
  });
};

module.exports = socketHandler;
