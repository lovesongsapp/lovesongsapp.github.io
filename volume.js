document.addEventListener('DOMContentLoaded', () => {
    const volumeIcon = document.querySelector('.volume-icon');
    const volumeSliderContainer = document.querySelector('.volume-slider-container');
    const volumeControl = document.getElementById('volume-control');
    const volumeValue = document.getElementById('volume-value');
    const audioElements = document.querySelectorAll('audio'); // Seleciona todos os elementos de áudio
    let hideTimeout;

    // Função para esconder o controle de volume
    function hideVolumeControl() {
        volumeSliderContainer.style.display = 'none';
    }

    // Função para restaurar o volume salvo
    function restoreVolume() {
        const previousVolume = localStorage.getItem('audioVolume');
        const volume = previousVolume !== null ? previousVolume : 1;
        volumeControl.value = volume * 100; // Ajusta o controle para o volume salvo (convertido para 0-100)
        volumeValue.textContent = volumeControl.value;
        audioElements.forEach(audio => {
            audio.volume = volume; // Restaura o volume do áudio
        });
    }

    // Função para salvar o volume
    function saveVolume(volume) {
        localStorage.setItem('audioVolume', volume);
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
        const volume = volumeControl.value / 100; // Converte o valor de 0-100 para 0-1
        volumeControl.style.setProperty('--slider-value', `${volumeControl.value}%`);
        volumeValue.textContent = volumeControl.value;

        // Define o volume de todos os áudios na playlist com base no valor do controle deslizante
        audioElements.forEach(audio => {
            audio.volume = volume; // Aplica o volume no áudio
        });

        // Salva o volume
        saveVolume(volume);
        
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
    restoreVolume(); // Restaura o volume salvo ao carregar a página
});
