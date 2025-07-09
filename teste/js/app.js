// Simulação de player de áudio com YouTube (modo somente áudio)

// Substitua por sua chave de API do YouTube Data v3
const YOUTUBE_API_KEY = 'AIzaSyBF0Ht7_rZ1pFd51qNDP-QW1V_6dfItwS8';

// Função para buscar dados do vídeo atual
async function atualizarInfoVideo(videoId) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.items && data.items.length > 0) {
      const snippet = data.items[0].snippet;
      document.querySelector('.music-title').textContent = snippet.title;
      document.querySelector('.artist-name').textContent = snippet.channelTitle;
      document.querySelector('.cover').src = snippet.thumbnails.high.url;
    }
  } catch (e) {
    // fallback visual
    document.querySelector('.music-title').textContent = 'Desconhecido';
    document.querySelector('.artist-name').textContent = '';
    document.querySelector('.cover').src = 'assets/bg.webp';
  }
}

// Inicialização do player
let player;
let playerPronto = false; // flag para saber se o player está pronto

function onPlayerReady(event) {
  playerPronto = true;
  atualizarInfoVideo(player.getVideoData().video_id);
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    player.nextVideo();
  }
  if (
    event.data === YT.PlayerState.PLAYING ||
    event.data === YT.PlayerState.BUFFERING
  ) {
    atualizarInfoVideo(player.getVideoData().video_id);
  }
  // Atualiza o botão play/pause conforme o estado real do player
  if (event.data === YT.PlayerState.PLAYING) {
    playBtn.textContent = '⏸️';
  } else if (
    event.data === YT.PlayerState.PAUSED ||
    event.data === YT.PlayerState.ENDED
  ) {
    playBtn.textContent = '▶️';
  }
}

// Função global para API do YouTube
window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    videoId: 'eT5_neXR3FI',
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      playsinline: 1,
      listType: 'playlist',
      list: 'PLX_YaKXOr1s6u6O3srDxVJn720Zi2RRC5'
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
};

// Controles
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

playBtn.addEventListener('click', () => {
  if (!player || !playerPronto) return;
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
    // O texto do botão será atualizado pelo onPlayerStateChange
  } else {
    player.playVideo();
    // O texto do botão será atualizado pelo onPlayerStateChange
  }
});

prevBtn.addEventListener('click', () => {
  if (player && playerPronto) player.previousVideo();
});

nextBtn.addEventListener('click', () => {
  if (player && playerPronto) player.nextVideo();
});

// TEMA
const toggleBtn = document.getElementById('theme-toggle');
toggleBtn.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark-mode');
});
