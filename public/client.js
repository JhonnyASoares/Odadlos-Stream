const socket = io();

const setupScreen = document.getElementById("setup-screen");
const streamScreen = document.getElementById("stream-screen");
const roomInput = document.getElementById("room-input");
const joinBtn = document.getElementById("join-btn");
const shareBtn = document.getElementById("share-btn");
const leaveBtn = document.getElementById("leave-btn");
const videosGrid = document.getElementById("videos-grid");
const localVideo = document.getElementById("local-video");
const localCont = document.getElementById("local-container");
const roomCountElement = document.getElementById("room-count");

let localStream = null;
let peers = {};
let roomId = "";

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

joinBtn.addEventListener("click", () => {
  roomId = roomInput.value.trim();
  if (!roomId) return alert("Digite o nome da sala!");

  setupScreen.classList.add("hidden");
  streamScreen.classList.remove("hidden");
  streamScreen.classList.add("d-flex");
  document.querySelector("#room-title span").innerText = roomId;

  socket.emit("join-room", roomId);
});

leaveBtn.addEventListener("click", () => {
  location.reload();
});

// Botão inteligente de Compartilhar / Parar Compartilhamento
shareBtn.addEventListener("click", async () => {
  if (!localStream) {
    try {
      localStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      localVideo.srcObject = localStream;

      shareBtn.innerText = "Parar Compartilhamento";
      shareBtn.classList.remove("bg-emerald-600", "hover:bg-emerald-500");
      shareBtn.classList.add("bg-rose-600", "hover:bg-rose-500");
      localCont.classList.remove("hidden");

      // Adiciona as faixas locais a todas as conexões existentes e renegocia
      for (let socketId in peers) {
        const peer = peers[socketId];

        // Remove senders antigos do stream local para evitar duplicidade
        peer.getSenders().forEach((sender) => {
          if (sender.track) peer.removeTrack(sender);
        });

        localStream.getTracks().forEach((track) => {
          peer.addTrack(track, localStream);
        });

        await sendOffer(socketId);
      }

      localStream.getVideoTracks()[0].onended = () => {
        stopSharing();
      };
    } catch (err) {
      console.error("Erro ao capturar tela:", err);
    }
  } else {
    stopSharing();
  }
});

function stopSharing() {
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
    localVideo.srcObject = null;

    for (let socketId in peers) {
      const peer = peers[socketId];
      peer.getSenders().forEach((sender) => {
        if (sender.track) peer.removeTrack(sender);
      });
      sendOffer(socketId);
    }
  }

  // Avisa os outros usuários que você parou de compartilhar
  socket.emit("stop-sharing");

  shareBtn.innerText = "Compartilhar Tela";
  shareBtn.classList.remove("bg-rose-600", "hover:bg-rose-500");
  shareBtn.classList.add("bg-emerald-600", "hover:bg-emerald-500");
  localCont.classList.add("hidden");
}
async function sendOffer(socketId) {
  const peer = peers[socketId];
  if (!peer) return;
  try {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("offer", { to: socketId, offer });
  } catch (err) {
    console.error("Erro ao enviar offer:", err);
  }
}

// Eventos de Sinalização Socket.io
socket.on("user-joined", async (socketId) => {
  console.log("Novo usuário entrou:", socketId);
  const peer = createPeerConnection(socketId);
  peers[socketId] = peer;

  await sendOffer(socketId);
});

socket.on("room-count", (count) => {
  if (roomCountElement) {
    roomCountElement.innerText = `${count} ${count === 1 ? "👀" : "👀"}`;
  }
});

socket.on("offer", async ({ from, offer }) => {
  let peer = peers[from];
  if (!peer) {
    peer = createPeerConnection(from);
    peers[from] = peer;
  }

  try {
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit("answer", { to: from, answer });
  } catch (err) {
    console.error("Erro ao processar offer:", err);
  }
});

socket.on("answer", async ({ from, answer }) => {
  const peer = peers[from];
  if (peer) {
    try {
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error("Erro ao processar answer:", err);
    }
  }
});

socket.on("ice-candidate", async ({ from, candidate }) => {
  const peer = peers[from];
  if (peer) {
    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("Erro ao adicionar ICE candidate:", err);
    }
  }
});

socket.on("user-disconnected", (socketId) => {
  if (peers[socketId]) {
    peers[socketId].close();
    delete peers[socketId];
  }
  const container = document.getElementById(`video-container-${socketId}`);
  if (container) container.remove();
});

