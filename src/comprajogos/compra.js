// compra.js

document.addEventListener('DOMContentLoaded', function () {
    const mainButtons = document.getElementById('mainButtons');
    const listaContent = document.getElementById('lista');
    const bibliotecaContent = document.getElementById('biblioteca');
    const jogosDisponiveisList = document.getElementById('jogosDisponiveisList');
    const bibliotecaList = document.getElementById('bibliotecaList');
    const compraForm = document.getElementById('compraForm');
    const nomeInput = document.getElementById('nome');
    const precoInput = document.getElementById('preco');
    const produtorInput = document.getElementById('produtor');

    const botaoMenu = document.querySelector('.botao_menu');
    const menuOpcoes = document.querySelector('.menu-opcoes');

    let currentActivePanel = null; // Rastreia o painel atualmente ativo (lista ou biblioteca)

    if (botaoMenu && menuOpcoes) {
        botaoMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            menuOpcoes.style.display = menuOpcoes.style.display === 'flex' ? 'none' : 'flex';
        });

        document.addEventListener('click', function() {
            menuOpcoes.style.display = 'none';
        });

        menuOpcoes.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Função para alternar a exibição dos conteúdos laterais (Biblioteca ou Lista de Jogos)
    window.toggleSideContent = async function(contentType) {
        // Esconde o painel atualmente ativo (se houver) instantaneamente
        if (currentActivePanel) {
            currentActivePanel.style.display = 'none';
        }

        let targetPanel;
        if (contentType === 'lista') {
            targetPanel = listaContent;
            await carregarJogosDisponiveis();
        } else if (contentType === 'biblioteca') {
            targetPanel = bibliotecaContent;
            await carregarBiblioteca();
        }

        // Mostra o novo painel instantaneamente
        if (targetPanel) {
            targetPanel.style.display = 'flex'; // Usamos flex para alinhar o conteúdo interno
            mainButtons.style.display = 'none'; // Esconde os botões principais
            currentActivePanel = targetPanel; // Atualiza o painel ativo
        }
    };

    // Função para fechar o conteúdo lateral e mostrar os botões principais
    window.closeSideContent = function() {
        if (currentActivePanel) {
            currentActivePanel.style.display = 'none'; // Esconde o painel instantaneamente
            currentActivePanel = null; // Reseta o painel ativo
        }
        mainButtons.style.display = 'flex'; // Mostra os botões principais novamente
    };

    async function carregarJogosDisponiveis() {
        jogosDisponiveisList.innerHTML = '<p>Carregando jogos...</p>';
        try {
            const resposta = await fetch('http://localhost:5000/jogos');
            if (!resposta.ok) {
                throw new Error(`Erro HTTP: ${resposta.status}`);
            }
            const dados = await resposta.json();
            if (dados.jogos && dados.jogos.length > 0) {
                jogosDisponiveisList.innerHTML = '';
                const ul = document.createElement('ul');
                ul.className = 'jogos-list';
                dados.jogos.forEach(jogo => {
                    const li = document.createElement('li');
                    const precoFormatado = parseFloat(jogo.preco).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    });
                    li.innerHTML = `
                        <h2>${jogo.nome}</h2>
                        <p><strong>Produtor:</strong> ${jogo.produtor}</p>
                        <p><strong>Preço:</strong> ${precoFormatado}</p>
                    `;
                    ul.appendChild(li);
                });
                jogosDisponiveisList.appendChild(ul);
            } else {
                jogosDisponiveisList.innerHTML = '<p>Nenhum jogo disponível no momento.</p>';
            }
        } catch (erro) {
            console.error('Falha ao carregar jogos disponíveis:', erro);
            jogosDisponiveisList.innerHTML = '<p>Não foi possível carregar os jogos disponíveis. Tente novamente mais tarde.</p>';
        }
    }

    async function carregarBiblioteca() {
        bibliotecaList.innerHTML = '<p>Carregando biblioteca...</p>';
        try {
            const resposta = await fetch('http://localhost:5000/biblioteca');
            if (!resposta.ok) {
                throw new Error(`Erro HTTP: ${resposta.status}`);
            }
            const dados = await resposta.json();
            if (dados.jogosComprados && dados.jogosComprados.length > 0) {
                bibliotecaList.innerHTML = '';
                const ul = document.createElement('ul');
                ul.className = 'biblioteca-list';
                dados.jogosComprados.forEach(jogo => {
                    const li = document.createElement('li');
                    const precoFormatado = parseFloat(jogo.preco).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    });
                    const dataCompra = new Date(jogo.data_compra).toLocaleDateString('pt-BR');
                    li.innerHTML = `
                        <h2>${jogo.nome}</h2>
                        <p><strong>Produtor:</strong> ${jogo.produtor}</p>
                        <p><strong>Preço:</strong> ${precoFormatado}</p>
                        <p><strong>Data da Compra:</strong> ${dataCompra}</p>
                        <p><strong>Status:</strong> ${jogo.status_compra}</p>
                    `;
                    ul.appendChild(li);
                });
                bibliotecaList.appendChild(ul);
            } else {
                bibliotecaList.innerHTML = '<p>Sua biblioteca está vazia.</p>';
            }
        } catch (erro) {
            console.error('Falha ao carregar biblioteca:', erro);
            bibliotecaList.innerHTML = '<p>Não foi possível carregar sua biblioteca. Tente novamente mais tarde.</p>';
        }
    }

    // Função para tratar o envio do formulário de compra
    window.trataForm = async function() {
        const nome = nomeInput.value.trim();
        const preco = precoInput.value.trim();
        const produtor = produtorInput.value.trim();

        if (!nome || !preco || !produtor) {
            alert('Por favor, preencha todos os campos do jogo.');
            return;
        }

        const jogoDados = {
            nome,
            preco: parseFloat(preco), // Garante que o preço é um número
            produtor
        };

        try {
            const resposta = await fetch('http://localhost:5000/compra', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jogoDados)
            });

            const result = await resposta.json();

            if (resposta.ok) {
                alert(result.message || 'Jogo comprado com sucesso!');
                compraForm.reset(); // Limpa o formulário após a compra
                // Se a biblioteca estiver aberta, recarrega para mostrar o novo item
                if (currentActivePanel === bibliotecaContent) {
                    await carregarBiblioteca();
                }
            } else {
                alert(result.error || `Erro ao efetuar a compra (status: ${resposta.status})`);
            }
        } catch (error) {
            console.error('Erro na requisição de compra:', error);
            alert('Erro de comunicação com o servidor. Tente novamente.');
        }
    };
});