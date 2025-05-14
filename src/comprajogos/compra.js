// Obtém a referência para o div principal dos botões na aside
const mainButtons = document.getElementById('mainButtons');
// Obtém a referência para o formulário
const compraForm = document.getElementById('compraForm');

// Função para mostrar a caixa de conteúdo (Lista ou Biblioteca) no aside
function showContent(id) {
    mainButtons.style.display = 'none';
    ['lista', 'biblioteca'].forEach(contentId => {
        document.getElementById(contentId).style.display = 'none';
    });
    document.getElementById(id).style.display = 'flex';
}

// Função para esconder as caixas de conteúdo no aside e mostrar os botões (aside)
function hideContent() {
    ['lista', 'biblioteca'].forEach(contentId => {
        document.getElementById(contentId).style.display = 'none';
    });
    mainButtons.style.display = 'flex';
}

// Inicializa a página exibindo o formulário e os botões principais
document.addEventListener('DOMContentLoaded', () => {
    hideContent(); // Garante que apenas os botões principais são mostrados inicialmente
    compraForm.style.display = 'flex';
});

// Função assíncrona para tratar o formulário e enviar os dados para o servidor
async function trataForm() {
    const nome = document.getElementById("nome").value;
    const preco = document.getElementById("preco").value;
    const produtor = document.getElementById("produtor").value;

    const objCompra = { nome, preco, produtor }; // Note que não inclui o id
    
    try {
        const resposta = await fetch("http://localhost:5000/compra", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(objCompra)
        });

        if (resposta.status === 404) {
            alert("Compra não realizada");
        } else if (resposta.status === 400) {
            const dados = await resposta.json();
            alert(`Deu erro no servidor:\n${dados.mensagem}`);
        } else if (resposta.status === 200) {
            alert("Compra realizada com sucesso");
            // Limpa o formulário após sucesso
            document.getElementById('compraForm').reset();
        }
    } catch (erro) {
        console.log(erro);
        alert("Erro na requisição do POST! \n Você ligou o servidor com 'npm run dev'?");
    }
}