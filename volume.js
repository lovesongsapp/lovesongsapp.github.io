document.addEventListener('DOMContentLoaded', () => {
    const volumeIcon = document.querySelector('.volume-icon');
    const volumeSliderContainer = document.querySelector('.volume-slider-container');
    const volumeControl = document.getElementById('volume-control');
    const volumeValue = document.getElementById('volume-value');
    const audioElements = document.querySelectorAll('audio'); // Seleciona todos os elementos de áudio na página
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

    // Atualiza o valor do slider e o volume de todos os áudios em tempo real
    volumeControl.addEventListener('input', () => {
        const volume = volumeControl.value;
        volumeControl.style.setProperty('--slider-value', `${volume}%`);
        volumeValue.textContent = volume;

        // Define o volume de todos os áudios na playlist com base no valor do controle deslizante
        audioElements.forEach(audio => {
            audio.volume = volume / 100; // Volume entre 0 e 1
        });

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
    volumeControl.dispatchEvent(new Event('input'));
});
