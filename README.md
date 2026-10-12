# 🚀 Odadlos Stream

Um aplicativo web minimalista, leve e de código aberto para compartilhamento de tela em tempo real e em grupo (estilo Discord simplificado), projetado para rodar com baixíssimo consumo de recursos utilizando **WebRTC** e **Node.js**.

Desenvolvido para ser hospedado facilmente em VPS gratuitas (como a Oracle Cloud Free Tier) ou servidores locais.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3 (com customizações próprias), JavaScript Moderno.
- **Backend:** Node.js, Express, Socket.io (para sinalização WebRTC).
- **Comunicação de Vídeo:** WebRTC (Peer-to-Peer / Arquitetura Mesh) com servidores STUN públicos do Google.
- **Proxy Reverso & SSL:** Apache / Nginx + Cloudflare.

---

## ✨ Funcionalidades

- 🖥️ **Compartilhamento de Tela com Áudio:** Compartilhe sua tela e o áudio do sistema diretamente pelo navegador.
- 👥 **Salas Dinâmicas por Nome:** Entre em uma sala digitando o nome dela; quem estiver na mesma sala se conecta automaticamente.
- 🔊 **Controle de Volume Individual:** Ajuste o volume de cada stream de vídeo separadamente através de um slider integrado.
- 🔲 **Modo Destaque / Expandido:** Layout inteligente estilo grade que permite fixar ou maximizar qualquer tela em foco.
- 🔄 **Parada e Saída Dinâmica:** Se alguém parar de compartilhar ou sair da sala, a interface se atualiza automaticamente para todos.
- 🛡️ **Baixo Consumo:** Como a transmissão de vídeo e áudio é feita ponto a ponto (P2P), o servidor atua apenas como ponte inicial, exigindo pouquíssima memória RAM.

---

## ⚙️ Pré-requisitos para Instalação

Antes de começar, certifique-se de ter instalado no seu servidor:

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn**
- **PM2** (recomendado para manter o app rodando em segundo plano)

---

## 📥 Como Rodar o Projeto (Passo a Passo)

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/JhonnyASoares/Odadlos-Stream.git](https://github.com/JhonnyASoares/Odadlos-Stream.git)
   cd odadlos-stream
   ```
