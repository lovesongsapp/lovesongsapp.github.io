cdocument.addEventListener('DOMContentLoaded', () => {
    let player; // Variável para o player do YouTube

    // Configuração inicial para controle de volume
    const volumeIcon = document.querySelector('.volume-icon');
    const volumeSliderContainer = document.querySelector('.volume-slider-container');
    const volumeControl = document.getElementById('volume-control');
    let hideTimeout;

    // Carrega a API do YouTube IFrame
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Exibir ou ocultar o controle de volume ao clicar no ícone
    volumeIcon.addEventListener('click', () => {
        if (volumeSliderContainer.style.display === 'none' || !volumeSliderContainer.style.display) {
            volumeSliderContainer.style.display = 'flex';
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                volumeSliderContainer.style.display = 'none';
            }, 5000);
        } else {
            volumeSliderContainer.style.display = 'none';
        }
    });

    // Ajustar o volume do YouTube Player ao deslizar o controle
    volumeControl.addEventListener('input', () => {
        const volume = parseInt(volumeControl.value, 10); // Obtém o valor do controle de volume (0 a 100)
        if (player && typeof player.setVolume === 'function') {
            player.setVolume(volume); // Ajusta o volume no player do YouTube
        }
    });

    // Ocultar o controle de volume ao clicar fora dele
    document.addEventListener('click', (event) => {
        if (!volumeSliderContainer.contains(event.target) && !volumeIcon.contains(event.target)) {
            volumeSliderContainer.style.display = 'none';
        }
    });

    // Configuração inicial
    volumeSliderContainer.style.display = 'none'; // O controle começa oculto
});
