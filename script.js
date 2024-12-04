let player;
let maxQuality = 'medium'; // Definir resolução máxima
let minQuality = 'low'; // Definir resolução mínima
let isPlaying = false;
let isShuffle = false;
let mode = 'repeat'; // 'repeat', 'repeat_one', 'shuffle'
let progressBar, currentTimeDisplay, durationDisplay;
let playlistData = [];
let sharedVideoId = null;
let shuffledPlaylist = [];

function setVideoQuality(quality) {
    player.setPlaybackQuality(quality);
}

function shuffleArray(array) {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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
    const videoId = urlParams.get('videoId') || 'eT5_neXR3FI'; // Video Inicial da Playlist

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
            'rel': 0 // Evita mostrar vídeos relacionados ao final
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
const themeToggleIcon = document.querySelector('#theme-toggle ion-icon');

if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    themeToggleIcon.setAttribute('name', savedTheme === 'dark' ? 'sunny-outline' : 'moon-outline');
    metaThemeColor.setAttribute('content', savedTheme === 'dark' ? '#13051f' : '#f0f4f9');
} else {
    // Apply dark theme by default
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('dark-mode');
    themeToggleIcon.setAttribute('name', 'sunny-outline');
    metaThemeColor.setAttribute('content', '#13051f');
    localStorage.setItem('theme', 'dark');
}

document.getElementById('theme-toggle').addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.classList.remove('dark-mode');
        themeToggleIcon.setAttribute('name', 'moon-outline');
        metaThemeColor.setAttribute('content', '#f0f4f9');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-mode');
        themeToggleIcon.setAttribute('name', 'sunny-outline');
        metaThemeColor.setAttribute('content', '#13051f');
        localStorage.setItem('theme', 'dark');
    }
});

    fetchPlaylistData();
}

function setupControlButtons() {
    // Configuração dos botões principais
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
        player.nextVideo();
    });

// Evento do botão shuffle
const repeatButton = document.querySelector('.control-button:nth-child(1)');
repeatButton.addEventListener('click', function () {
    switch (mode) {
        case 'repeat':
            mode = 'repeat_one';
            this.innerHTML = '<ion-icon name="repeat-outline"></ion-icon><span class="repeat-number">1</span>';
            break;
        case 'repeat_one':
            mode = 'shuffle';
            isShuffle = true;
            this.innerHTML = '<ion-icon name="shuffle-outline"></ion-icon>';
            shuffledPlaylist = shuffleArray(player.getPlaylist());
            break;
        case 'shuffle':
            mode = 'repeat';
            isShuffle = false;
            this.innerHTML = '<ion-icon name="repeat-outline"></ion-icon>';
            shuffledPlaylist = [];
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

function shuffleArray(array) {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Evento do botão shuffle
const repeatButton = document.querySelector('.control-button:nth-child(1)');
repeatButton.addEventListener('click', function () {
    switch (mode) {
        case 'repeat':
            mode = 'repeat_one';
            this.innerHTML = '<ion-icon name="repeat-outline"></ion-icon><span class="repeat-number">1</span>';
            break;
        case 'repeat_one':
            mode = 'shuffle';
            isShuffle = true;
            this.innerHTML = '<ion-icon name="shuffle-outline"></ion-icon>';
            shuffledPlaylist = shuffleArray(player.getPlaylist());
            break;
        case 'shuffle':
            mode = 'repeat';
            isShuffle = false;
            this.innerHTML = '<ion-icon name="repeat-outline"></ion-icon>';
            shuffledPlaylist = [];
            break;
    }
});

// Reprodução baseada no shuffle
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        document.querySelector('.control-button:nth-child(3)').innerHTML = '<ion-icon name="play-outline"></ion-icon>';
        isPlaying = false;

        switch (mode) {
            case 'repeat_one':
                player.seekTo(0);
                player.playVideo();
                break;
            case 'shuffle':
                if (shuffledPlaylist.length > 0) {
                    const nextIndex = Math.floor(Math.random() * shuffledPlaylist.length);
                    const nextVideoId = shuffledPlaylist[nextIndex];
                    const originalIndex = player.getPlaylist().indexOf(nextVideoId);
                    player.playVideoAt(originalIndex);
                }
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

// inicio

function renderPlaylist(videos) {
    const playlistContainer = document.getElementById('playlist-items');
    playlistContainer.innerHTML = ''; // Limpa a lista atual

    videos.forEach(video => {
        const listItem = document.createElement('li');

        // Cria a miniatura do vídeo
        const thumbnail = document.createElement('img');
        thumbnail.src = `https://img.youtube.com/vi/${video.videoId}/default.jpg`;
        listItem.appendChild(thumbnail);

        // Cria um contêiner para o texto
        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';

        // Cria e adiciona o título
        const titleText = document.createElement('span');
        titleText.className = 'title';
        titleText.textContent = video.title;
        textContainer.appendChild(titleText);

        // Cria e adiciona o autor
        const authorText = document.createElement('span');
        authorText.className = 'author';
        authorText.textContent = video.author;
        textContainer.appendChild(authorText);

        // Adiciona o contêiner de texto ao item da lista
        listItem.appendChild(textContainer);

        // Adiciona o evento de clique
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

        // Adiciona o item configurado à lista de reprodução
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
