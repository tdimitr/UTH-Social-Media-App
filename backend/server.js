import express from 'express';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import cookieParser from 'cookie-parser';
import { app, server } from './socket.js';
import connectDB from './db/connectDB.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import platformMiddleware from './middleware/platformMiddleware.js';

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middlewares
app.use(express.json({ limit: '50mb' })); // To parse JSON request in the req.body
app.use(express.urlencoded({ extended: true })); // To parse form-urlencoded request in the req.body
app.use(cookieParser());
app.use(platformMiddleware);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);

server.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`),
);
