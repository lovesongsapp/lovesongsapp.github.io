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
    const videoId = urlParams.get('videoId') || 'UXxRyNvTPr8'; // Video Inicial da Playlist

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
        if (isShuffle) {
            // Gera um índice aleatório para a playlist
            const playlist = player.getPlaylist();
            const nextIndex = Math.floor(Math.random() * playlist.length);
            player.playVideoAt(nextIndex);
        } else {
            const currentIndex = player.getPlaylistIndex(); // Obtém o índice atual
            const playlistLength = player.getPlaylist().length; // Comprimento da playlist
            const nextIndex = (currentIndex + 1) % playlistLength; // Calcula o próximo índice
            player.playVideoAt(nextIndex); // Avança para o próximo vídeo
        }
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
                player.playVideoAt(nextIndex); // Embaralha a playlist
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

        // Cria a miniatura do vídeo
        const thumbnail = document.createElement('img');
        thumbnail.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`; // URL da miniatura
        thumbnail.alt = video.title;
        thumbnail.classList.add('playlist-thumbnail');
        
        // Cria o título do vídeo
        const title = document.createElement('span');
        title.classList.add('playlist-title');
        title.textContent = video.title;

        // Cria o autor do vídeo
        const author = document.createElement('span');
        author.classList.add('playlist-author');
        author.textContent = video.author;

        // Adiciona o click event para reproduzir o vídeo ao clicar na miniatura
        listItem.appendChild(thumbnail);
        listItem.appendChild(title);
        listItem.appendChild(author);
        
        listItem.addEventListener('click', function() {
            player.playVideoAt(video.index);
            document.getElementById('playlist-overlay').style.display = 'none';
        });

        playlistContainer.appendChild(listItem);
    });
}

// Função para compartilhar o vídeo atual via URL encurtada
function shareVideo() {
    const currentVideoId = player.getVideoData().video_id;
    const url = `https://www.youtube.com/watch?v=${currentVideoId}`;
    const shareUrl = `https://api-ssl.bitly.com/v4/shorten`;
    const token = 'YOUR_BITLY_API_TOKEN'; // Substitua com seu token Bitly

    fetch(shareUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            long_url: url,
        }),
    })
    .then(response => response.json())
    .then(data => {
        alert(`Compartilhe o vídeo: ${data.link}`);
    })
    .catch(error => console.error('Erro ao encurtar a URL:', error));
}

// Função para alternar a visibilidade do player de vídeo
function togglePlayerVisibility() {
    const playerContainer = document.getElementById('music-player-container');
    if (playerContainer.style.display === 'none') {
        playerContainer.style.display = 'block';
    } else {
        playerContainer.style.display = 'none';
    }
}

// Função para buscar um vídeo por título e iniciar a reprodução
function searchVideo(query) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=YOUR_YOUTUBE_API_KEY`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const videoId = data.items[0].id.videoId;
                player.loadVideoById(videoId);
            } else {
                alert('Nenhum vídeo encontrado.');
            }
        })
        .catch(error => console.error('Erro ao buscar vídeo:', error));
}

// Evento de busca
document.getElementById('search-button').addEventListener('click', function() {
    const query = document.getElementById('search-input').value;
    searchVideo(query);
});

// Evento de compartilhamento
document.getElementById('share-button').addEventListener('click', shareVideo);

// Evento para alternar visibilidade do player
document.getElementById('toggle-player-visibility').addEventListener('click', togglePlayerVisibility);

// Código para redes sociais (usando o link do vídeo atual)
document.getElementById('social-share-button').addEventListener('click', function() {
    const currentVideoId = player.getVideoData().video_id;
    const socialShareUrl = `https://www.youtube.com/watch?v=${currentVideoId}`;
    alert(`Compartilhe: ${socialShareUrl}`);
});