socket.on("stop-sharing", (socketId) => {
  console.log("Usuário parou de compartilhar:", socketId);
  const container = document.getElementById(`video-container-${socketId}`);
  if (container) {
    container.remove();
  }
});

function createPeerConnection(socketId) {
  const peer = new RTCPeerConnection(rtcConfig);

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", {
        to: socketId,
        candidate: event.candidate,
      });
    }
  };

  peer.ontrack = (event) => {
    let containerId = `video-container-${socketId}`;
    let videoId = `video-${socketId}`;
    let container = document.getElementById(containerId);

    event.track.onended = () => {
      const cont = document.getElementById(containerId);
      if (cont) cont.remove();
    };

    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.className =
        "video-cont relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 aspect-video flex items-center justify-center transition-all duration-300";

      const video = document.createElement("video");
      video.id = videoId;
      video.autoplay = true;
      video.playsInline = true;
      video.className = "w-full h-full object-contain";
      video.srcObject = event.streams[0];

      const label = document.createElement("span");
      label.className =
        "absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded text-xs font-medium";
      label.innerText = "Amigo";

      const controls = document.createElement("div");
      controls.className =
        "video-options absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm p-1.5 rounded-lg border border-white/10";

      controls.innerHTML = `
                <div class="volume-input flex items-center gap-1.5 px-1">
                    <svg class="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                    <input type="range" min="0" max="1" step="0.01" value="1" oninput="changeVolume('${videoId}', this.value)" class="volume-slider w-16 accent-indigo-500 cursor-pointer">
                </div>
                <div class="h-4 w-[1px] bg-white/20"></div>
                <button
                  onclick="toggleExpand('${containerId}')"
                  class="hover:bg-white/10 p-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16">
                    <path d="M 485 327 L 476 321 L 473 320 L 465 320 L 464 321 L 461 321 L 456 324 L 452 328 L 449 333 L 449 336 L 448 337 L 448 404 L 447 405 L 339 405 L 338 406 L 334 406 L 325 412 L 320 422 L 320 430 L 321 431 L 321 434 L 324 439 L 331 445 L 337 447 L 473 447 L 483 442 L 487 437 L 490 428 L 490 339 L 489 338 L 489 334 Z M 26 327 L 22 334 L 22 338 L 21 339 L 21 428 L 22 429 L 22 433 L 28 442 L 38 447 L 174 447 L 180 445 L 187 439 L 191 430 L 191 422 L 186 412 L 177 406 L 173 406 L 172 405 L 64 405 L 63 404 L 63 337 L 61 331 L 55 324 L 46 320 L 38 320 L 35 321 Z M 110 158 L 107 165 L 107 346 L 110 353 L 115 358 L 125 362 L 386 362 L 396 358 L 400 354 L 404 346 L 404 165 L 401 158 L 396 153 L 386 149 L 125 149 L 115 153 Z M 148 192 L 149 191 L 362 191 L 363 192 L 363 319 L 362 320 L 149 320 L 148 319 Z M 324 72 L 321 77 L 321 80 L 320 81 L 320 89 L 325 99 L 334 105 L 338 105 L 339 106 L 447 106 L 448 107 L 448 174 L 449 175 L 449 178 L 452 183 L 456 187 L 465 191 L 473 191 L 476 190 L 485 184 L 489 177 L 489 173 L 490 172 L 490 83 L 489 82 L 489 78 L 483 69 L 473 64 L 337 64 L 331 66 Z M 24 181 L 28 186 L 38 191 L 46 191 L 55 187 L 61 180 L 63 174 L 63 107 L 64 106 L 172 106 L 173 105 L 177 105 L 184 101 L 190 92 L 191 89 L 191 81 L 189 75 L 183 68 L 174 64 L 38 64 L 28 69 L 24 74 L 21 83 L 21 172 Z" fill="#FFF" fill-rule="evenodd"/>
                  </svg>
                </button>
                <div class="h-4 w-[1px] bg-white/20"></div>
                <button onclick="toggleMaximize('${containerId}')" class="hover:bg-white/10 p-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                </button>
            `;

      container.appendChild(video);
      container.appendChild(label);
      container.appendChild(controls);
      videosGrid.appendChild(container);
    } else {
      const video = document.getElementById(videoId);
      if (video && event.streams[0]) {
        video.srcObject = event.streams[0];
      }
    }
  };

  // Se você já estiver compartilhando tela na hora que alguém entra, injeta o stream
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      peer.addTrack(track, localStream);
    });
  }

  return peer;
}
