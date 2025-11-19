import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { SocketService } from './services/SocketService.js';
import roomRoutes from './routes/roomRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// CORS configuration for production and development
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = isProduction 
  ? true // Allow all origins in production (frontend and backend on same domain)
  : 'http://localhost:3000';

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// REST API routes
app.use('/api/rooms', roomRoutes);

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Initialize Socket Service
new SocketService(io);

// React app fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});