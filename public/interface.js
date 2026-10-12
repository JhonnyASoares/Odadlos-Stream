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

  if (container.classList.contains("fixed")) {
    container.classList.remove(
      "fixed",
      "inset-4",
      "z-50",
      "bg-zinc-900/95",
      "backdrop-blur-md",
    );
    container.classList.add("relative", "aspect-video");
    videosGrid.classList.remove("hidden");
  } else {
    container.classList.remove("relative", "aspect-video");
    container.classList.add(
      "fixed",
      "inset-4",
      "z-50",
      "bg-zinc-900/95",
      "backdrop-blur-md",
    );
    videosGrid.classList.add("hidden");
    container.classList.remove("hidden");
  }
};

// Função global para controlar o volume individual de cada vídeo
window.changeVolume = function (videoId, volumeValue) {
  const videoElement = document.getElementById(videoId);
  if (videoElement) {
    videoElement.volume = parseFloat(volumeValue);
  }
};
