# README.md

# Projeto PWA - Player de Vídeo do YouTube

Este projeto é uma aplicação PWA (Progressive Web App) que implementa um player de vídeo do YouTube. O player é responsivo e se adapta tanto ao modo retrato quanto ao modo paisagem.

## Estrutura do Projeto

O projeto possui os seguintes arquivos:

- **index.html**: Este arquivo é o ponto de entrada da aplicação. Ele contém a estrutura básica do HTML, incluindo o iframe para o vídeo do YouTube, a lista da playlist e os controles do player.

- **css/index.css**: Este arquivo contém os estilos CSS para o projeto. Ele implementa um tema escuro e define o fundo como `#0f0f0f`. As regras de estilo garantem que o layout seja responsivo.

- **js/app.js**: Este arquivo contém a lógica JavaScript para o player. Ele gerencia a reprodução do vídeo, a atualização da barra de progresso e a interação com os controles do player.

- **manifest.json**: Este arquivo é o manifesto da aplicação PWA. Ele inclui informações como nome, ícone e configurações de exibição da aplicação.

- **sw.js**: Este arquivo é o Service Worker da aplicação. Ele é configurado para permitir que a aplicação funcione offline e gerencie o cache dos recursos.

- **fonts/Roboto-Regular.ttf**: Este arquivo é a fonte utilizada no projeto, especificamente a fonte Roboto Regular.

- **icons/**: Este diretório contém os ícones SVG que representam os controles do player, como play, pause, e outros.

## Instruções de Instalação

1. Clone o repositório ou baixe os arquivos do projeto.
2. Abra o arquivo `index.html` em um navegador compatível.
3. Para uma experiência completa, instale a aplicação como um PWA.

## Uso

- O player irá executar uma playlist do YouTube via iframe.
- A interface é dividida em duas partes: a parte superior exibe o vídeo e a parte inferior exibe a lista da playlist.
- Os controles do player são representados por ícones SVG.

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.