// Selecionando o botão pelo ID
const repeatButton = document.getElementById('repeat-button');

// Estado inicial do modo de reprodução
let playbackMode = 'normal'; // Pode ser: 'normal', 'shuffle', 'repeat'

// Adicionar o evento de clique ao botão
repeatButton.addEventListener('click', () => {
    // Alternar entre os modos de reprodução
    if (playbackMode === 'normal') {
        playbackMode = 'shuffle';
        repeatButton.innerHTML = '<ion-icon name="shuffle-outline"></ion-icon>';
    } else if (playbackMode === 'shuffle') {
        playbackMode = 'repeat';
        repeatButton.innerHTML = '<ion-icon name="repeat-outline"></ion-icon>';
    } else {
        playbackMode = 'normal';
        repeatButton.innerHTML = '<ion-icon name="play-outline"></ion-icon>';
    }

    console.log('Modo de reprodução:', playbackMode);
    applyPlaybackMode(playbackMode);
});

// Função para aplicar o modo de reprodução atual
function applyPlaybackMode(mode) {
    if (mode === 'shuffle') {
        shufflePlaylist();
    } else if (mode === 'repeat') {
        setRepeatMode(true);
    } else {
        setRepeatMode(false);
    }
}

// Função para embaralhar a playlist
function shufflePlaylist() {
    console.log('Embaralhando playlist...');
    // Implemente a lógica de embaralhamento aqui
    // Exemplo básico para embaralhar uma lista de IDs de vídeo
    if (typeof playlist !== 'undefined' && Array.isArray(playlist)) {
        playlist = playlist.sort(() => Math.random() - 0.5);
        console.log('Playlist embaralhada:', playlist);
        // Atualize o player com a nova ordem
        updatePlayerWithPlaylist(playlist);
    }
}

// Função para ativar/desativar o modo de repetição
function setRepeatMode(isRepeat) {
    console.log('Modo de repetição ativado:', isRepeat);
    // Defina o comportamento de repetição no player
    player.setLoop(isRepeat); // Exemplo: YT API
}

// Função para atualizar o player com a playlist embaralhada
function updatePlayerWithPlaylist(playlist) {
    console.log('Atualizando player com nova playlist:', playlist);
    // Aqui você deve implementar como carregar a nova ordem no reprodutor
}
