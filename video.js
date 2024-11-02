// video.js
let isAdPlaying = false;
const skipAdButton = document.querySelector('.skip-ad-btn');

function checkIfAdPlaying() {
    // Verifica se o vídeo é um anúncio e se está tocando
    if (player.getPlayerState() === 1 && player.getAdState()) {
        isAdPlaying = true;
        skipAdButton.style.display = 'block'; // Exibe o botão
    } else {
        isAdPlaying = false;
        skipAdButton.style.display = 'none'; // Oculta o botão
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
player.addEventListener('onStateChange', function(event) {
    checkIfAdPlaying();
});
