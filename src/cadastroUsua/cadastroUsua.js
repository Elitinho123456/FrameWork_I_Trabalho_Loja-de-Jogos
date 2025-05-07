const usuaForm = document.getElementById('cadastro-usuario-form');
const usuaMessageArea = document.getElementById('user-message-area');

const emailImput = document.getElementById('email');
const nomeImput = document.getElementById('nome');
const senhaImput = document.getElementById('senha');

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
        displayUsuamessageArea('Por favor, preencha todos os campos.', 'error');
        return;
    }
    const usuaDados = {
        nome,
        email,
        senha
    };

    try {
        const resposta = await fetch("http://localhost:5000/usuario", {
            method: "POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuaDados)
        });
        const result = await resposta.json();

        if(resposta.ok){
            displayUsuamessageArea(result.message || "Usuário ADICIONADO com sucesso!!", 'success');
            usuaForm.reset();
        }else{
            displayUsuamessageArea(result.error || `Erro ao adicionar usuário (status: ${resposta.status})`, 'error');
        }
        
    } catch (erro) {
        console.error("Erro na requisição:", erro),
        displayUsuamessageArea("Erro de comunicação com o servidor. Tente novamente.", 'error');
    }

}

function displayUsuamessageArea(message, type){
    usuaMessageArea.textContent = message;
    usuaMessageArea.className = type;
}