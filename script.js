let player;
let isPlaying = false;
let isShuffle = false;
let mode = 'repeat'; // 'repeat', 'repeat_one', 'shuffle'
let progressBar, currentTimeDisplay, durationDisplay;
let playlistData = [];
let shuffledPlaylist = []; // Para armazenar a versão embaralhada da playlist

function onYouTubeIframeAPIReady() {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('videoId') || '7xhSlpGrITE'; // ID padrão caso não haja um na URL

    player = new YT.Player('music-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'listType': 'playlist',
            'list': 'PLX_YaKXOr1s6u6O3srDxVJn720Zi2RRC5',
            'autoplay': 0,
            'controls': 1,
            'rel': 0, // Evitar vídeos relacionados ao final
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    setupControlButtons();
    setInterval(() => updateProgress(), 1000);

    // Controle de Volume
    const volumeControl = document.getElementById('volume-control');
    if (volumeControl) {
        player.setVolume(100); // Volume inicial
        volumeControl.addEventListener('input', function () {
            const volume = parseInt(volumeControl.value, 10); // Obtém o valor do controle
            player.setVolume(volume); // Aplica no player
        });
    }

    fetchPlaylistData();
}

function setupControlButtons() {
    // Botão Play/Pause
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

    // Botão Anterior
    document.querySelector('.control-button:nth-child(2)').addEventListener('click', function () {
        player.previousVideo();
    });

    // Botão Próximo
    document.querySelector('.control-button:nth-child(4)').addEventListener('click', function () {
        if (isShuffle && shuffledPlaylist.length) {
            const nextIndex = Math.floor(Math.random() * shuffledPlaylist.length);
            player.loadVideoById(shuffledPlaylist[nextIndex]);
        } else {
            player.nextVideo();
        }
    });

    // Botão Repetir/Shuffle
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
                shufflePlaylist();
                break;
            case 'shuffle':
                mode = 'repeat';
                this.innerHTML = '<ion-icon name="repeat-outline"></ion-icon>';
                isShuffle = false;
                break;
        }
    });

    // Botão Playlist
    document.querySelector('.control-button:nth-child(5)').addEventListener('click', function () {
        document.getElementById('playlist-overlay').style.display = 'flex';
        renderPlaylist(isShuffle ? shuffledPlaylist : playlistData);
    });

    // Fechar Playlist
    document.getElementById('close-playlist').addEventListener('click', function () {
        document.getElementById('playlist-overlay').style.display = 'none';
    });
}

