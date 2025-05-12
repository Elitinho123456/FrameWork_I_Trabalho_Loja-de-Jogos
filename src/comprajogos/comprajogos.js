// Obtém a referência para o div principal dos botões na aside
const mainButtons = document.getElementById('mainButtons');
// Obtém a referência para o formulário
const compraForm = document.getElementById('compraForm');

// Função para mostrar a caixa de conteúdo (Lista ou Biblioteca) no aside
function showContent(id) {
    mainButtons.style.display = 'none'; // Esconde os botões principais
    ['lista', 'biblioteca'].forEach(contentId => {
        document.getElementById(contentId).style.display = 'none'; // Esconde todas as divs de conteúdo
    });
    document.getElementById(id).style.display = 'flex'; // Mostra a div de conteúdo selecionada
    // O formulário de compra permanece visível por padrão em 'main'
}

// Função para esconder as caixas de conteúdo no aside e mostrar os botões principais
function hideContentAndShowMain() {
    ['lista', 'biblioteca'].forEach(contentId => {
        document.getElementById(contentId).style.display = 'none'; // Esconde as divs de conteúdo
    });
    mainButtons.style.display = 'flex'; // Mostra os botões principais
    // O formulário de compra permanece visível por padrão em 'main'
}

// Função para o botão "Voltar" do cabeçalho, retorna ao estado principal
function showMainContent() {
    hideContentAndShowMain(); // Garante que a aside esteja no estado principal (botões visíveis)
    compraForm.style.display = 'flex'; // Garante que o formulário de compra esteja visível
}

// Inicializa a página exibindo o formulário e os botões principais na aside
document.addEventListener('DOMContentLoaded', () => {
    hideContentAndShowMain(); // Define o estado inicial: mostra os botões principais na aside e esconde as divs de conteúdo
    compraForm.style.display = 'flex'; // Garante que o formulário de compra esteja visível no início

    // Removidos os event listeners redundantes, pois os atributos onclick são usados no HTML
});

// Função assíncrona para tratar o formulário e enviar os dados para o servidor
async function trataForm() {
    const nome = document.getElementById("nome").value;
    const preco = document.getElementById("preco").value;
    const produtor = document.getElementById("produtor").value;

    const objCompra = { nome, preco, produtor };

    try {
        const resposta = await fetch("http://localhost:5000/compra", {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST",
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