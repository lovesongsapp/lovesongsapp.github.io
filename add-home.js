// Variável global para guardar o evento de instalação
let deferredPrompt;

// Evento disparado antes do prompt de instalação ser mostrado
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Impede o comportamento padrão
    deferredPrompt = e; // Armazena o evento para uso posterior

    // Mostra o banner de instalação após 60 segundos
    setTimeout(showInstallBanner, 60000);
});

// Função que mostra o banner de instalação
function showInstallBanner() {
    const installBanner = document.getElementById('InstallBanner');
    installBanner.style.display = 'block'; // Torna o banner visível

    // Esconde o banner automaticamente após 7 segundos
    setTimeout(hideInstallBanner, 7000);
}

// Evento de clique no botão de instalação
document.getElementById('installButton').addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt(); // Exibe o prompt nativo

        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Usuário aceitou o prompt de instalação');
            } else {
                console.log('Usuário rejeitou o prompt de instalação');
            }

            deferredPrompt = null; // Limpa a variável
            hideInstallBanner(); // Esconde o banner manualmente
        });
    }
});

// Função que esconde o banner de instalação
function hideInstallBanner() {
    const installBanner = document.getElementById('InstallBanner');
    installBanner.style.display = 'none'; // Oculta o banner
}
//BY COPILOT
