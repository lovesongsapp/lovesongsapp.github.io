document.addEventListener('DOMContentLoaded', () => {
    const volumeControl = document.getElementById('volume-control');

    const updateSliderStyle = () => {
        const volume = volumeControl.value; // Obtém o valor atual do controle
        volumeControl.style.setProperty('--slider-value', `${volume}%`); // Define a propriedade CSS personalizada
    };

    // Atualiza o estilo sempre que o controle deslizante muda
    volumeControl.addEventListener('input', updateSliderStyle);

    // Inicializa o estilo com o valor atual ao carregar a página
    updateSliderStyle();
});
