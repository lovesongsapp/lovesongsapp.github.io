
let player;
let maxQuality = 'large'; // Definir resolução máxima
let minQuality = 'medium'; // Definir resolução mínima
let isPlaying = false;
let isShuffle = false;
let mode = 'repeat'; // 'repeat', 'repeat_one', 'shuffle'
let progressBar, currentTimeDisplay, durationDisplay;
let playlistData = [];
let sharedVideoId = null;

function setVideoQuality(quality) {
    player.setPlaybackQuality(quality);
}

document.addEventListener('DOMContentLoaded', function() {
    progressBar = document.getElementById('progress');
    currentTimeDisplay = document.getElementById('current-time');
    durationDisplay = document.getElementById('duration');
    
    // Verifique se todos os elementos DOM necessários estão presentes
    if (progressBar && currentTimeDisplay && durationDisplay) {
        onYouTubeIframeAPIReady();
    } else {
        console.error('Um ou mais elementos DOM não foram encontrados.');
    }
});

function onYouTubeIframeAPIReady() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('videoId') || 'xiN4EOqpvwc'; // ID padrão caso não haja um na URL

    player = new YT.Player('music-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            listType: 'playlist',
            list: 'PLX_YaKXOr1s6u6O3srDxVJn720Zi2RRC5',
            autoplay: 0,
            controls: 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    setVideoQuality(minQuality); // Define a qualidade inicial para 'medium'
    setupControlButtons();

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

    progressBar.addEventListener('input', function() {
        const duration = player.getDuration();
        player.seekTo((progressBar.value / 100) * duration, true);
    });

    const savedTheme = localStorage.getItem('theme');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        document.getElementById('theme-toggle').innerHTML = savedTheme === 'dark' ? '<ion-icon name="sunny-outline"></ion-icon>' : '<ion-icon name="moon-outline"></ion-icon>';
        metaThemeColor.setAttribute('content', savedTheme === 'dark' ? '#13051f' : '#f0f4f9');
    } else {
        // Apply dark theme by default
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<ion-icon name="sunny-outline"></ion-icon>';
        metaThemeColor.setAttribute('content', '#13051f');
        localStorage.setItem('theme', 'dark');
    }

    document.getElementById('theme-toggle').addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            document.body.classList.remove('dark-mode');
            this.innerHTML = '<ion-icon name="moon-outline"></ion-icon>';
            metaThemeColor.setAttribute('content', '#f0f4f9');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.add('dark-mode');
            this.innerHTML = '<ion-icon name="sunny-outline"></ion-icon>';
            metaThemeColor.setAttribute('content', '#13051f');
            localStorage.setItem('theme', 'dark');
        }
    });

    fetchPlaylistData();
}

function setupControlButtons() {
    document.querySelector('.control-button:nth-child(3)').addEventListener('click', function() {
        if (isPlaying) {
            player.pauseVideo();
            this.innerHTML = '<ion-icon name="play-circle-outline" class="play-outline"></ion-icon>';
        } else {
            player.playVideo();
            this.innerHTML = '<ion-icon name="pause-circle-outline" class="pause-outline"></ion-icon>';
        }
        isPlaying = !isPlaying;
    });

    document.querySelector('.control-button:nth-child(2)').addEventListener('click', function() {
        player.previousVideo();
    });

    document.querySelector('.control-button:nth-child(4)').addEventListener('click', function() {
        player.nextVideo();
    });

    document.querySelector('.control-button:nth-child(1)').addEventListener('click', function() {
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

    document.querySelector('.control-button:nth-child(5)').addEventListener('click', function() {
        document.getElementById('playlist-overlay').style.display = 'flex';
        renderPlaylist(playlistData);
    });

    document.getElementById('close-playlist').addEventListener('click', function() {
        document.getElementById('playlist-overlay').style.display = 'none';
    });
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
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
            console.error('Error fetching video details:', error);
        }
    }

    renderPlaylist(playlistData);
}

function renderPlaylist(playlist) {
    const playlistContainer = document.getElementById('playlist-items');
    playlistContainer.innerHTML = '';

    playlist.forEach(video => {
        const listItem = document.createElement('li');

        const thumbnail = document.createElement('img');
        thumbnail.src = `https://img.youtube.com/vi/${video.videoId}/default.jpg`;
        listItem.appendChild(thumbnail);

        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';

        const titleText = document.createElement('span');
        titleText.className = 'title';
        titleText.textContent = video.title;
        textContainer.appendChild(titleText);

        const authorText = document.createElement('span');
        authorText.className = 'author';
        authorText.textContent = video.author;
        textContainer.appendChild(authorText);

        listItem.appendChild(textContainer);

        listItem.addEventListener('click', () => {
            if (isShuffle) {
                // Encontrar o índice correspondente ao vídeo clicado na lista original
                const originalIndex = playlistData.findIndex(item => item.videoId === video.videoId);
                player.playVideoAt(originalIndex);
            } else {
                player.playVideoAt(video.index);
            }
            document.getElementById('playlist-overlay').style.display = 'none';
        });

        playlistContainer.appendChild(listItem);
    });
}
// BUSCA CONFIG

