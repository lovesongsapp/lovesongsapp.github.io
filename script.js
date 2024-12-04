let player;
let maxQuality = 'medium'; // Definir resolução máxima
let minQuality = 'low'; // Definir resolução mínima
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

    // Temas e modo escuro/claro
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

function renderPlaylist(videos) {
    const playlistContainer = document.getElementById('playlist-items');
    playlistContainer.innerHTML = ''; // Limpa a lista atual

    videos.forEach(video => {
        const listItem = document.createElement('li');
        listItem.classList.add('playlist-item');

        const thumbnail = document.createElement('img');
        thumbnail.classList.add('thumbnail');
        thumbnail.src = `https://img.youtube.com/vi/${video.videoId}/default.jpg`;
        thumbnail.alt = video.title;

        const details = document.createElement('div');
        details.classList.add('details');

        const title = document.createElement('span');
        title.classList.add('video-title');
        title.textContent = video.title;

        const author = document.createElement('span');
        author.classList.add('video-author');
        author.textContent = video.author;

        details.appendChild(title);
        details.appendChild(author);
        listItem.appendChild(thumbnail);
        listItem.appendChild(details);

        listItem.addEventListener('click', () => {
            player.loadVideoById(video.videoId);
            document.getElementById('playlist-overlay').style.display = 'none';
        });

        playlistContainer.appendChild(listItem);
    });
}
