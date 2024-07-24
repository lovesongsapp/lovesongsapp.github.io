// Verifica se o usuário está autenticado
async function checkAuthentication() {
    const user = await getCurrentUser();

    if (!user) {
        showInvitation();
    } else {
        hideInvitation();
    }
}

// Obtém o usuário atual do Firebase
async function getCurrentUser() {
    const auth = getAuth(); // Obtém a instância do Auth do Firebase
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe(); // Remove o ouvinte após obter o usuário
            resolve(user);
        });
    });
}

// Mostra a div de convite
function showInvitation() {
    const invitationDiv = document.createElement('div');
    invitationDiv.id = 'invitation';
    invitationDiv.style.position = 'fixed';
    invitationDiv.style.top = '50%';
    invitationDiv.style.left = '50%';
    invitationDiv.style.transform = 'translate(-50%, -50%)';
    invitationDiv.style.backgroundColor = '#ffffff';
    invitationDiv.style.border = '1px solid #000000';
    invitationDiv.style.padding = '20px';
    invitationDiv.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    invitationDiv.style.zIndex = '1000';
    invitationDiv.style.textAlign = 'center';

    const message = document.createElement('p');
    message.textContent = 'Você precisa estar logado para assistir aos vídeos da playlist. Por favor, faça seu cadastro ou login.';
    invitationDiv.appendChild(message);

    const registerButton = document.createElement('button');
    registerButton.textContent = 'Cadastrar';
    registerButton.addEventListener('click', () => {
        window.location.href = 'login/login.html'; // Redireciona para a página de login
    });
    invitationDiv.appendChild(registerButton);

    const ignoreButton = document.createElement('button');
    ignoreButton.textContent = 'Ignorar';
    ignoreButton.addEventListener('click', () => {
        document.getElementById('invitation').style.display = 'none'; // Fecha o convite
    });
    invitationDiv.appendChild(ignoreButton);

    document.body.appendChild(invitationDiv);
}

// Oculta a div de convite
function hideInvitation() {
    const invitationDiv = document.getElementById('invitation');
    if (invitationDiv) {
        invitationDiv.style.display = 'none';
    }
}

// Inicia a verificação de autenticação quando o script é carregado
document.addEventListener('DOMContentLoaded', checkAuthentication);
