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
