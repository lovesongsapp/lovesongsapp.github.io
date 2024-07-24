// Seu script completo de playlist com adição de autenticação

let player;
let maxQuality = 'large'; // Definir resolução máxima
let minQuality = 'medium'; // Definir resolução mínima
let isPlaying = false;
let isShuffle = false;
let mode = 'repeat'; // 'repeat', 'repeat_one', 'shuffle'
let progressBar, currentTimeDisplay, durationDisplay;
let playlistData = [];
let sharedVideoId = null;

// Verifica se o usuário está autenticado
async function checkAuthentication() {
    const user = await getCurrentUser();

    if (!user) {
        showInvitation();
    } else {
        hideInvitation();
        initializePlayer();
    }
}

// Obtém o usuário atual do Firebase
async function getCurrentUser() {
    const auth = getAuth(); // Obtém a instância do Auth do Firebase
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe(); // Remove o ouvinte após obter o usuário
            resolve(user);
        });
    });
}

// Mostra a div de convite
function showInvitation() {
    const invitationDiv = document.createElement('div');
    invitationDiv.id = 'invitation';
    invitationDiv.style.position = 'fixed';
    invitationDiv.style.top = '50%';
    invitationDiv.style.left = '50%';
    invitationDiv.style.transform = 'translate(-50%, -50%)';
    invitationDiv.style.backgroundColor = '#ffffff';
    invitationDiv.style.border = '1px solid #000000';
    invitationDiv.style.padding = '20px';
    invitationDiv.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    invitationDiv.style.zIndex = '1000';
    invitationDiv.style.textAlign = 'center';

    const message = document.createElement('p');
    message.textContent = 'Você precisa estar logado para assistir aos vídeos da playlist. Por favor, faça seu cadastro ou login.';
    invitationDiv.appendChild(message);

    const registerButton = document.createElement('button');
    registerButton.textContent = 'Cadastrar';
    registerButton.addEventListener('click', () => {
        window.location.href = 'login/login.html'; // Redireciona para a página de login
    });
    invitationDiv.appendChild(registerButton);

    const ignoreButton = document.createElement('button');
    ignoreButton.textContent = 'Ignorar';
    ignoreButton.addEventListener('click', () => {
        document.getElementById('invitation').style.display = 'none'; // Fecha o convite
    });
    invitationDiv.appendChild(ignoreButton);

    document.body.appendChild(invitationDiv);
}

// Oculta a div de convite
function hideInvitation() {
    const invitationDiv = document.getElementById('invitation');
    if (invitationDiv) {
        invitationDiv.style.display = 'none';
    }
}

// Inicializa o player apenas se o usuário estiver autenticado
function initializePlayer() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof onYouTubeIframeAPIReady === 'function') {
                onYouTubeIframeAPIReady();
            }
        });
    } else {
        if (typeof onYouTubeIframeAPIReady === 'function') {
            onYouTubeIframeAPIReady();
        }
    }
}

function setVideoQuality(quality) {
    player.setPlaybackQuality(quality);
}

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
    if (event.data === YT.PlayerState.ENDED) {
        if (mode === 'repeat_one') {
            player.seekTo(0);
            player.playVideo();
        } else if (isShuffle) {
            const playlist = player.getPlaylist();
            const randomIndex = Math.floor(Math.random() * playlist.length);
            player.playVideoAt(randomIndex);
        }
    }
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

function fetchPlaylistData() {
    const playlistItems = document.querySelectorAll('.playlist-item');
    playlistItems.forEach((item, index) => {
        playlistData.push({
            title: item.dataset.title,
            thumbnail: item.dataset.thumbnail,
            videoId: item.dataset.videoId
        });
    });
    renderPlaylist(playlistData);
}

function renderPlaylist(data) {
    const playlistElement = document.getElementById('playlist');
    playlistElement.innerHTML = '';
    data.forEach((item, index) => {
        const listItem = document.createElement('div');
        listItem.classList.add('playlist-item');
        listItem.innerHTML = `
            <img src="${item.thumbnail}" alt="${item.title}" />
            <span>${item.title}</span>
        `;
        listItem.addEventListener('click', () => {
            player.playVideoAt(index);
            document.getElementById('playlist-overlay').style.display = 'none';
        });
        playlistElement.appendChild(listItem);
    });
}

// Inicia a verificação de autenticação
checkAuthentication();
