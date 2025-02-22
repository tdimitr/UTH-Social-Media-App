import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import Message from './models/messageModel.js';
import Conversation from './models/conversationModel.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://192.168.1.5:8081'],
    methods: ['GET', 'POST'],
  },
});

// real time messages
export const getRecipientSocketId = (recipientId) => {
  return userSocketMap[recipientId];
};

const userSocketMap = {}; // userId : socketId

// listens for incoming connections
io.on('connection', (socket) => {
  console.log('user connected', socket.id);
  const userId = socket.handshake.query.userId;

  // emits the connected users to all online clients
  if (userId != 'undefined') userSocketMap[userId] = socket.id;
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  // mark messages status as seen
  socket.on('markMessagesAsSeen', async ({ conversationId, userId }) => {
    if (userId === socket.handshake.query.userId) {
      try {
        await Message.updateMany(
          { conversationId: conversationId, seen: false },
          { $set: { seen: true } },
        );
        await Conversation.updateOne(
          { _id: conversationId },
          { $set: { 'lastMessage.seen': true } },
        );
        // notifies the user that the message have marked as seen
        io.to(userSocketMap[userId]).emit('messagesSeen', { conversationId });
      } catch (error) {
        console.log(error);
      }
    }
  });

  // when user disconnected emit all online clients
  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete userSocketMap[userId];
    io.emit('getOnlineUser', Object.keys(userSocketMap));
  });
});

export { io, server, app };
