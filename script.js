let player;
let maxQuality = 'large'; // Definir resolução máxima
let minQuality = 'medium'; // Definir resolução mínima
let isPlaying = false;
let isShuffle = false;
let mode = 'repeat'; // 'repeat', 'repeat_one', 'shuffle'
let progressBar, currentTimeDisplay, durationDisplay;
let playlistData = [];

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
    player = new YT.Player('music-player', {
        height: '100%',
        width: '100%',
        videoId: 'xiN4EOqpvwc',
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
    document.querySelector('.control-button:nth-child(3)').addEventListener('click', function() {
        if (isPlaying) {
            player.pauseVideo();
            this.innerHTML = '<ion-icon name="play-outline" class="play-outline"></ion-icon>';
        } else {
            player.playVideo();
            this.innerHTML = '<ion-icon name="pause-outline" class="pause-outline"></ion-icon>';
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
                player.setShuffle(isShuffle);
                break;
            case 'shuffle':
                mode = 'repeat';
                this.innerHTML = '<ion-icon name="repeat-outline"></ion-icon>';
                isShuffle = false;
                player.setShuffle(isShuffle);
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
                player.nextVideo();
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
            player.playVideoAt(video.index);
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

//SHARE CONFIG

document.getElementById('share-icon').addEventListener('click', function() {
    const videoData = player.getVideoData();
    const videoUrl = `https://www.youtube.com/watch?v=${videoData.video_id}`;

    if (navigator.share) {
        navigator.share({
            title: videoData.title,
            text: `Confira este vídeo: ${videoData.title}`,
            url: videoUrl,
        }).then(() => {
            console.log('Compartilhamento bem-sucedido');
        }).catch((error) => {
            console.error('Erro ao compartilhar:', error);
        });
    } else {
        // Fallback para navegadores que não suportam a API de compartilhamento
        alert(`Confira este vídeo: ${videoData.title}\n${videoUrl}`);
    }
});

//OTHERS CONFIG

