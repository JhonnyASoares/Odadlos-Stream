const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve os arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log(`Usuário conectado: ${socket.id}`);

  // Usuário entra em uma sala específica
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`Usuário ${socket.id} entrou na sala: ${roomId}`);

    // Avisa os outros na sala que alguém chegou
    socket.to(roomId).emit("user-joined", socket.id);
  });

  // Repassa a oferta WebRTC (SDP)
  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  // Repassa a resposta WebRTC (SDP)
  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", { from: socket.id, answer });
  });

  // Repassa os ICE Candidates (caminhos de rede P2P)
  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });

  // Quando alguém para de compartilhar a tela
  socket.on("stop-sharing", () => {
    // Encontra em qual sala o usuário está e avisa os outros
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.to(room).emit("stop-sharing", socket.id);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`Usuário desconectado: ${socket.id}`);
    io.emit("user-disconnected", socket.id);
    const rooms = io.sockets.adapter.rooms;
    console.log(rooms);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
