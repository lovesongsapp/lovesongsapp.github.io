// Função para monitorar a presença do botão de pular anúncio
        function monitorAdSkipButton() {
            const originalSkipButton = document.querySelector('.ytp-ad-skip-button');
            const customSkipButton = document.getElementById('customSkipButton');

            if (originalSkipButton) {
                // Exibe o ícone personalizado quando o botão original aparecer
                customSkipButton.style.display = 'block';

                // Adiciona um evento de clique ao ícone personalizado para pular o anúncio
                customSkipButton.onclick = function() {
                    originalSkipButton.click();
                    customSkipButton.style.display = 'none'; // Esconde o ícone após clicar
                };
            } else {
                // Esconde o ícone personalizado quando o botão original não estiver visível
                customSkipButton.style.display = 'none';
            }
        }

        // Verifica continuamente a presença do botão de pular anúncio
        setInterval(monitorAdSkipButton, 1000);
