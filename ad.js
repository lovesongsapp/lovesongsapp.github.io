// Referência ao botão
const skipAdButton = document.querySelector('.skip-ad-btn');
let isAdPlaying = false;

// Função para verificar se é anúncio
function checkIfAdPlaying() {
    const videoDuration = player.getDuration();

    // Exibe o botão se a duração for menor que 30 segundos (suposição para anúncios)
    if (videoDuration > 0 && videoDuration <= 30) {
        isAdPlaying = true;
        skipAdButton.style.display = 'block';
    } else {
        isAdPlaying = false;
        skipAdButton.style.display = 'none';
    }
}

// Função para pular o anúncio
function skipAd() {
    if (isAdPlaying) {
        player.stopVideo(); // Interrompe o anúncio
        player.playVideo(); // Retoma o próximo vídeo
    }
}

// Adiciona o evento de clique ao botão
skipAdButton.addEventListener('click', skipAd);

// Evento para monitorar mudanças no estado do player
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        checkIfAdPlaying(); // Verifica se é anúncio quando o vídeo começa
    } else if (event.data === YT.PlayerState.ENDED) {
        skipAdButton.style.display = 'none'; // Oculta o botão ao término do vídeo
    }
}

