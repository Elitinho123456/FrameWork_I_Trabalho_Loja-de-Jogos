// Obtem as referencias para os elementos HTML usando seus IDs
const mainButtons = document.getElementById('mainButtons'); // Div que contem os botoes "Lista de Jogos" e "Biblioteca"
const compraForm = document.getElementById('compraForm'); // O formulario de compra
const jogosDisponiveisList = document.getElementById('jogosDisponiveisList'); // Div onde a lista de jogos disponiveis sera exibida
const bibliotecaList = document.getElementById('bibliotecaList'); // Div onde a lista de jogos comprados sera exibida

// Obtem as referencias para os campos de input (agora editaveis) no formulario
const inputNome = document.getElementById('nome');
const inputPreco = document.getElementById('preco');
const inputProdutor = document.getElementById('produtor');

// Os campos ocultos nao sao mais usados pela funcao trataForm, mas podem ser mantidos se necessario
// const inputJogoSelecionadoNome = document.getElementById('jogoSelecionadoNome');
// const inputJogoSelecionadoPreco = document.getElementById('jogoSelecionadoPreco');
// const inputJogoSelecionadoProdutor = document.getElementById('jogoSelecionadoProdutor');


// Funcao para mostrar uma das caixas de conteudo (Lista ou Biblioteca) na barra lateral (aside)
function showContent(id) {
    // Esconde os botoes principais
    mainButtons.style.display = 'none';
    // Itera sobre os possiveis IDs de conteudo e esconde todas as secoes
    ['lista', 'biblioteca'].forEach(contentId => {
        document.getElementById(contentId).style.display = 'none';
    });
    // Mostra a secao de conteudo cujo ID foi passado como argumento
    document.getElementById(id).style.display = 'flex';

    // Se a secao mostrada for a lista de jogos disponiveis, chama a funcao para carregar os jogos
    if (id === 'lista') {
        carregarJogosDisponiveis();
    }
     // Se a secao mostrada for a biblioteca, chama a funcao para carregar os jogos comprados (pode implementar isso buscando do backend, por enquanto usaremos a lista local)
    if (id === 'biblioteca') {
        carregarBiblioteca(); // Chamar uma funcao para carregar a biblioteca
    }
}

// Funcao para esconder as caixas de conteudo na barra lateral e mostrar os botoes principais novamente
function hideContent() {
    // Esconde todas as secoes de conteudo
    ['lista', 'biblioteca'].forEach(contentId => {
        document.getElementById(contentId).style.display = 'none';
    });
    // Mostra a div que contem os botoes principais
    mainButtons.style.display = 'flex';
}

// Adiciona um listener para o evento 'DOMContentLoaded'
// Garante que o script so seja executado depois que o DOM estiver completamente carregado.
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a pagina escondendo as secoes de conteudo e mostrando apenas os botoes principais
    hideContent();
    // Garante que o formulario de compra esteja visivel ao carregar a pagina
    compraForm.style.display = 'flex';
});

// --- Funcoes para a Lista de Jogos Disponiveis ---

