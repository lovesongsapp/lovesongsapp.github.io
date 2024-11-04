// video.js
let isAdPlaying = false;
let skipAdButton;

// Função para verificar se o vídeo atual é um anúncio
function checkIfAdPlaying() {
    // Estado 1 significa "playing" e getAdState() verifica se é um anúncio
    if (player.getPlayerState() === 1 && player.getAdState()) {
        isAdPlaying = true;
        showSkipAdButton();
    } else {
        isAdPlaying = false;
        hideSkipAdButton();
    }
}

// Exibir o botão de "Pular Anúncio"
function showSkipAdButton() {
    if (!skipAdButton) {
        skipAdButton = document.createElement('button');
        skipAdButton.innerText = "Pular Anúncio";
        skipAdButton.classList.add('skip-ad-btn');
        skipAdButton.onclick = skipAd;
        document.body.appendChild(skipAdButton); // Ou posicione onde preferir no app
    }
    skipAdButton.style.display = 'block';
}

// Ocultar o botão de "Pular Anúncio"
function hideSkipAdButton() {
    if (skipAdButton) {
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

// Event listener para o estado do player (executar a cada mudança de estado)
player.addEventListener('onStateChange', function(event) {
    checkIfAdPlaying();
});