// Adicione o evento de keyup ao input de texto
document.getElementById('search-input').addEventListener('keyup', function(event) {
    const searchText = event.target.value.toLowerCase();
    const filteredPlaylist = filterPlaylist(searchText);
    renderPlaylist(filteredPlaylist);
});

// Crie a função que filtre a playlist
function filterPlaylist(searchText) {
    return playlistData.filter(video => video.title.toLowerCase().includes(searchText) || video.author.toLowerCase().includes(searchText));
}

// SHARE CONFIG

document.getElementById('share-icon').addEventListener('click', async function() {
    const videoData = player.getVideoData();
    const videoId = videoData.video_id;
    const longUrl = `https://lovesongsapp.github.io/?videoId=${videoId}`;
    const bitlyToken = '742eae33655dde134a9502bfcd95bc121f5d84e6'; // Substitua pelo seu token de acesso do Bitly

    try {
        const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${bitlyToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                long_url: longUrl
            })
        });

        const data = await response.json();
        const shareUrl = data.link;

        if (navigator.share) {
            navigator.share({
                title: videoData.title,
                text: `Permita que essa música toque sua alma! Confira este vídeo: ${videoData.title}`,
                url: shareUrl,
            }).then(() => {
                console.log('Compartilhamento bem-sucedido');
            }).catch((error) => {
                console.error('Erro ao compartilhar:', error);
            });
        } else {
            // Fallback para navegadores que não suportam a API de compartilhamento
            alert(`Permita que essa música toque sua alma! Confira este vídeo: ${videoData.title}\n${shareUrl}`);
        }
    } catch (error) {
        console.error('Erro ao encurtar a URL:', error);
    }
});

///

// Inicialização do Firebase e verificação de autenticação
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Verificação de autenticação do usuário
function checkAuth() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Usuário está autenticado, continuar com a configuração do player
      initializePlayer();
    } else {
      // Usuário não está autenticado, redirecionar para a página de login
      window.location.href = 'login/login.html';
    }
  });
}

// Inicializar o player somente se o usuário estiver autenticado
function initializePlayer() {
  let player;
  let maxQuality = 'large'; // Definir resolução máxima
  let minQuality = 'medium'; // Definir resolução mínima
  let isPlaying = false;
  let isShuffle = false;
  let mode = 'repeat'; // 'repeat', 'repeat_one', 'shuffle'
  let progressBar, currentTimeDisplay, durationDisplay;
  let playlistData = [];
  let sharedVideoId = null;

  function setVideoQuality(quality) {
    player.setPlaybackQuality(quality);
  }

  document.addEventListener('DOMContentLoaded', function() {
    progressBar = document.getElementById('progress');
    currentTimeDisplay = document.getElementById('current-time');
    durationDisplay = document.getElementById('duration');
    
    // Verifique se todos os elementos DOM necessários estão presentes
    if (progressBar && currentTimeDisplay && durationDisplay) {
      onYouTubeIframeAPIReady();
    } else {
      console.error('Um ou mais elementos DOM não foram encontrados.');
    }
  });

  function onYouTubeIframeAPIReady() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('videoId') || 'xiN4EOqpvwc'; // ID padrão caso não haja um na URL

    player = new YT.Player('music-player', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        enablejsapi: 1,
        modestbranding: 1,
        fs: 0,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onPlaybackQualityChange: onPlaybackQualityChange,
        onError: onPlayerError
      }
    });

    // Define a qualidade do vídeo ao carregar o vídeo
    player.addEventListener('onReady', function() {
      player.setPlaybackQuality(minQuality);
    });

    document.getElementById('play-button').addEventListener('click', togglePlayPause);
    document.getElementById('next-button').addEventListener('click', playNextVideo);
    document.getElementById('prev-button').addEventListener('click', playPreviousVideo);
    document.getElementById('share-button').addEventListener('click', shareVideo);
    document.getElementById('shuffle-button').addEventListener('click', toggleShuffle);
    document.getElementById('repeat-button').addEventListener('click', toggleRepeat);
  }

  function onPlayerReady(event) {
    const playerContainer = document.getElementById('player-container');
    playerContainer.classList.add('loaded');
  }

  function onPlayerStateChange(event) {
    switch (event.data) {
      case YT.PlayerState.PLAYING:
        isPlaying = true;
        document.getElementById('play-button').innerHTML = '<ion-icon name="pause-outline"></ion-icon>';
        updateProgressBar();
        break;
      case YT.PlayerState.PAUSED:
      case YT.PlayerState.ENDED:
        isPlaying = false;
        document.getElementById('play-button').innerHTML = '<ion-icon name="play-outline"></ion-icon>';
        break;
    }
  }

  function onPlaybackQualityChange(event) {
    const quality = event.data;
    console.log('Qualidade do vídeo alterada para:', quality);
  }

  function onPlayerError(event) {
    console.error('Erro no player:', event.data);
 
