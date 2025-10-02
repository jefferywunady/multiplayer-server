const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (good for dev, restrict later if needed)
    methods: ["GET", "POST"]
  }
});

// Store players
let players = {};

io.on("connection", (socket) => {
  console.log("New player:", socket.id);

  // Add new player
  players[socket.id] = { x: 100, y: 100 };
  socket.emit("currentPlayers", players);
  socket.broadcast.emit("newPlayer", { id: socket.id, ...players[socket.id] });

  // Handle movement
  socket.on("playerMove", (data) => {
    players[socket.id] = data;
    io.emit("playerMoved", { id: socket.id, ...data });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
