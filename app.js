// === Love Songs App – Código Final Blindado (Anti-Crash) ===

let player, progressBar, currentTimeDisplay, durationDisplay;
let isPlaying = false, isShuffle = false;
let mode = 'repeat';
let playlistData = [];
let progressTimer = null;
let qualityTimer = null;

const resolucaoAmigavel = {
  tiny: '144p', small: '240p', medium: '360p', large: '480p',
  hd720: '720p', hd1080: '1080p', highres: '1080p+', default: '360p'
};

// 1. Inicialização da API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

document.addEventListener('DOMContentLoaded', () => {
  progressBar = document.getElementById('progress');
  currentTimeDisplay = document.getElementById('current-time');
  durationDisplay = document.getElementById('duration');
});

function onYouTubeIframeAPIReady() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('videoId') || 'eT5_neXR3FI';
  const originUrl = window.location.origin.replace(/\/$/, "");

  player = new YT.Player('music-player', {
    height: '100%', width: '100%', videoId,
    playerVars: {
      'origin': originUrl,
      'enablejsapi': 1,
      'widget_referrer': originUrl,
      'listType': 'playlist',
      'list': 'PLX_YaKXOr1s6u6O3srDxVJn720Zi2RRC5',
      'autoplay': 0, 'controls': 0, 'iv_load_policy': 3,
      'modestbranding': 1, 'rel': 0, 'disablekb': 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// 2. Funções de Controle do Player
function onPlayerReady(event) {
  setupControlButtons();
  iniciarVerificacaoPlaylist();

  if (qualityTimer) clearInterval(qualityTimer);
  qualityTimer = setInterval(() => {
    if (player && typeof player.setPlaybackQuality === 'function') {
      player.setPlaybackQuality('medium');
      const label = document.getElementById('quality-label');
      if (label) label.innerText = `Qualidade: 360p`;
      clearInterval(qualityTimer);
    }
  }, 2000);

  if (progressTimer) clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    if (player && typeof player.getCurrentTime === 'function' && isPlaying) {
      const cur = player.getCurrentTime(), dur = player.getDuration();
      if (dur > 0) {
        progressBar.value = (cur / dur) * 100;
        currentTimeDisplay.textContent = formatTime(cur);
        durationDisplay.textContent = formatTime(dur);
      }
    }
  }, 1000);

  progressBar.addEventListener('input', () => {
    const dur = player.getDuration();
    if (dur > 0) player.seekTo((progressBar.value / 100) * dur, true);
  });
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    updateTitleAndArtist();
  } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
    isPlaying = false;
  }

  if (event.data === YT.PlayerState.ENDED) {
    handleVideoEnd();
  }
}

function handleVideoEnd() {
  switch (mode) {
    case 'repeat_one': player.seekTo(0); player.playVideo(); break;
    case 'shuffle': 
      const list = player.getPlaylist();
      player.playVideoAt(Math.floor(Math.random() * list.length));
      break;
    case 'repeat': player.nextVideo(); break;
  }
}

// 3. Gestão Inteligente da Playlist (O segredo anti-trava)
async function fetchPlaylistData() {
  const ids = player.getPlaylist();
  if (!ids || ids.length === 0) return;
  
  playlistData = ids.map((id, i) => ({ videoId: id, index: i, title: 'Buscando título...', author: '' }));

  // Processa em lotes para não sufocar a CPU do celular
  const batchSize = 4; 
  for (let i = 0; i < playlistData.length; i += batchSize) {
    const currentBatch = playlistData.slice(i, i + batchSize);
    await Promise.all(currentBatch.map(async (item, idx) => {
      try {
        const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${item.videoId}`);
        const json = await res.json();
        const realIdx = i + idx;
        playlistData[realIdx].title = json.title || "Música Love Songs";
        playlistData[realIdx].author = json.author_name || "Love Songs App";
      } catch (e) { console.warn("Erro ao buscar metadados."); }
    }));
    // Pausa técnica para o navegador respirar
    await new Promise(r => setTimeout(r, 400));
  }
  renderPlaylist(playlistData);
}

function renderPlaylist(videos) {
  const container = document.getElementById('playlist-items');
  if (!container) return;
  
  const fragment = document.createDocumentFragment();
  videos.forEach(v => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="https://img.youtube.com/vi/${v.videoId}/default.jpg" loading="lazy">
      <div class="video-info"><p>${v.title}</p><span>${v.author}</span></div>
    `;
    li.onclick = () => {
      player.playVideoAt(v.index);
      document.getElementById('playlist-overlay').style.display = 'none';
    };
    fragment.appendChild(li);
  });
  container.innerHTML = '';
  container.appendChild(fragment);
}

// 4. Utilidades e Interface
function updateTitleAndArtist() {
  const d = player.getVideoData();
  if (d && d.title) {
    document.getElementById('title').textContent = d.title;
    document.getElementById('artist').textContent = d.author;
  }
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

function setupControlButtons() {
  // Play/Pause - Seleção simplificada
  const playBtn = document.querySelector('.control-button:nth-child(3)');
  if(playBtn) {
    playBtn.onclick = () => {
      if (isPlaying) {
        player.pauseVideo();
        playBtn.innerHTML = '<ion-icon name="play-circle-outline" class="play-outline"></ion-icon>';
      } else {
        player.playVideo();
        playBtn.innerHTML = '<ion-icon name="pause-circle-outline" class="pause-outline"></ion-icon>';
      }
    };
  }

  document.querySelector('.control-button:nth-child(2)').onclick = () => player.previousVideo();
  document.querySelector('.control-button:nth-child(4)').onclick = () => player.nextVideo();

  const modeBtn = document.querySelector('.control-button:nth-child(1)');
  modeBtn.onclick = () => {
    if (mode === 'repeat') { mode = 'repeat_one'; modeBtn.innerHTML = '<ion-icon name="repeat-outline"></ion-icon><span class="repeat-number">1</span>'; }
    else if (mode === 'repeat_one') { mode = 'shuffle'; isShuffle = true; modeBtn.innerHTML = '<ion-icon name="shuffle-outline"></ion-icon>'; }
    else { mode = 'repeat'; isShuffle = false; modeBtn.innerHTML = '<ion-icon name="repeat-outline"></ion-icon>'; }
  };

  document.querySelector('.control-button:nth-child(5)').onclick = () => {
    document.getElementById('playlist-overlay').style.display = 'flex';
    if (playlistData.length > 0) renderPlaylist(playlistData);
  };

  document.getElementById('close-playlist').onclick = () => document.getElementById('playlist-overlay').style.display = 'none';
}

function iniciarVerificacaoPlaylist() {
  let elapsed = 0;
  const timer = setInterval(() => {
    if (player && typeof player.getPlaylist === 'function' && player.getPlaylist()) {
      clearInterval(timer);
      const loader = document.getElementById('loading-overlay');
      if (loader) loader.remove();
      fetchPlaylistData();
    } else if ((elapsed += 500) >= 15000) {
      clearInterval(timer);
      location.reload();
    }
  }, 500);
}

// Busca simples
document.getElementById('search-input').oninput = (e) => {
  const txt = e.target.value.toLowerCase();
  renderPlaylist(playlistData.filter(v => v.title.toLowerCase().includes(txt) || v.author.toLowerCase().includes(txt)));
};

// Compartilhar
document.getElementById('share-icon').onclick = () => {
  const vid = player.getVideoData().video_id;
  const url = `https://lovesongsapp.github.io/?videoId=${vid}`;
  if (navigator.share) navigator.share({ title: 'LoveSongs App', url });
  else alert("Copiado: " + url);
};
