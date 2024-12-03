let player;
let mode = 'repeat'; // Modos: 'repeat', 'repeat_one', 'shuffle'
let playlist = [];
let currentIndex = 0;
let progress = document.getElementById('progress');
let currentTime = document.getElementById('current-time');
let duration = document.getElementById('duration');
let volumeControl = document.getElementById('volume-control');

// Inicializa o iframe do YouTube
function onYouTubeIframeAPIReady() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('videoId') || 'PFpZzWdu6XM'; // ID padrão caso não haja um na URL

    player = new YT.Player('music-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            listType: 'playlist',
            list: 'PLX_YaKXOr1s6u6O3srDxVJn720Zi2RRC5',
            autoplay: 0,
            controls: 0,
            showinfo: 0,
            modestbranding: 1,
            rel: 0,
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// Função chamada quando o player está pronto
function onPlayerReady(event) {
    updateDuration();
    setVolume();
    updateProgress();
}

// Atualiza a duração do vídeo
function updateDuration() {
    const videoDuration = player.getDuration();
    duration.textContent = formatTime(videoDuration);
}

// Atualiza o tempo atual do vídeo
function updateProgress() {
    const currentTimeValue = player.getCurrentTime();
    currentTime.textContent = formatTime(currentTimeValue);
    progress.value = (currentTimeValue / player.getDuration()) * 100;

    if (!player || player.getPlayerState() === YT.PlayerState.PLAYING) {
        setTimeout(updateProgress, 1000);
    }
}

// Formata o tempo para minutos:segundos
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${minutes}:${sec < 10 ? '0' : ''}${sec}`;
}

// Função chamada quando o estado do player muda
function onPlayerStateChange(event) {
    switch (event.data) {
        case YT.PlayerState.PLAYING:
            updateProgress();
            break;
        case YT.PlayerState.PAUSED:
        case YT.PlayerState.ENDED:
            stopProgressUpdate();
            break;
    }
}

// Função para parar a atualização da barra de progresso
function stopProgressUpdate() {
    clearTimeout(updateProgress);
}

// Atualiza o volume do player
function setVolume() {
    const volume = volumeControl.value;
    player.setVolume(volume);
}

// Manipula o evento de mudança no controle de volume
volumeControl.addEventListener('input', () => {
    setVolume();
});

// Função para alternar entre os modos de reprodução
function toggleMode() {
    switch (mode) {
        case 'repeat':
            mode = 'repeat_one';
            break;
        case 'repeat_one':
            mode = 'shuffle';
            break;
        case 'shuffle':
            mode = 'repeat';
            break;
    }

    updateModeIcon();
}

// Atualiza o ícone baseado no modo atual
function updateModeIcon() {
    const repeatButton = document.getElementById('repeat-button');
    const icon = repeatButton.querySelector('ion-icon');

    switch (mode) {
        case 'repeat':
            icon.setAttribute('name', 'repeat-outline');
            break;
        case 'repeat_one':
            icon.setAttribute('name', 'repeat-one-outline');
            break;
        case 'shuffle':
            icon.setAttribute('name', 'shuffle-outline');
            break;
    }
}

// Função para pular para o próximo vídeo na playlist
function nextTrack() {
    currentIndex++;
    if (currentIndex >= playlist.length) {
        currentIndex = 0;
    }

    playTrack();
}

// Função para voltar para o vídeo anterior na playlist
function previousTrack() {
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = playlist.length - 1;
    }

    playTrack();
}

// Função para tocar o vídeo atual
function playTrack() {
    const video = playlist[currentIndex];
    player.loadVideoById(video.id);
    document.getElementById('title').textContent = video.title;
    document.getElementById('artist').textContent = video.artist;
}

// Adiciona eventos aos botões de controle
document.getElementById('repeat-button').addEventListener('click', toggleMode);
document.querySelector('.control-button ion-icon[name="play-skip-back-outline"]').addEventListener('click', previousTrack);
document.querySelector('.control-button ion-icon[name="play-skip-forward-outline"]').addEventListener('click', nextTrack);
document.querySelector('.control-button ion-icon[name="play-circle-outline"]').addEventListener('click', () => {
    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
});

// Inicializa a aplicação
initPlaylist();

function onPlayerReady(event) {
    setVideoQuality(minQuality); // Define a qualidade inicial para 'medium'
    setupControlButtons();
// Controle de Volume
    const volumeControl = document.getElementById('volume-control');
    
    // Verifica se o controle de volume existe no DOM
    if (volumeControl) {
        player.setVolume(100); // Define volume inicial em 100%
        
        // Atualiza o volume do player ao mover o controle
        volumeControl.addEventListener('input', function() {
            const volume = parseInt(volumeControl.value, 10); // Obtém o valor do controle
            player.setVolume(volume); // Aplica o volume no player (intervalo 0 a 100)
        });
    } else {
        console.error('Controle de volume não encontrado no DOM.');
    }

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