function shufflePlaylist() {
    shuffledPlaylist = [...playlistData];
    for (let i = shuffledPlaylist.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPlaylist[i], shuffledPlaylist[j]] = [shuffledPlaylist[j], shuffledPlaylist[i]];
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        switch (mode) {
            case 'repeat_one':
                player.seekTo(0);
                player.playVideo();
                break;
            case 'shuffle':
                if (shuffledPlaylist.length) {
                    const nextIndex = Math.floor(Math.random() * shuffledPlaylist.length);
                    player.loadVideoById(shuffledPlaylist[nextIndex]);
                }
                break;
            case 'repeat':
                player.nextVideo();
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

function updateProgress() {
    if (player && player.getCurrentTime) {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        if (duration > 0) {
            progressBar.value = (currentTime / duration) * 100;
            currentTimeDisplay.textContent = formatTime(currentTime);
            durationDisplay.textContent = formatTime(duration);
        }
    }
}

function fetchPlaylistData() {
    const playlist = player.getPlaylist();
    playlistData = playlist.map((videoId, index) => ({
        videoId,
        index,
        title: '',
        author: ''
    }));

    playlistData.forEach(async (item) => {
        try {
            const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${item.videoId}`);
            const data = await response.json();
            item.title = data.title || 'Sem Título';
            item.author = data.author_name || 'Desconhecido';
        } catch (error) {
            console.error(`Erro ao carregar dados do vídeo ${item.videoId}:`, error);
        }
    });
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
            const index = isShuffle
                ? shuffledPlaylist.findIndex(item => item.videoId === video.videoId)
                : video.index;
            player.playVideoAt(index);
            document.getElementById('playlist-overlay').style.display = 'none';
        });

        playlistContainer.appendChild(listItem);
    });
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Formata o tempo de segundos para o formato mm:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Atualiza a barra de progresso e o tempo exibido
function updateProgressBar() {
    if (player && player.getCurrentTime) {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        const progressPercent = (currentTime / duration) * 100;

        progressBar.style.width = `${progressPercent}%`;
        currentTimeElement.textContent = formatTime(currentTime);
        durationElement.textContent = formatTime(duration);
    }
}

// Lida com cliques na barra de progresso
progressContainer.addEventListener('click', (event) => {
    const width = progressContainer.clientWidth;
    const clickX = event.offsetX;
    const duration = player.getDuration();
    const newTime = (clickX / width) * duration;

    player.seekTo(newTime, true);
});

// Função para pular para o próximo vídeo
function playNextVideo() {
    if (shuffleMode) {
        currentIndex = Math.floor(Math.random() * playlist.length);
    } else {
        currentIndex = (currentIndex + 1) % playlist.length;
    }
    loadVideo(playlist[currentIndex]);
    player.playVideo();
}

// Função para voltar ao vídeo anterior
function playPreviousVideo() {
    if (shuffleMode) {
        currentIndex = Math.floor(Math.random() * playlist.length);
    } else {
        currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    }
    loadVideo(playlist[currentIndex]);
    player.playVideo();
}

// Eventos de clique para botões de controle
playPauseButton.addEventListener('click', togglePlayPause);
nextButton.addEventListener('click', playNextVideo);
prevButton.addEventListener('click', playPreviousVideo);
shuffleButton.addEventListener('click', toggleShuffleMode);

// Função chamada em intervalos para atualizar a barra de progresso
setInterval(updateProgressBar, 1000);

// Atualização inicial de elementos
currentTimeElement.textContent = "0:00";
durationElement.textContent = "0:00";

// Inicia o carregamento do primeiro vídeo da playlist
loadVideo(playlist[currentIndex]);

// Selecionando o botão pelo ID
const repeatButton = document.getElementById('repeat-button');

// Estado inicial do modo de reprodução
let playbackMode = 'normal'; // Pode ser: 'normal', 'shuffle', 'repeat'

// Adicionar o evento de clique ao botão
repeatButton.addEventListener('click', () => {
    // Alternar entre os modos de reprodução
    if (playbackMode === 'normal') {
        playbackMode = 'shuffle';
        repeatButton.innerHTML = '<ion-icon name="shuffle-outline"></ion-icon>';
    } else if (playbackMode === 'shuffle') {
        playbackMode = 'repeat';
        repeatButton.innerHTML = '<ion-icon name="repeat-outline"></ion-icon>';
    } else {
        playbackMode = 'normal';
        repeatButton.innerHTML = '<ion-icon name="play-outline"></ion-icon>';
    }

    console.log('Modo de reprodução:', playbackMode);
    applyPlaybackMode(playbackMode);
});

// Função para aplicar o modo de reprodução atual
function applyPlaybackMode(mode) {
    if (mode === 'shuffle') {
        shufflePlaylist();
    } else if (mode === 'repeat') {
        setRepeatMode(true);
    } else {
        setRepeatMode(false);
    }
}

// Função para embaralhar a playlist
function shufflePlaylist() {
    console.log('Embaralhando playlist...');
    // Implemente a lógica de embaralhamento aqui
    // Exemplo básico para embaralhar uma lista de IDs de vídeo
    if (typeof playlist !== 'undefined' && Array.isArray(playlist)) {
        playlist = playlist.sort(() => Math.random() - 0.5);
        console.log('Playlist embaralhada:', playlist);
        // Atualize o player com a nova ordem
        updatePlayerWithPlaylist(playlist);
    }
}

// Função para ativar/desativar o modo de repetição
function setRepeatMode(isRepeat) {
    console.log('Modo de repetição ativado:', isRepeat);
    // Defina o comportamento de repetição no player
    player.setLoop(isRepeat); // Exemplo: YT API
}

// Função para atualizar o player com a playlist embaralhada
function updatePlayerWithPlaylist(playlist) {
    console.log('Atualizando player com nova playlist:', playlist);
    // Aqui você deve implementar como carregar a nova ordem no reprodutor
}
