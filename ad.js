// Referência ao botão
const skipAdButton = document.querySelector('.skip-ad-btn');
let adCheckInterval;

// Função para verificar se o anúncio está tocando
function checkForAd() {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();

    // Supondo que anúncios são vídeos curtos, exibir o botão se a duração for inferior a 30 segundos
    if (duration > 0 && duration <= 30 && currentTime < duration) {
        skipAdButton.style.display = 'block'; // Exibe o botão
    } else {
        skipAdButton.style.display = 'none'; // Oculta o botão
    }
}

// Função para pular o anúncio
function skipAd() {
    player.stopVideo(); // Interrompe o vídeo atual
    player.playVideo(); // Retoma o próximo vídeo na lista
}

// Evento de clique para pular o anúncio
skipAdButton.addEventListener('click', skipAd);

// Inicializa o player do YouTube com intervalo para detectar anúncios
function onYouTubeIframeAPIReady() {
    player = new YT.Player('music-player', {
        height: '100%',
        width: '100%',
        videoId: 'xiN4EOqpvwc', // ID padrão
        events: {
            'onReady': (event) => {
                // Inicia o intervalo ao carregar o player
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