// Funcao assincrona para buscar a lista de jogos disponiveis do backend e exibi-la na pagina
async function carregarJogosDisponiveis() {
    try {
        // Faz uma requisicao GET para a rota /jogos-disponiveis do backend
        const resposta = await fetch("http://localhost:5000/jogos-disponiveis");

        // Verifica se a resposta da requisicao foi bem sucedida (status code 200-299)
        if (!resposta.ok) {
            // Lanca um erro se a resposta nao for OK, incluindo o status da resposta
            throw new Error(`Erro ao carregar jogos disponiveis: ${resposta.status}`);
        }

        // Converte a resposta para JSON. Espera-se um array de objetos de jogos.
        const jogos = await resposta.json();

        // Limpa o conteudo atual da lista de jogos disponiveis na pagina
        jogosDisponiveisList.innerHTML = '';

        // Verifica se ha jogos para exibir
        if (jogos.length === 0) {
            // Exibe uma mensagem se nenhum jogo for encontrado
            jogosDisponiveisList.innerHTML = '<p>Nenhum jogo disponivel no momento.</p>';
            return; // Sai da funcao se nao houver jogos
        }

        // Itera sobre o array de jogos e cria elementos HTML para cada uno
        jogos.forEach(jogo => {
            // Cria uma div para representar um item de jogo na lista
            const jogoElement = document.createElement('div');
            // Adiciona uma classe CSS para estilizacao (definida em compra.css)
            jogoElement.classList.add('jogo-item');

            // Define o conteudo HTML do elemento do jogo, exibindo nome, preco e produtor
            jogoElement.innerHTML = `
                <h4>${jogo.nome}</h4>
                <p>Preco: R$ ${parseFloat(jogo.preco).toFixed(2)}</p> <p>Produtor: ${jogo.produtor}</p>
                <button class="btn-selecionar-jogo">Selecionar para Comprar</button> `;

            // Adiciona um evento de clique ao botao "Selecionar para Comprar"
            const selectButton = jogoElement.querySelector('.btn-selecionar-jogo');
            // Quando clicado, chama a funcao selecionarJogoParaCompra com os dados do jogo
            selectButton.addEventListener('click', () => selecionarJogoParaCompra(jogo));

            // Adiciona o elemento do jogo criado a div que exibe a lista de jogos disponiveis na pagina
            jogosDisponiveisList.appendChild(jogoElement);
        });

    } catch (erro) {
        // Captura e loga erros que ocorrerem durante a requisicao ou processamento
        console.error("Erro ao carregar jogos disponiveis:", erro);
        // Exibe uma mensagem de erro na interface do usuario
        jogosDisponiveisList.innerHTML = '<p>Erro ao carregar jogos. Tente novamente mais tarde.</p>';
    }
}

// Funcao para selecionar um jogo da lista de disponiveis e preencher os campos editaveis do formulario de compra
function selecionarJogoParaCompra(jogo) {
    // Preenche os campos de input visiveis do formulario com os dados do jogo selecionado
    inputNome.value = jogo.nome;
    // Remove o "R$" e formata o preco para o valor numerico para o input
    inputPreco.value = parseFloat(jogo.preco).toFixed(2);
    inputProdutor.value = jogo.produtor;

    // Opcional: Rola a pagina suavemente para a area do formulario de compra
    compraForm.scrollIntoView({ behavior: 'smooth' });
}


// --- Funcoes para a Compra de Jogos ---

// Funcao assincrona para tratar a submissao do formulario de compra
async function trataForm() {
    // Obtem os valores digitados nos campos de input visiveis do formulario
    const nome = inputNome.value.trim(); // .trim() remove espacos em branco extras
    const preco = inputPreco.value.trim();
    const produtor = inputProdutor.value.trim();

    // Adiciona validacao client-side para campos vazios
    if (!nome || !preco || !produtor) {
        alert('Por favor, preencha todos os campos!');
        return; // Impede o envio se algum campo estiver vazio
    }

    // Adiciona validacao client-side para verificar se o preco e um numero valido
    const precoNumerico = parseFloat(preco);
    if (isNaN(precoNumerico)) {
        alert('Por favor, insira um valor numerico valido para o preco!');
        return; // Impede o envio se o preco nao for um numero
    }

    // Cria um objeto com os dados da compra a ser enviado para o backend
    // Usa o valor numerico do preco
    const objCompra = { nome, preco: precoNumerico, produtor };

    try {
        // Envia uma requisicao POST para a rota /compra do backend
        const resposta = await fetch("http://localhost:5000/compra", {
            method: "POST", // Metodo HTTP POST
            headers: { 'Content-Type': 'application/json' }, // Cabecalho indicando que o corpo e JSON
            body: JSON.stringify(objCompra) // Converte o objeto JavaScript para uma string JSON
        });

        // Tenta parsear a resposta do servidor como JSON para obter a mensagem (se houver)
        const dados = await resposta.json();

        // Lida com os diferentes status de resposta do servidor
        if (resposta.ok) { // status code 200-299 indica sucesso
            // Exibe uma mensagem de sucesso (usa a mensagem do backend se disponivel, senao uma padrao)
            alert(dados.mensagem || "Compra realizada com sucesso!");
            // Adiciona o jogo comprado a lista exibida na secao da biblioteca
            // Passa os dados do jogo para a funcao que lida com a exibicao na biblioteca
            adicionarJogoNaBiblioteca({ nome: nome, preco: precoNumerico, produtor: produtor }); // Usa precoNumerico
            // Limpa os campos do formulario apos uma compra bem-sucedida
            limparFormularioCompra();

        } else if (resposta.status === 400) {
             // status code 400 indica um erro na requisicao do cliente (ex: jogo ja comprado, validacao falhou no backend)
             // Exibe a mensagem de erro retornada pelo backend
             alert(`Erro: ${dados.mensagem}`);
        } else if (resposta.status === 404) {
            // status code 404 indica que o recurso solicitado nao foi encontrado (ex: jogo nao existe na lista de disponiveis no backend)
             alert(`Erro na compra: ${dados.mensagem}`);
        }
         else {
            // Lida com outros status de erro nao especificados
            // Exibe a mensagem do backend ou o texto do status da resposta
            alert(`Erro ao processar a compra: ${dados.mensagem || resposta.statusText}`);
        }
    } catch (erro) {
        // Captura erros que ocorrem durante a requisicao (ex: servidor offline, erro de rede)
        console.error("Erro na requisicao do POST de compra:", erro);
        // Exibe uma mensagem de erro generica para o usuario
        alert("Erro ao comunicar com o servidor. Verifique se o servidor esta em execucao e tente novamente.");
    }
}

