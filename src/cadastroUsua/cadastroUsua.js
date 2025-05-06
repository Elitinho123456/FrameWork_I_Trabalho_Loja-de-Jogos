const usuaForm = document.getElementById('cadastro-usuario-form');
const usuaMessageArea = document.getElementById('user-mensage-area');

//adicione o listener no formulario

if(usuaForm){
    usuaForm.addEventListener('submit', trataFormCadastroUsua);
}

async function trataFormCadastroUsua(event) {
    usuaMessageArea.textContent = '';
    usuaMessageArea.className = '';

    const nome = nomeImput.value;
    const email = emailImput.value;
    const senha = senhaImput.value;

    if (!nome || !email || !senha) {
        displaytUsermessageArea('Por favor, preencha todos os campos.', 'error');
        return;
    }
    const usuaDados = {
        nome,
        email,
        senha
    };

    try {
        const resposta = await fetch("http://localhost:5000/Clientes");
    } catch (error) {
        
    }

}