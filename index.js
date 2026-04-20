require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const alertRoutes = require('./routes/alertRoutes');

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Attach routes
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.use(errorHandler);

// Socket.IO for real-time occupancy + alerts
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Make io accessible in controllers
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`CrowdFlow backend running on port ${PORT}`));
