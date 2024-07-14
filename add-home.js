// Verifica se o PWA pode ser instalado
window.addEventListener('beforeinstallprompt', (event) => {
  // Impede que o navegador mostre o aviso padrão
  event.preventDefault();
  // Salva o evento para ser usado posteriormente
  deferredPrompt = event;
  // Mostra o botão de instalação
  document.getElementById('install-button').style.display = 'block';
});

// Evento de clique para instalar o PWA
document.getElementById('install-button').addEventListener('click', () => {
  // Mostra o aviso de instalação
  deferredPrompt.prompt();
  // Aguarda o usuário responder ao aviso
  deferredPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('O usuário aceitou instalar o PWA');
    } else {
      console.log('O usuário recusou instalar o PWA');
    }
    // Limpa o evento
    deferredPrompt = null;
  });
});

// Oculta o botão de instalação após a instalação
window.addEventListener('appinstalled', () => {
  document.getElementById('install-button').style.display = 'none';
});
