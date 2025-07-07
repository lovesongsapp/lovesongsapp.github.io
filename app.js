// Versão ajustada do app.js (controle de qualidade seguro removendo erros no console)
let player, progressBar, currentTimeDisplay, durationDisplay;
let isPlaying = false;
let isShuffle = false;
let mode = 'repeat';
let playlistData = [];
let sharedVideoId = null;
let qualidade = '';
// Carregar a API do YouTube de forma correta
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);
// Fix para evitar erro postMessage com o YouTube
(function() {
  const originalPostMessage = window.postMessage;
  window.postMessage = function(message, targetOrigin, transfer) {
    if (typeof targetOrigin === 'string' && targetOrigin.includes('youtube.com')) {
      targetOrigin = '*';
    }
    return originalPostMessage.call(this, message, targetOrigin, transfer);
  };
})();

// Espera o DOM ficar pronto para capturar elementos
document.addEventListener('DOMContentLoaded', function () {
    progressBar = document.getElementById('progress');
    currentTimeDisplay = document.getElementById('current-time');
    durationDisplay = document.getElementById('duration');

    if (!progressBar || !currentTimeDisplay || !durationDisplay) {
        console.error('Um ou mais elementos DOM não foram encontrados.');
    }
});

// Esta função será chamada automaticamente quando a API estiver pronta
function onYouTubeIframeAPIReady() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('videoId') || '1OgQdgSQB3o';

    player = new YT.Player('music-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'listType': 'playlist',
            'list': 'PLX_YaKXOr1s6u6O3srDxVJn720Zi2RRC5',
            'autoplay': 0,
            'controls': 0,
            'iv_load_policy': 3,
            'modestbranding': 1,
            'rel': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    // Tentativa segura de definir a qualidade sem causar erro no console
    function tentarDefinirQualidade() {
  qualidade = window.innerWidth < 768 ? 'small' : 'medium';

  const checkInterval = setInterval(() => {
    if (player && typeof player.setPlaybackQuality === 'function') {
      try {
        player.setPlaybackQuality(qualidade);
        console.log(`Qualidade definida para: ${qualidade}`);

        const qualityLabel = document.getElementById('quality-label');
        if (qualityLabel) {
          qualityLabel.innerText = `Qualidade: ${qualidade.toUpperCase()}`;
        }

        clearInterval(checkInterval);
      } catch (e) {
        console.warn('Erro ao definir qualidade:', e);
      }
    }
  }, 500);
      
};
    tentarDefinirQualidade();
    setupControlButtons();

    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('dark-mode');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const themeToggleIcon = document.querySelector('#theme-toggle ion-icon');
    if (metaThemeColor) metaThemeColor.setAttribute('content', '#13051f');
    if (themeToggleIcon) themeToggleIcon.setAttribute('name', 'sunny-outline');

    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) toggleButton.style.display = 'none';

    setInterval(() => {
        if (player && player.getCurrentTime) {
            const currentTime = player.getCurrentTime();
            const duration = player.getDuration();
            if (duration > 0) {
                progressBar.value = (currentTime / duration) * 100;
                currentTimeDisplay.textContent = formatTime(currentTime);
                durationDisplay.textContent = formatTime(duration);
            }
        }
    }, 1000);

    progressBar.addEventListener('input', function () {
        const duration = player.getDuration();
        player.seekTo((progressBar.value / 100) * duration, true);
    });

    // Aguarda até que player.getPlaylist esteja disponível e retorne uma lista válida
    const waitForPlaylist = setInterval(() => {
        if (
            player &&
            typeof player.getPlaylist === 'function' &&
            Array.isArray(player.getPlaylist()) &&
            player.getPlaylist().length > 0
        ) {
            clearInterval(waitForPlaylist);
            fetchPlaylistData();
        }
    }, 200);
}
// Resto do código permanece exatamente como estava (sem alterações)
function setupControlButtons() {
    document.querySelector('.control-button:nth-child(3)').addEventListener('click', function () {
        if (isPlaying) {
            player.pauseVideo();
            this.innerHTML = '<ion-icon name="play-circle-outline" class="play-outline"></ion-icon>';
        } else {
            player.playVideo();
            this.innerHTML = '<ion-icon name="pause-circle-outline" class="pause-outline"></ion-icon>';
        }
        isPlaying = !isPlaying;
    });

    document.querySelector('.control-button:nth-child(2)').addEventListener('click', function () {
        player.previousVideo();
    });

    document.querySelector('.control-button:nth-child(4)').addEventListener('click', function () {
        if (isShuffle) {
            const playlist = player.getPlaylist();
            const nextIndex = Math.floor(Math.random() * playlist.length);
            player.playVideoAt(nextIndex);
        } else {
            const currentIndex = player.getPlaylistIndex();
            const playlistLength = player.getPlaylist().length;
            const nextIndex = (currentIndex + 1) % playlistLength;
            player.playVideoAt(nextIndex);
        }
    });

    document.querySelector('.control-button:nth-child(1)').addEventListener('click', function () {
        switch (mode) {
            case 'repeat':
                mode = 'repeat_one';
                this.innerHTML = '<ion-icon name="repeat-outline"></ion-icon><span class="repeat-number">1</span>';
                break;
            case 'repeat_one':
                mode = 'shuffle';
                this.innerHTML = '<ion-icon name="shuffle-outline"></ion-icon>';
                isShuffle = true;
                break;
            case 'shuffle':
                mode = 'repeat';
                this.innerHTML = '<ion-icon name="repeat-outline"></ion-icon>';
                isShuffle = false;
                break;
        }
    });

    document.querySelector('.control-button:nth-child(5)').addEventListener('click', function () {
        document.getElementById('playlist-overlay').style.display = 'flex';
        renderPlaylist(playlistData);
    });

    document.getElementById('close-playlist').addEventListener('click', function () {
        document.getElementById('playlist-overlay').style.display = 'none';
    });
}

