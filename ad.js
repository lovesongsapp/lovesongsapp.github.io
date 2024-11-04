// Referência ao botão
const skipAdButton = document.querySelector('.skip-ad-btn');
let adCheckInterval;

// Função para verificar se o anúncio está tocando
function checkForAd() {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();

    // Exibe o botão se o vídeo tiver uma duração de até 30 segundos (suposição de anúncio)
    if (duration > 0 && duration <= 30 && currentTime < duration) {
        skipAdButton.style.display = 'block'; // Exibe o botão
    } else {
        skipAdButton.style.display = 'none'; // Oculta o botão
    }
}

// Função para simular o pulo do anúncio
function skipAd() {
    const duration = player.getDuration();

    // Avança o vídeo para o fim, simulando o pulo do anúncio
    if (duration > 0 && duration <= 30) {
        player.seekTo(duration, true); // Avança até o final do anúncio
    }
}

// Adiciona evento de clique para o botão
skipAdButton.addEventListener('click', skipAd);

// Inicializa o player com intervalo de verificação
function onYouTubeIframeAPIReady() {
    player = new YT.Player('music-player', {
        height: '100%',
        width: '100%',
        videoId: 'xiN4EOqpvwc', // ID padrão
        events: {
            'onReady': (event) => {
                // Inicia o intervalo para detectar anúncio
                adCheckInterval = setInterval(checkForAd, 1000); // Verifica a cada segundo
            },
            'onStateChange': (event) => {
                if (event.data === YT.PlayerState.ENDED) {
                    skipAdButton.style.display = 'none'; // Oculta o botão ao término do vídeo
                }
            }
        }
    });
}
