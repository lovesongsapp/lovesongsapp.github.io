// === Love Songs App – Código Final Revisado ===

// Variáveis globais
let player, progressBar, currentTimeDisplay, durationDisplay;
let isPlaying = false, isShuffle = false;
let mode = 'repeat';
let playlistData = [];
let sharedVideoId = null;
let qualidade = ''; // armazena a qualidade atual (como 'medium')

// Mapa para tradução de qualidade
const resolucaoAmigavel = {
  tiny: '144p', small: '240p', medium: '360p', large: '480p',
  hd720: '720p', hd1080: '1080p', highres: '1080p+', default: 'Desconhecida'
};

// Carrega API do YouTube
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

// Corrige bug do postMessage do YouTube
(function() {
  const original = window.postMessage;
  window.postMessage = function(msg, origin, transfer) {
    if (typeof origin === 'string' && origin.includes('youtube.com')) {
      origin = '*';
    }
    return original.call(this, msg, origin, transfer);
  };
})();

// Aguarda o DOM para capturar elementos
document.addEventListener('DOMContentLoaded', () => {
  progressBar = document.getElementById('progress');
  currentTimeDisplay = document.getElementById('current-time');
  durationDisplay = document.getElementById('duration');

  if (!progressBar || !currentTimeDisplay || !durationDisplay) {
    console.error('⚠️ Elementos do DOM não encontrados.');
  }
});