// Corrigido: encapsular o bloco dentro da função de evento
function onPlayerStateChange(event) {
    // Resto do código existente para tratamento do final do vídeo
    if (event.data === YT.PlayerState.ENDED) {
        document.querySelector('.control-button:nth-child(3)').innerHTML = '<ion-icon name="play-outline"></ion-icon>';
        isPlaying = false;

        switch (mode) {
            case 'repeat_one':
                player.seekTo(0);
                player.playVideo();
                break;
            case 'shuffle':
                const playlist = player.getPlaylist();
                const nextIndex = Math.floor(Math.random() * playlist.length);
                player.playVideoAt(nextIndex);
                break;
            case 'repeat':
                const currentIndex = player.getPlaylistIndex();
                if (currentIndex === player.getPlaylist().length - 1) {
                    player.playVideoAt(0);
                } else {
                    player.nextVideo();
                }
                break;
        }
    }

    updateTitleAndArtist();
}

function updateTitleAndArtist() {
    const videoData = player.getVideoData();
    document.getElementById('title').textContent = videoData.title;
    document.getElementById('artist').textContent = videoData.author;
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

async function fetchPlaylistData() {
    const playlist = player.getPlaylist();
    playlistData = playlist.map((videoId, index) => ({
        videoId,
        index,
        title: '',
        author: ''
    }));

    for (let i = 0; i < playlistData.length; i++) {
        const videoId = playlistData[i].videoId;
        try {
            const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
            const data = await response.json();
            playlistData[i].title = data.title;
            playlistData[i].author = data.author_name;
        } catch (error) {
            console.error('Erro ao buscar detalhes do vídeo:', error);
        }
    }

    renderPlaylist(playlistData);
}

function renderPlaylist(videos) {
    const playlistContainer = document.getElementById('playlist-items');
    playlistContainer.innerHTML = '';

    videos.forEach(video => {
        const listItem = document.createElement('li');
        const thumbnail = document.createElement('img');
        thumbnail.src = `https://img.youtube.com/vi/${video.videoId}/default.jpg`;
        listItem.appendChild(thumbnail);

        const textContainer = document.createElement('div');
        textContainer.classList.add('video-info');

        const title = document.createElement('p');
        title.textContent = video.title;

        const author = document.createElement('span');
        author.textContent = video.author;

        textContainer.appendChild(title);
        textContainer.appendChild(author);
        listItem.appendChild(textContainer);

        listItem.addEventListener('click', () => {
            player.playVideoAt(video.index);
            document.getElementById('playlist-overlay').style.display = 'none';
        });

        playlistContainer.appendChild(listItem);
    });
}
// Renderiza a playlist completa ao carregar a página
renderPlaylist(playlistData);

// Função para filtrar a playlist
function filterPlaylist(searchText) {
    return playlistData.filter(video => {
        const titleMatch = video.title && video.title.toLowerCase().includes(searchText);
        const authorMatch = video.author && video.author.toLowerCase().includes(searchText);
        return titleMatch || authorMatch;
    });
}

// Configuração da busca
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', () => {
    const searchText = searchInput.value.trim().toLowerCase();
    const filteredPlaylist = filterPlaylist(searchText);
    renderPlaylist(filteredPlaylist);
});
// Compartilhamento
document.getElementById('share-icon').addEventListener('click', function() {
    const videoData = player.getVideoData();
    const videoId = videoData.video_id;
    const shareUrl = `https://lovesongsapp.github.io/?videoId=${videoId}`;

    if (navigator.share) {
        navigator.share({
            title: videoData.title,
            text: `🥰 LoveSongs: ${videoData.title}`,
            url: shareUrl,
        }).then(() => {
            console.log('Compartilhamento bem-sucedido');
        }).catch((error) => {
            console.error('Erro ao compartilhar:', error);
        });
    } else {
        // Fallback para navegadores que não suportam a API de compartilhamento
        alert(`🩷💚 Confira este vídeo: ${videoData.title}\n${shareUrl}`);
    }
});
/* === CORREÇÃO DA ATUALIZAÇÃO DA PLAYLIST - DEV PROMPT WC™ ===

   Este trecho exibe um overlay de carregamento até a playlist estar disponível,
   evitando erros e frustrações do usuário.
   Se a playlist não carregar em 15 segundos, a página é recarregada automaticamente.
*/

