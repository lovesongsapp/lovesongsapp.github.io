document.addEventListener('DOMContentLoaded', function () {
    const volumeControl = document.getElementById('volume-control');

    function updateVolume() {
        const volume = volumeControl.value;
        // Atualiza o estilo do controle deslizante
        volumeControl.style.setProperty('--slider-value', `${volume}%`);
        console.log(`Volume set to: ${volume}`);
    }

    // Atualizar o volume ao mover o slider
    volumeControl.addEventListener('input', updateVolume);

    // Garantir que o valor inicial esteja correto
    updateVolume();
});
