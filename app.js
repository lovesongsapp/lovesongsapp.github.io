// === Love Songs App – Código Final Corrigido (Anti-Crash) ===

// Variáveis globais
let player, progressBar, currentTimeDisplay, durationDisplay;
let isPlaying = false, isShuffle = false;
let mode = 'repeat';
let playlistData = [];
let sharedVideoId = null;
let qualidade = '';

// Timers globais para evitar duplicidade e vazamento de memória
let progressTimer = null;
let qualityTimer = null;

const resolucaoAmigavel = {
  tiny: '144p', small: '240p', medium: '360p', large: '480p',
  hd720: '720p', hd1080: '1080p', highres: '1080p+', default: 'Desconhecida'
};

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

function atualizarQualidadeNaInterface() {
  if (player && typeof player.getPlaybackQuality === 'function') {
    const qualidadeAtual = player.getPlaybackQuality();
    const label = document.getElementById('quality-label');
    if (label) {
      const resolucao = resolucaoAmigavel[qualidadeAtual] || resolucaoAmigavel.default;
      label.innerText = `Qualidade: ${resolucao}`;
    }
  }
}

function onPlayerReady(event) {
  qualidade = 'medium';
  setupControlButtons();
  iniciarVerificacaoPlaylist();

  // Limpa timers antigos para evitar acúmulo de processamento (Causa do crash)
  if (qualityTimer) clearInterval(qualityTimer);
  if (progressTimer) clearInterval(progressTimer);

  let tentativas = 0;
  qualityTimer = setInterval(() => {
    tentativas++;
    if (player && typeof player.setPlaybackQuality === 'function') {
      player.setPlaybackQuality(qualidade);
      const label = document.getElementById('quality-label');
      if (label) label.innerText = `Qualidade: ${resolucaoAmigavel[qualidade]}`;
      if (tentativas >= 5) clearInterval(qualityTimer);
    } else if (tentativas >= 5) clearInterval(qualityTimer);
  }, 2000);

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
    player.seekTo((progressBar.value / 100) * dur, true);
  });
}

function setupControlButtons() {
  const playBtn = document.querySelector('.control-button:nth-child(3)');
  playBtn.addEventListener('click', function () {
    if (isPlaying) {
      player.pauseVideo();
      this.innerHTML = '<ion-icon name="play-circle-outline" class="play-outline"></ion-icon>';
    } else {
      player.playVideo();
      this.innerHTML = '<ion-icon name="pause-circle-outline" class="pause-outline"></ion-icon>';
    }
    isPlaying = !isPlaying;
  });

  document.querySelector('.control-button:nth-child(2)').addEventListener('click', () => player.previousVideo());

  document.querySelector('.control-button:nth-child(4)').addEventListener('click', () => {
    if (isShuffle) {
      const playlist = player.getPlaylist();
      player.playVideoAt(Math.floor(Math.random() * playlist.length));
    } else {
      player.nextVideo();
    }
  });

  document.querySelector('.control-button:nth-child(1)').addEventListener('click', function () {
    switch (mode) {
      case 'repeat': mode = 'repeat_one'; this.innerHTML = '<ion-icon name="repeat-outline"></ion-icon><span class="repeat-number">1</span>'; break;
      case 'repeat_one': mode = 'shuffle'; isShuffle = true; this.innerHTML = '<ion-icon name="shuffle-outline"></ion-icon>'; break;
      case 'shuffle': mode = 'repeat'; isShuffle = false; this.innerHTML = '<ion-icon name="repeat-outline"></ion-icon>'; break;
    }
  });

  document.querySelector('.control-button:nth-child(5)').addEventListener('click', () => {
    document.getElementById('playlist-overlay').style.display = 'flex';
    renderPlaylist(playlistData);
  });

  document.getElementById('close-playlist').addEventListener('click', () => {
    document.getElementById('playlist-overlay').style.display = 'none';
  });
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    isPlaying = false;
    switch (mode) {
      case 'repeat_one': player.seekTo(0); player.playVideo(); break;
      case 'shuffle': 
        const list = player.getPlaylist();
        player.playVideoAt(Math.floor(Math.random() * list.length));
        break;
      case 'repeat': player.nextVideo(); break;
    }
  }
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    atualizarQualidadeNaInterface();
    updateTitleAndArtist();
  }
}

function updateTitleAndArtist() {
  const d = player.getVideoData();
  if (d) {
    document.getElementById('title').textContent = d.title || "Carregando...";
    document.getElementById('artist').textContent = d.author || "";
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

async function fetchPlaylistData() {
  const ids = player.getPlaylist();
  if (!ids) return;
  
  playlistData = ids.map((id, i) => ({ videoId: id, index: i, title: 'Carregando...', author: '' }));
  renderPlaylist(playlistData);

  // Busca detalhes em lotes para não estourar a memória (Causa principal do erro 3:04)
  for (let i = 0; i < playlistData.length; i++) {
    try {
      if (i % 5 === 0) await new Promise(r => setTimeout(r, 600)); 
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${playlistData[i].videoId}`);
      const json = await res.json();
      playlistData[i].title = json.title;
      playlistData[i].author = json.author_name;
      
      if (i % 10 === 0 || i === playlistData.length - 1) renderPlaylist(playlistData);
    } catch (e) {
      console.error('Erro ao buscar detalhes:', e);
    }
  }
}

function renderPlaylist(videos) {
  const c = document.getElementById('playlist-items');
  if (!c) return;
  c.innerHTML = '';
  videos.forEach(v => {
    const li = document.createElement('li');
    li.innerHTML = `
      <img src="https://img.youtube.com/vi/${v.videoId}/default.jpg">
      <div class="video-info">
        <p>${v.title}</p>
        <span>${v.author}</span>
      </div>
    `;
    li.addEventListener('click', () => {
      player.playVideoAt(v.index);
      document.getElementById('playlist-overlay').style.display = 'none';
    });
    c.appendChild(li);
  });
}

document.getElementById('search-input').addEventListener('input', () => {
  const text = document.getElementById('search-input').value.trim().toLowerCase();
  const filtered = playlistData.filter(v => 
    v.title.toLowerCase().includes(text) || v.author.toLowerCase().includes(text)
  );
  renderPlaylist(filtered);
});

document.getElementById('share-icon').addEventListener('click', () => {
  const vid = player.getVideoData().video_id;
  const shareUrl = `https://lovesongsapp.github.io/?videoId=${vid}`;
  if (navigator.share) {
    navigator.share({ title: 'LoveSongs App', url: shareUrl });
  } else {
    alert(`Link: ${shareUrl}`);
  }
});

const loadingOverlay = document.createElement('div');
loadingOverlay.id = 'loading-overlay';
loadingOverlay.style = "position:fixed; inset:0; background:rgba(0,0,0,0.85); color:#00FFBF; display:flex; justify-content:center; align-items:center; font-size:1.3rem; z-index:9999; text-align:center; padding:1rem;";
loadingOverlay.innerText = '💖 Carregando playlist...';
document.body.appendChild(loadingOverlay);

function iniciarVerificacaoPlaylist() {
  let elapsedTime = 0;
  const pollingTimer = setInterval(() => {
    if (player && typeof player.getPlaylist === 'function' && player.getPlaylist()) {
      clearInterval(pollingTimer);
      if(document.getElementById('loading-overlay')) loadingOverlay.remove();
      fetchPlaylistData();
    } else {
      elapsedTime += 500;
      if (elapsedTime >= 15000) {
        clearInterval(pollingTimer);
        location.reload();
      }
    }
  }, 500);
}

