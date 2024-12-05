document.addEventListener('DOMContentLoaded', () => {
    const volumeIcon = document.querySelector('.volume-icon');
    const volumeSliderContainer = document.querySelector('.volume-slider-container');
    const volumeControl = document.getElementById('volume-control');
    let hideTimeout;

    // Mostra ou oculta o controle deslizante de volume ao clicar no ícone
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

    // Ajusta o volume do player ao mudar o valor do controle deslizante
    volumeControl.addEventListener('input', () => {
        const volume = parseInt(volumeControl.value, 10);
        if (player && typeof player.setVolume === 'function') {
            player.setVolume(volume); // Ajusta o volume no player do YouTube
        }
    });

    // Oculta o controle de volume ao clicar fora dele
    document.addEventListener('click', (event) => {
        if (!volumeSliderContainer.contains(event.target) && !volumeIcon.contains(event.target)) {
            volumeSliderContainer.style.display = 'none';
        }
    });

    // Configurações iniciais
    volumeSliderContainer.style.display = 'none'; // Começa oculto
});