// Cria e insere o overlay no DOM
const loadingOverlay = document.createElement('div');
loadingOverlay.id = 'loading-overlay';
loadingOverlay.style = `
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  color: #f76700;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 600;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  user-select: none;
  text-align: center;
  padding: 1rem;
  line-height: 1.4;
`;
loadingOverlay.innerText = '🎧 Carregando a playlist do amor... aguarde só um instante! 💖';
document.body.appendChild(loadingOverlay);

// Tempo máximo de espera (ms)
const MAX_WAIT_TIME = 15000;
let elapsedTime = 0;
const POLLING_INTERVAL = 500;

// Função que verifica se a playlist já está carregada e válida
function checkPlaylistReady() {
  if (
    player &&
    typeof player.getPlaylist === 'function' &&
    Array.isArray(player.getPlaylist()) &&
    player.getPlaylist().length > 0
  ) {
    // Playlist pronta! Remove overlay e para o polling
    loadingOverlay.remove();
    clearInterval(pollingTimer);
    // Aqui pode chamar fetchPlaylistData() se quiser garantir
    fetchPlaylistData();
    return true;
  }
  return false;
}

// Polling periódico para checar playlist
const pollingTimer = setInterval(() => {
  elapsedTime += POLLING_INTERVAL;

  if (checkPlaylistReady()) return;

  if (elapsedTime >= MAX_WAIT_TIME) {
    clearInterval(pollingTimer);
    // Timeout: recarrega a página automaticamente para tentar corrigir o problema
    console.warn('Playlist não carregou em tempo. Recarregando a página...');
    location.reload();
  }
}, POLLING_INTERVAL);
