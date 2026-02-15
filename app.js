// === Love Songs App – Versão Ultra-Estável para Mobile ===

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

// 1. SILENCIADOR DE ERROS (Protege o processador do celular)

// window.addEventListener('message', function(e) {
//  if (e.origin.includes('youtube.com') || e.origin.includes('google.com')) {
//    return; // Ignora mensagens de telemetria que causam erro de Target Origin
//  }
// }, { passive: true });

// 2. INICIALIZAÇÃO DA API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

document.addEventListener('DOMContentLoaded', () => {
  progressBar = document.getElementById('progress');
  currentTimeDisplay = document.getElementById('current-time');
  durationDisplay = document.getElementById('duration');
});

function onYouTubeIframeAPIReady() {
  criarPlayer();
}

function criarPlayer(startIndex = 0) {

  const originUrl = window.location.protocol + '//' + window.location.hostname;

  player = new YT.Player('music-player', {
    height: '100%',
    width: '100%',
    host: 'https://www.youtube-nocookie.com',
    playerVars: {
      origin: originUrl,
      enablejsapi: 1,
      listType: 'playlist',
      list: 'PLX_YaKXOr1s6u6O3srDxVJn720Zi2RRC5',
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3
    },
    events: {
      onReady: function () {
        if (startIndex > 0) {
          player.playVideoAt(startIndex);
        }
        onPlayerReady();
      },

      onStateChange: onPlayerStateChange,

      onError: function (e) {
        console.warn('YouTube Error:', e.data);

        const fatalErrors = [2, 5, 100, 101, 150];

        if (fatalErrors.includes(e.data)) {
          const currentIndex = player.getPlaylistIndex() || 0;

          setTimeout(() => {
            player.destroy();
            criarPlayer(currentIndex);
          }, 800);
        }
      }
    }
  });
}


// 3. FUNÇÕES DE CONTROLE
function onPlayerReady(event) {
  setupControlButtons();
  iniciarVerificacaoPlaylist();

  // Forçar qualidade uma única vez para não gerar loop de processamento
  if (qualityTimer) clearInterval(qualityTimer);
  qualityTimer = setInterval(() => {
    if (player && typeof player.setPlaybackQuality === 'function') {
      player.setPlaybackQuality('medium');
      const label = document.getElementById('quality-label');
      if (label) label.innerText = `Qualidade: 360p`;
      clearInterval(qualityTimer);
    }
  }, 3000);

  // Timer de progresso com trava de segurança
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
  } else {
    isPlaying = false;
  }

  if (event.data === YT.PlayerState.ENDED) {
    handleNextVideo();
  }
}

function handleNextVideo() {
  if (mode === 'repeat_one') {
    player.seekTo(0);
    player.playVideo();
  } else if (mode === 'shuffle') {
    const list = player.getPlaylist();
    if(list) player.playVideoAt(Math.floor(Math.random() * list.length));
  } else {
    player.nextVideo();
  }
}

// 4. PLAYLIST OTIMIZADA (Busca em lotes para não travar o celular)
async function fetchPlaylistData() {
  const ids = player.getPlaylist();
  if (!ids || ids.length === 0) return;
  
  playlistData = ids.map((id, i) => ({ videoId: id, index: i, title: 'Buscando...', author: '' }));

  const batchSize = 3; // Lote pequeno para celulares mais simples
  for (let i = 0; i < playlistData.length; i += batchSize) {
    const batch = playlistData.slice(i, i + batchSize);
    await Promise.all(batch.map(async (item, idx) => {
      try {
        const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${item.videoId}`);
        const json = await res.json();
        const rIdx = i + idx;
        playlistData[rIdx].title = json.title || "Love Song";
        playlistData[rIdx].author = json.author_name || "Love Songs App";
      } catch (e) { }
    }));
    await new Promise(r => setTimeout(r, 600)); // Respiro maior para a CPU
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

// 5. INTERFACE E UTILITÁRIOS
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
  const playBtn = document.querySelector('.control-button:nth-child(3)');
  if(playBtn) {
    playBtn.onclick = () => {
      if (isPlaying) {
        player.pauseVideo();
        playBtn.innerHTML = '<ion-icon name="play-circle-outline"></ion-icon>';
      } else {
        player.playVideo();
        playBtn.innerHTML = '<ion-icon name="pause-circle-outline"></ion-icon>';
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
    renderPlaylist(playlistData);
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

document.getElementById('search-input').oninput = (e) => {
  const txt = e.target.value.toLowerCase();
  renderPlaylist(playlistData.filter(v => v.title.toLowerCase().includes(txt)));
};

document.getElementById('share-icon').onclick = () => {
  const vid = player.getVideoData().video_id;
  const url = `https://lovesongsapp.github.io/?videoId=${vid}`;
  if (navigator.share) navigator.share({ title: 'LoveSongs App', url });
};


