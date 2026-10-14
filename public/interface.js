function toggleExpand(containerId) {
  const grid = document.getElementById("videos-grid");
  const container = document.getElementById(containerId);

  // Se este container já está fixado, removemos o destaque (volta ao normal)
  if (container.classList.contains("pinned")) {
    container.classList.remove("pinned");
    grid.classList.remove("pinned-layout");
  } else {
    // Remove a classe 'pinned' de qualquer outro container que porventura a tenha
    document.querySelectorAll("#videos-grid > div").forEach((el) => {
      el.classList.remove("pinned");
    });

    // Adiciona o destaque no container clicado e ativa o layout no grid
    container.classList.add("pinned");
    grid.classList.add("pinned-layout");
  }
}

// Função global para Maximizar / Minimizar qualquer vídeo
window.toggleMaximize = function (containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Se já estiver em tela cheia, sai do modo fullscreen
  if (document.fullscreenElement) {
    document.exitFullscreen().catch((err) => {
      console.error("Erro ao sair do fullscreen:", err);
    });
  } else {
    // Caso contrário, coloca o container inteiro (com vídeo, botões e labels) em Fullscreen
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      // Suporte para Safari/iOS
      container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
      // Suporte para IE/Edge antigo
      container.msRequestFullscreen();
    }
  }
};

// Função global para controlar o volume individual de cada vídeo
window.changeVolume = function (videoId, volumeValue) {
  const videoElement = document.getElementById(videoId);
  if (videoElement) {
    videoElement.volume = parseFloat(volumeValue);
  }
};

const roomTitle = document.getElementById("room-title");
const buttonsContainer = document.getElementById("buttons-container");
const roomCount = document.getElementById("room-count");
let temporizador;

document.addEventListener("mousemove", () => {
  roomTitle.classList.remove("sumir");
  buttonsContainer.classList.remove("sumir");
  roomCount.classList.remove("sumir");

  clearTimeout(temporizador);

  temporizador = setTimeout(() => {
    roomTitle.classList.add("sumir");
    buttonsContainer.classList.add("sumir");
    roomCount.classList.add("sumir");
  }, 2000);
});
