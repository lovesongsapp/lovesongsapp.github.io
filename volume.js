document.addEventListener('DOMContentLoaded', () => {
    const volumeIcon = document.querySelector('.volume-icon');
    const volumeSliderContainer = document.querySelector('.volume-slider-container');
    const volumeControl = document.getElementById('volume-control');
    const volumeValue = document.getElementById('volume-value');

    let hideTimeout;

    // Função para esconder o controle de volume
    function hideVolumeControl() {
        volumeSliderContainer.style.display = 'none';
    }

    // Alternar visibilidade do controle de volume ao clicar no ícone
    volumeIcon.addEventListener('click', () => {
        if (volumeSliderContainer.style.display === 'none' || !volumeSliderContainer.style.display) {
            volumeSliderContainer.style.display = 'flex';
            
            // Reinicia o temporizador de 5 segundos sempre que o slider é mostrado
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(hideVolumeControl, 5000); // Esconde após 5 segundos de inatividade
        }
    });

    // Atualiza o valor do slider em tempo real e ajusta o volume do player
    volumeControl.addEventListener('input', () => {
        const volume = volumeControl.value;
        volumeControl.style.setProperty('--slider-value', `${volume}%`);
        volumeValue.textContent = volume;

        // Ajusta o volume no player do YouTube (de 0 a 100)
        if (player && typeof player.setVolume === 'function') {
            player.setVolume(volume);
        }

        // Reinicia o temporizador sempre que o controle for ajustado
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(hideVolumeControl, 5000); // Esconde após 5 segundos de inatividade
    });

    // Fecha o controle de volume ao clicar fora dele
    document.addEventListener('click', (event) => {
        if (!volumeSliderContainer.contains(event.target) && !volumeIcon.contains(event.target)) {
            volumeSliderContainer.style.display = 'none';
        }
    });

    // Configura o estado inicial
    volumeSliderContainer.style.display = 'none'; // Começa oculto
    volumeControl.value = 100; // Define o volume inicial para 100%
    volumeControl.dispatchEvent(new Event('input')); // Atualiza a exibição inicial do volume
});