// Funcao para limpar os campos do formulario de compra
function limparFormularioCompra() {
    inputNome.value = '';
    inputPreco.value = '';
    inputProdutor.value = '';
}

// --- Funcoes para a Sua Biblioteca de Jogos ---

// Array para armazenar os jogos comprados na sessao atual do navegador.
// NOTA: Esta lista e temporaria. Para persistir a biblioteca entre sessoes,
// seria necessario buscar os jogos comprados do backend ao carregar a pagina da biblioteca.
let jogosComprados = [];

// Funcao para adicionar um jogo comprado a lista exibida na secao "Sua Biblioteca de Jogos"
function adicionarJogoNaBiblioteca(jogo) {
    // Adiciona o jogo ao array local de jogos comprados (para demonstracao)
    jogosComprados.push(jogo);

    // Cria um novo elemento div para representar o jogo na biblioteca
    const jogoElement = document.createElement('div');
    // Adiciona uma classe CSS para estilizacao
    jogoElement.classList.add('jogo-biblioteca-item');

    // Define o conteudo HTML do elemento do jogo na biblioteca
     jogoElement.innerHTML = `
        <h4>${jogo.nome}</h4>
        <p>Produtor: ${jogo.produtor}</p>
        `;

    // Adiciona o novo elemento do jogo a div que exibe a lista da biblioteca na pagina
    bibliotecaList.appendChild(jogoElement);
}\

// Funcao para carregar e exibir os jogos na secao "Sua Biblioteca de Jogos"
// Atualmente, exibe os jogos do array local 'jogosComprados'.
// Para persistencia real, esta funcao deveria buscar os jogos comprados do backend
// (criando uma nova rota GET no index.ts para buscar jogos da tabela 'compra').
function carregarBiblioteca() {
    // Limpa o conteudo atual da lista da biblioteca na pagina antes de exibir os jogos
    bibliotecaList.innerHTML = '';

    // Verifica se ha jogos no array de jogos comprados
    if (jogosComprados.length === 0) {
        // Exibe uma mensagem se a biblioteca estiver vazia
        bibliotecaList.innerHTML = '<p>Sua biblioteca esta vazia.</p>';
        return; // Sai da funcao se nao houver jogos
    }

     // Itera sobre o array de jogos comprados e cria elementos HTML para cada um
    jogosComprados.forEach(jogo => {
        // Cria um novo elemento div para representar o jogo na biblioteca
        const jogoElement = document.createElement('div');
        // Adiciona uma classe CSS para estilizacao
        jogoElement.classList.add('jogo-biblioteca-item');

         // Define o conteudo HTML do elemento do jogo na biblioteca
         jogoElement.innerHTML = `
            <h4>${jogo.nome}</h4>
            <p>Produtor: ${jogo.produtor}</p>
            `;

        // Adiciona o novo elemento do jogo a div que exibe a lista da biblioteca na pagina
        bibliotecaList.appendChild(jogoElement);
    });
}