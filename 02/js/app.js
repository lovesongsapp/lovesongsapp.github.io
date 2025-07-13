// === Adaptado com suporte à YouTube Iframe API ===

// Inserir script da API do YouTube
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

// Corrige bug do postMessage do YouTube
(function () {
  const original = window.postMessage;
  window.postMessage = function (msg, origin, transfer) {
    if (typeof origin === 'string' && origin.includes('youtube.com')) {
      origin = '*';
    }
    return original.call(this, msg, origin, transfer);
  };
})();

// DOM elements
const $ = sel => document.querySelector(sel);
const playlistEl = $('#playlist');
const coverImg = $('#cover-img');
const videoTitle = $('#video-title');
const videoArtist = $('#video-artist');
const playBtn = $('#play-btn');
const mainPlayBtn = $('#main-play-btn');
const mainPlayIcon = $('#main-play-icon');
const prevBtn = $('#prev-btn');
const nextBtn = $('#next-btn');
const rewindBtn = $('#rewind-btn');
const forwardBtn = $('#forward-btn');
const iframeWrapper = $('#iframe-wrapper');
const ytIframe = $('#yt-iframe');
const progressBar = $('#progress-bar');
const progress = $('#progress');
const currentTimeEl = $('#current-time');
const durationEl = $('#duration');

let PLAYLIST = [];
let current = 0;
let playing = false;
let fakeCurrent = 0;
let fakeDuration = 180;

function getThumb(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function renderPlaylist() {
  playlistEl.innerHTML = '';
  PLAYLIST.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'playlist-item' + (i === current ? ' active' : '');
    div.onclick = () => selectVideo(i);
    div.innerHTML = `
      <img class="playlist-thumb" src="${getThumb(item.id)}" alt="Capa">
      <div class="playlist-info">
        <span class="playlist-title">${item.title}</span>
        <span class="playlist-artist">${item.artist}</span>
      </div>
    `;
    playlistEl.appendChild(div);
  });
}

function updateInfo() {
  const item = PLAYLIST[current];
  coverImg.src = getThumb(item.id);
  videoTitle.textContent = item.title;
  videoArtist.textContent = item.artist;
  renderPlaylist();
}

function selectVideo(idx) {
  current = idx;
  playing = false;
  fakeCurrent = 0;
  updateInfo();
  showCover();
}

function showCover() {
  iframeWrapper.style.display = 'none';
  coverImg.style.display = '';
  playBtn.style.display = '';
  mainPlayIcon.src = 'icons/play.svg';
  playing = false;
  resetProgress();
}

function playVideo() {
  const item = PLAYLIST[current];
  ytPlayer.playVideoAt(current);
  iframeWrapper.style.display = '';
  coverImg.style.display = 'none';
  playBtn.style.display = 'none';
  mainPlayIcon.src = 'icons/pause.svg';
  playing = true;
  fakeCurrent = 0;
  resetProgress();
}

function pauseVideo() {
  showCover();
}

function togglePlay() {
  if (playing) {
    pauseVideo();
  } else {
    playVideo();
  }
}

function prevVideo() {
  selectVideo((current - 1 + PLAYLIST.length) % PLAYLIST.length);
  playVideo();
}

function nextVideo() {
  selectVideo((current + 1) % PLAYLIST.length);
  playVideo();
}

function rewind() {
  fakeCurrent = Math.max(0, fakeCurrent - 10);
  updateProgress();
}

function forward() {
  fakeCurrent = Math.min(fakeDuration, fakeCurrent + 10);
  updateProgress();
}

function resetProgress() {
  fakeCurrent = 0;
  updateProgress();
}

function updateProgress() {
  currentTimeEl.textContent = formatTime(fakeCurrent);
  durationEl.textContent = formatTime(fakeDuration);
  progress.style.width = (fakeCurrent / fakeDuration * 100) + '%';
}

function formatTime(sec) {
  sec = Math.floor(sec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

progressBar.addEventListener('click', e => {
  const rect = progressBar.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const pct = x / rect.width;
  fakeCurrent = Math.floor(fakeDuration * pct);
  updateProgress();
});

playBtn.addEventListener('click', playVideo);
mainPlayBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevVideo);
nextBtn.addEventListener('click', nextVideo);
rewindBtn.addEventListener('click', rewind);
forwardBtn.addEventListener('click', forward);

let ytPlayer;

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('yt-iframe', {
    height: '100%',
    width: '100%',
    playerVars: {
      listType: 'playlist',
      list: 'PLX_YaKXOr1s6u6O3srDxVJn720Zi2RRC5',
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady() {
  iniciarVerificacaoPlaylist();
}

function onPlayerStateChange(e) {
  if (e.data === YT.PlayerState.ENDED) {
    nextVideo();
  }
  if (e.data === YT.PlayerState.PLAYING) {
    updateTitleAndArtist();
  }
}

function updateTitleAndArtist() {
  const d = ytPlayer.getVideoData();
  videoTitle.textContent = d.title;
  videoArtist.textContent = d.author;
}

async function fetchPlaylistData() {
  const ids = ytPlayer.getPlaylist();
  PLAYLIST = [];

  for (let i = 0; i < ids.length; i++) {
    try {
      const res = await fetch(
        `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${ids[i]}`
      );
      const json = await res.json();
      PLAYLIST.push({
        id: ids[i],
        title: json.title || `Vídeo ${i + 1}`,
        artist: json.author_name || 'Desconhecido'
      });
    } catch (e) {
      console.error('Erro ao buscar detalhes do vídeo:', e);
    }
  }
  renderPlaylist();
  updateInfo();
}

function iniciarVerificacaoPlaylist() {
  const MAX_WAIT_TIME = 15000;
  const POLLING_INTERVAL = 500;
  let elapsedTime = 0;

  const pollingTimer = setInterval(() => {
    if (
      ytPlayer &&
      typeof ytPlayer.getPlaylist === 'function' &&
      Array.isArray(ytPlayer.getPlaylist()) &&
      ytPlayer.getPlaylist().length > 0
    ) {
      clearInterval(pollingTimer);
      fetchPlaylistData();
      showCover();
      tick();
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

function tick() {
  if (playing) {
    fakeCurrent += 1;
    if (fakeCurrent >= fakeDuration) {
      fakeCurrent = 0;
      nextVideo();
    }
    updateProgress();
  }
  setTimeout(tick, 1000);
}
