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
    const videoId = urlParams.get('videoId') || 'xiN4EOqpvwc'; // ID padrão caso não haja um na URL

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

// Inicializa a playlist
function initPlaylist() {
    playlist = [
        { id: 'xiN4EOqpvwc', title: 'Love Song 1', artist: 'Artist 1' },
        { id: '3c9gDxxdbdE', title: 'Love Song 2', artist: 'Artist 2' },
        { id: 'Bc4t4zAnNyk', title: 'Love Song 3', artist: 'Artist 3' },
    ];

    playTrack();
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
