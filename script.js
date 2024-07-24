// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCOed1uYtjzkR1OpYS6z3-sbIVPQW6MohM",
    authDomain: "lovesongs-1285e.firebaseapp.com",
    projectId: "lovesongs-1285e",
    storageBucket: "lovesongs-1285e.appspot.com",
    messagingSenderId: "940749066428",
    appId: "1:940749066428:web:4bc067e8721fa576fe40b9",
    measurementId: "G-HLGV34NCB0"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Função para verificar se o usuário está autenticado
function isUserLoggedIn() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            resolve(!!user); // Retorna true se o usuário estiver autenticado
            unsubscribe(); // Limpa o listener após a verificação
        });
    });
}

// Atualiza o botão de reprodução para verificar a autenticação antes de tocar o vídeo
document.querySelector('.control-button:nth-child(3)').addEventListener('click', async function() {
    const isLoggedIn = await isUserLoggedIn();
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    if (isPlaying) {
        player.pauseVideo();
        this.innerHTML = '<ion-icon name="play-circle-outline" class="play-outline"></ion-icon>';
    } else {
        player.playVideo();
        this.innerHTML = '<ion-icon name="pause-circle-outline" class="pause-outline"></ion-icon>';
    }
    isPlaying = !isPlaying;
});

// Redefine senha
document.getElementById('reset-password-link').addEventListener('click', function() {
    const email = document.getElementById('email-input').value;
    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert('Verifique seu e-mail para redefinir sua senha.');
        })
        .catch((error) => {
            console.error('Erro ao enviar e-mail de redefinição de senha:', error);
        });
});

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

    setupTheme();
    fetchPlaylistData();
}

function setupTheme() {
    const savedTheme = localStorage.getItem('theme');
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        document.getElementById('theme-toggle').innerHTML = savedTheme === 'dark' ? '<ion-icon name="sunny-outline"></ion-icon>' : '<ion-icon name="moon-outline"></ion-icon>';
        metaThemeColor.setAttribute('content', savedTheme === 'dark' ? '#13051f' : '#f0f4f9');
    } else {
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
}

function setupControlButtons() {
    document.querySelector('.control-button:nth-child(3)').addEventListener('click', togglePlayPause);
    document.querySelector('.control-button:nth-child(2)').addEventListener('click', () => player.previousVideo());
    document.querySelector('.control-button:nth-child(4)').addEventListener('click', () => player.nextVideo());
    document.querySelector('.control-button:nth-child(1)').addEventListener('click', toggleRepeatShuffleMode);
    document.querySelector('.control-button:nth-child(5)').addEventListener('click', () => {
        document.getElementById('playlist-overlay').style.display = 'flex';
        renderPlaylist(playlistData);
    });

    document.getElementById('close-playlist').addEventListener('click', () => {
        document.getElementById('playlist-overlay').style.display = 'none';
    });
}

function togglePlayPause() {
    if (isPlaying) {
        player.pauseVideo();
        this.innerHTML = '<ion-icon name="play-circle-outline" class="play-outline"></ion-icon>';
    } else {
        player.playVideo();
        this.innerHTML = '<ion-icon name="pause-circle-outline" class="pause-outline"></ion-icon>';
    }
    isPlaying = !isPlaying;
}

function toggleRepeatShuffleMode() {
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
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        document.querySelector('.control-button:nth-child(3)').innerHTML = '<ion-icon name="play-outline"></ion-icon>';
        isPlaying = false;

        switch (mode) {
            case 'repeat_one':
                player.seekTo(0);
                player.play
// Lógica de autenticação e cadastro
document.getElementById('register-button').addEventListener('click', function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('Usuário registrado:', user);
            window.location.href = 'success.html';
        })
        .catch((error) => {
            console.error('Erro ao registrar usuário:', error);
            alert('Erro ao registrar usuário: ' + error.message);
        });
});

document.getElementById('login-button').addEventListener('click', function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('Usuário autenticado:', user);
            window.location.href = 'success.html';
        })
        .catch((error) => {
            console.error('Erro ao autenticar usuário:', error);
            alert('Erro ao autenticar usuário: ' + error.message);
        });
});

document.getElementById('google-login-button').addEventListener('click', function() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log('Usuário autenticado com Google:', user);
            window.location.href = 'success.html';
        })
        .catch((error) => {
            console.error('Erro ao autenticar com Google:', error);
            alert('Erro ao autenticar com Google: ' + error.message);
        });
});

// Mostra/esconde senha
document.getElementById('toggle-password-visibility').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.innerHTML = type === 'password' ? '<ion-icon name="eye-outline"></ion-icon>' : '<ion-icon name="eye-off-outline"></ion-icon>';
});

// Função para renderizar itens da playlist
function renderPlaylist(playlistData) {
    const playlistElement = document.getElementById('playlist');
    playlistElement.innerHTML = '';
    playlistData.forEach((video) => {
        const videoElement = document.createElement('div');
        videoElement.className = 'playlist-item';
        videoElement.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}">
            <div class="playlist-item-details">
                <h3>${video.title}</h3>
            </div>
        `;
        videoElement.addEventListener('click', () => {
            player.loadVideoById(video.videoId);
            document.getElementById('playlist-overlay').style.display = 'none';
        });
        playlistElement.appendChild(videoElement);
    });
}

// Estilo e animações
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.animated');
    elements.forEach(element => {
        element.classList.add('fade-in');
    });
});

function fadeOut(element) {
    element.style.opacity = 1;
    (function fade() {
        if ((element.style.opacity -= 0.1) < 0) {
            element.style.display = 'none';
        } else {
            requestAnimationFrame(fade);
        }
    })();
}

function fadeIn(element, display) {
    element.style.opacity = 0;
    element.style.display = display || 'block';
    (function fade() {
        let val = parseFloat(element.style.opacity);
        if (!((val += 0.1) > 1)) {
            element.style.opacity = val;
            requestAnimationFrame(fade);
        }
    })();
}

// Funções adicionais de utilidade
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Função para buscar dados da playlist do YouTube
async function fetchPlaylistData() {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PLX_YaKXOr1s6u6O3srDxVJn720Zi2RRC5&key=AIzaSyBta-ZsOpOzhPiFjV-l8zFQbDj3JjZQ9Nw`);
        const data = await response.json();
        playlistData = data.items.map(item => ({
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.default.url,
            videoId: item.snippet.resourceId.videoId
        }));
        renderPlaylist(playlistData);
    } catch (error) {
        console.error('Erro ao buscar dados da playlist:', error);
    }
}