// Função chamada pela API do YouTube
function onYouTubeIframeAPIReady() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('videoId') || '1OgQdgSQB3o';

  player = new YT.Player('music-player', {
    height: '100%', width: '100%', videoId,
    playerVars: {
      listType: 'playlist',
      list: 'PLX_YaKXOr1s6u6O3srDxVJn720Zi2RRC5',
      autoplay: 0, controls: 0, iv_load_policy: 3,
      modestbranding: 1, rel: 0
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// Força qualidade 360p e mostra no overlay de qualidade
function atualizarQualidadeNaInterface() {
  if (player && typeof player.getPlaybackQuality === 'function') {
    const qualidadeAtual = player.getPlaybackQuality();
    const label = document.getElementById('quality-label');
    if (label) {
      const resolucao = resolucaoAmigavel[qualidadeAtual] || resolucaoAmigavel.default;
      label.innerText = `Qualidade: ${resolucao}`;
      console.log(`🎥 Qualidade detectada: ${resolucao}`);
    }
  }
}

// Função chamada quando o player estiver pronto
function onPlayerReady(event) {
  qualidade = 'medium'; // fixa 360p nos padrões do Love Songs App
  setupControlButtons();
  iniciarVerificacaoPlaylist(); // <- adiciona aqui!
  let tentativas = 0;
  const maxTentativas = 5;
  const interval = setInterval(() => {
    tentativas++;
    if (player && typeof player.setPlaybackQuality === 'function') {
      player.setPlaybackQuality(qualidade);
      console.log(`🎯 Qualidade forçada para: ${qualidade.toUpperCase()}`);

      const label = document.getElementById('quality-label');
      if (label) label.innerText = `Qualidade: ${resolucaoAmigavel[qualidade]}`;

      if (tentativas >= maxTentativas) clearInterval(interval);
    } else if (tentativas >= maxTentativas) {
      console.warn('⚠️ Falha ao definir qualidade após várias tentativas.');
      clearInterval(interval);
    }
  }, 1000);

  // Atualiza progresso do player
  setInterval(() => {
    if (player && player.getCurrentTime) {
      const cur = player.getCurrentTime(), dur = player.getDuration();
      if (dur > 0) {
        progressBar.value = (cur / dur) * 100;
        currentTimeDisplay.textContent = formatTime(cur);
        durationDisplay.textContent = formatTime(dur);
      }
    }
  }, 1000);

  // Handler de seek pela barras de progresso
  progressBar.addEventListener('input', () => {
    const dur = player.getDuration();
    player.seekTo((progressBar.value / 100) * dur, true);
  });
}

// Setup dos botões de controle
function setupControlButtons() {
  // Play/Pause
  document.querySelector('.control-button:nth-child(3)').addEventListener('click', function () {
    if (isPlaying) {
      player.pauseVideo();
      this.innerHTML = '<ion-icon name="play-circle-outline"></ion-icon>';
    } else {
      player.playVideo();
      this.innerHTML = '<ion-icon name="pause-circle-outline"></ion-icon>';
    }
    isPlaying = !isPlaying;
  });

  // Previous
  document.querySelector('.control-button:nth-child(2)').addEventListener('click', () => {
    player.previousVideo();
  });

  // Next / Shuffle
  document.querySelector('.control-button:nth-child(4)').addEventListener('click', () => {
    if (isShuffle) {
      const playlist = player.getPlaylist();
      const next = Math.floor(Math.random() * playlist.length);
      player.playVideoAt(next);
    } else {
      const idx = player.getPlaylistIndex();
      const len = player.getPlaylist().length;
      player.playVideoAt((idx + 1) % len);
    }
  });

  // Repeat/Shuffle/RepeatOne
  document.querySelector('.control-button:nth-child(1)').addEventListener('click', function () {
    switch (mode) {
      case 'repeat':
        mode = 'repeat_one';
        this.innerHTML = '<ion-icon name="repeat-outline"></ion-icon><span class="repeat-number">1</span>';
        break;
      case 'repeat_one':
        mode = 'shuffle'; isShuffle = true;
        this.innerHTML = '<ion-icon name="shuffle-outline"></ion-icon>';
        break;
      case 'shuffle':
        mode = 'repeat'; isShuffle = false;
        this.innerHTML = '<ion-icon name="repeat-outline"></ion-icon>';
        break;
    }
  });

  // Abre playlist
  document.querySelector('.control-button:nth-child(5)').addEventListener('click', () => {
    document.getElementById('playlist-overlay').style.display = 'flex';
    renderPlaylist(playlistData);
  });

  // Fecha overlay
  document.getElementById('close-playlist').addEventListener('click', () => {
    document.getElementById('playlist-overlay').style.display = 'none';
  });
}

// Main state change handler
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    document.querySelector('.control-button:nth-child(3)').innerHTML = '<ion-icon name="play-outline"></ion-icon>';
    isPlaying = false;
    switch (mode) {
      case 'repeat_one':
        player.seekTo(0); player.playVideo(); break;
      case 'shuffle':
        const list = player.getPlaylist();
        player.playVideoAt(Math.floor(Math.random() * list.length));
        break;
      case 'repeat':
        const idx = player.getPlaylistIndex(), len = player.getPlaylist().length;
        player.playVideoAt(idx === len - 1 ? 0 : idx + 1);
        break;
    }
  }
  if (event.data === YT.PlayerState.PLAYING) {
    atualizarQualidadeNaInterface();
  }
  updateTitleAndArtist();
}

// Atualiza título e artista
function updateTitleAndArtist() {
  const d = player.getVideoData();
  document.getElementById('title').textContent = d.title;
  document.getElementById('artist').textContent = d.author;
}

// Formata tempo em mm:ss
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// Obtém dados da playlist
async function fetchPlaylistData() {
  const ids = player.getPlaylist();
  playlistData = ids.map((id, i) => ({ videoId: id, index: i, title: '', author: '' }));
  for (let i = 0; i < playlistData.length; i++) {
    try {
      const res = await fetch(
        `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${playlistData[i].videoId}`
      );
      const json = await res.json();
      playlistData[i].title = json.title;
      playlistData[i].author = json.author_name;
    } catch (e) {
      console.error('Erro ao buscar detalhes:', e);
    }
  }
  renderPlaylist(playlistData);
}

// Exibe a playlist
function renderPlaylist(videos) {
  const c = document.getElementById('playlist-items');
  c.innerHTML = '';
  videos.forEach(v => {
    const li = document.createElement('li');
    const img = document.createElement('img');
    img.src = `https://img.youtube.com/vi/${v.videoId}/default.jpg`;
    li.appendChild(img);

    const txt = document.createElement('div');
    txt.classList.add('video-info');

    const t = document.createElement('p'); t.textContent = v.title;
    const a = document.createElement('span'); a.textContent = v.author;
    txt.append(t, a);
    li.appendChild(txt);

    li.addEventListener('click', () => {
      player.playVideoAt(v.index);
      document.getElementById('playlist-overlay').style.display = 'none';
    });
    c.appendChild(li);
  });
}

// Filtra a playlist no input de busca
document.getElementById('search-input').addEventListener('input', () => {
  const text = document.getElementById('search-input').value.trim().toLowerCase();
  const filtered = playlistData.filter(v =>
    (v.title || '').toLowerCase().includes(text) ||
    (v.author || '').toLowerCase().includes(text)
  );
  renderPlaylist(filtered);
});

// Compartilhamento
document.getElementById('share-icon').addEventListener('click', () => {
  const vid = player.getVideoData().video_id;
  const shareUrl = `https://lovesongsapp.github.io/?videoId=${vid}`;
  if (navigator.share) {
    navigator.share({ title: player.getVideoData().title, text: '🥰 LoveSongs: ' + player.getVideoData().title, url: shareUrl })
      .catch(e => console.error('Erro no share:', e));
  } else {
    alert(`🩷 Confira: ${player.getVideoData().title}\n${shareUrl}`);
  }
});

// Overlay de carregamento de playlist
const loadingOverlay = document.createElement('div');
loadingOverlay.id = 'loading-overlay';
loadingOverlay.style = `
  position:fixed; inset:0; background:rgba(0,0,0,0.85);
  color:#00FFBF; display:flex; justify-content:center; align-items:center;
  font-size:1.3rem; font-weight:600; z-index:9999;
  font-family:-apple-system,Segoe UI,Roboto,sans-serif;
  user-select:none; text-align:center; padding:1rem; line-height:1.4;
`;
loadingOverlay.innerText = '💖 Carregando playlist, aguarde um instante!';
document.body.appendChild(loadingOverlay);

// Polling para checar playlist e recarregar ou chamar fetch
function iniciarVerificacaoPlaylist() {
  const MAX_WAIT_TIME = 15000;
  const POLLING_INTERVAL = 500;
  let elapsedTime = 0;

  const pollingTimer = setInterval(() => {
    if (
      player &&
      typeof player.getPlaylist === 'function' &&
      Array.isArray(player.getPlaylist()) &&
      player.getPlaylist().length > 0
    ) {
      clearInterval(pollingTimer);
      loadingOverlay.remove();
      fetchPlaylistData();
      return;
    }

    elapsedTime += POLLING_INTERVAL;
    if (elapsedTime >= MAX_WAIT_TIME) {
      clearInterval(pollingTimer);
      console.warn('Playlist não carregou em tempo. Recarregando...');
      location.reload();
    }
  }, POLLING_INTERVAL);
}

