let player;
let isPlaying = false;
let isShuffle = false; // Estado do modo aleatório
let mode = 'repeat'; // 'repeat', 'repeat_one', 'shuffle'
let progressBar, currentTimeDisplay, durationDisplay;
let playlistData = [];
let originalPlaylist = []; // Para preservar a ordem original da playlist
let shuffledPlaylist = []; // Para armazenar a playlist embaralhada

document.addEventListener('DOMContentLoaded', function () {
    progressBar = document.getElementById('progress');
    currentTimeDisplay = document.getElementById('current-time');
    durationDisplay = document.getElementById('duration');

    if (progressBar && currentTimeDisplay && durationDisplay) {
        onYouTubeIframeAPIReady();
    } else {
        console.error('Um ou mais elementos DOM não foram encontrados.');
    }
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function onYouTubeIframeAPIReady() {
    const videoId = 'eT5_neXR3FI'; // Vídeo inicial da playlist
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
            'rel': 0,
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
        },
    });
}

function onPlayerReady(event) {
    setupControlButtons();
    fetchPlaylistData();
}

function setupControlButtons() {
    const repeatButton = document.getElementById('repeat-button');

    repeatButton.addEventListener('click', function () {
        switch (mode) {
            case 'repeat':
                mode = 'repeat_one';
                repeatButton.innerHTML = '<ion-icon name="repeat-outline"></ion-icon><span class="repeat-number">1</span>';
                break;
            case 'repeat_one':
                mode = 'shuffle';
                repeatButton.innerHTML = '<ion-icon name="shuffle-outline"></ion-icon>';
                isShuffle = true;
                shufflePlaylist();
                break;
            case 'shuffle':
                mode = 'repeat';
                repeatButton.innerHTML = '<ion-icon name="repeat-outline"></ion-icon>';
                isShuffle = false;
                restoreOriginalPlaylist();
                break;
        }
    });

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
            playNextRandom();
        } else {
            player.nextVideo();
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        switch (mode) {
            case 'repeat_one':
                player.seekTo(0);
                player.playVideo();
                break;
            case 'shuffle':
                playNextRandom();
                break;
            case 'repeat':
                player.nextVideo();
                break;
        }
    }
    updateTitleAndArtist();
}

function shufflePlaylist() {
    shuffledPlaylist = shuffleArray([...originalPlaylist]);
    player.loadPlaylist({
        list: shuffledPlaylist,
        index: 0,
    });
}

function restoreOriginalPlaylist() {
    player.loadPlaylist({
        list: originalPlaylist,
        index: player.getPlaylistIndex(),
    });
}

function playNextRandom() {
    const nextIndex = Math.floor(Math.random() * shuffledPlaylist.length);
    player.playVideoAt(nextIndex);
}

function updateTitleAndArtist() {
    const videoData = player.getVideoData();
    document.getElementById('title').textContent = videoData.title || 'Título';
    document.getElementById('artist').textContent = videoData.author || 'Artista';
}

async function fetchPlaylistData() {
    originalPlaylist = player.getPlaylist();
    playlistData = originalPlaylist.map((videoId) => ({ videoId, title: '', author: '' }));

    for (let i = 0; i < playlistData.length; i++) {
        const videoId = playlistData[i].videoId;
        try {
            const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
            const data = await response.json();
            playlistData[i].title = data.title || 'Título não encontrado';
            playlistData[i].author = data.author_name || 'Autor não encontrado';
        } catch (error) {
            console.error('Erro ao buscar informações do vídeo:', error);
        }
    }
}
