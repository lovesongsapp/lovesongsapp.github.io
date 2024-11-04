// Certifique-se de que o player já esteja definido no script principal antes de executar este código.

document.addEventListener('DOMContentLoaded', function() {
    // Função para verificar e pular anúncios
    function checkAndSkipAd(event) {
        // Estado do player (-1: UNSTARTED, 0: ENDED, 1: PLAYING, 2: PAUSED, 3: BUFFERING, 5: CUED)
        if (event.data === YT.PlayerState.UNSTARTED || event.data === YT.PlayerState.PLAYING) {
            const currentVideoData = player.getVideoData();
            const videoDuration = player.getDuration();

            // Verifica se o vídeo atual é um anúncio (geralmente tem duração curta, por exemplo, < 20 segundos)
            if (videoDuration < 20 && currentVideoData.video_id !== null) {
                console.log("Anúncio detectado. Pulando...");
                player.nextVideo();
            }
        }
    }

    // Verifique se o player está inicializado
    if (typeof player !== 'undefined') {
        // Adiciona o listener para o evento de mudança de estado
        player.addEventListener('onStateChange', checkAndSkipAd);
    } else {
        console.error("O player do YouTube não foi encontrado.");
    }
});
