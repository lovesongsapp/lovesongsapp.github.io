document.addEventListener('DOMContentLoaded', function () {
    const volumeControl = document.getElementById('volume-control');
    const volumeValueDisplay = document.getElementById('volume-value');

    function updateVolume() {
        const volume = volumeControl.value;
        volumeValueDisplay.textContent = volume;
        volumeControl.style.setProperty('--slider-value', `${volume}%`);
        console.log(`Volume set to: ${volume}`);
        // Aqui você pode adicionar lógica para ajustar o volume de áudio/vídeo
    }

    // Atualizar o volume ao mover o slider
    volumeControl.addEventListener('input', updateVolume);

    // Garantir que o valor inicial esteja correto
    updateVolume();
});
