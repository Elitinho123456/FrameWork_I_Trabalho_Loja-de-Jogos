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

    let currentActivePanel = null;

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

    window.toggleSideContent = async function(contentType) {
        mainButtons.style.display = 'none';
        listaContent.style.display = 'none';
        bibliotecaContent.style.display = 'none';

        if (contentType === 'lista') {
            listaContent.style.display = 'flex';
            currentActivePanel = listaContent;
            await carregarJogosDisponiveis();
        } else if (contentType === 'biblioteca') {
            bibliotecaContent.style.display = 'flex';
            currentActivePanel = bibliotecaContent;
            await carregarBiblioteca();
        }
    };

    window.closeSideContent = function() {
        if (currentActivePanel) {
            currentActivePanel.style.display = 'none';
            currentActivePanel = null;
        }
        mainButtons.style.display = 'flex';
    };

    async function carregarJogosDisponiveis() {
        jogosDisponiveisList.innerHTML = '<p>Carregando jogos...</p>';
        try {
            const resposta = await fetch('http://localhost:5000/jogos');
            const data = await resposta.json();

            if (resposta.ok) {
                const jogos = data.jogos;

                if (jogos && jogos.length > 0) {
                    jogosDisponiveisList.innerHTML = '';
                    const ul = document.createElement('ul');
                    ul.classList.add('jogos-list');

                    jogos.forEach(jogo => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <strong>${jogo.nome}</strong>
                            <span>Produtor: ${jogo.produtor}</span>
                            <span>Preço: R$ ${parseFloat(jogo.preco).toFixed(2).replace('.', ',')}</span>
                        `;
                        ul.appendChild(li);
                    });
                    jogosDisponiveisList.appendChild(ul);
                } else {
                    jogosDisponiveisList.innerHTML = '<p>Nenhum jogo disponível no momento.</p>';
                }
            } else {
                jogosDisponiveisList.innerHTML = `<p>Erro ao carregar jogos: ${data.error || 'Ocorreu um problema ao buscar os jogos.'}</p>`;
            }
        } catch (error) {
            console.error('Erro ao buscar jogos disponíveis:', error);
            jogosDisponiveisList.innerHTML = '<p>Não foi possível conectar ao servidor. Por favor, tente novamente mais tarde.</p>';
        }
    }

    async function carregarBiblioteca() {
        bibliotecaList.innerHTML = '<p>Carregando sua biblioteca...</p>';
        try {
            const resposta = await fetch('http://localhost:5000/biblioteca');
            const jogosComprados = await resposta.json();

            if (resposta.ok) {
                if (jogosComprados.length > 0) {
                    bibliotecaList.innerHTML = '';
                    const ul = document.createElement('ul');
                    ul.classList.add('biblioteca-list');

                    jogosComprados.forEach(jogo => {
                        const li = document.createElement('li');
                        const dataCompra = new Date(jogo.data_compra).toLocaleDateString('pt-BR');
                        const status = jogo.status_compra === 'comprado' ? 'Comprado' : jogo.status_compra;
                        li.innerHTML = `
                            <strong>${jogo.nome}</strong>
                            <span>Produtor: ${jogo.produtor}</span>
                            <span>Preço: R$ ${parseFloat(jogo.preco).toFixed(2).replace('.', ',')}</span>
                            <span>Data da Compra: ${dataCompra}</span>
                            <span>Status: ${status}</span>
                        `;
                        ul.appendChild(li);
                    });
                    bibliotecaList.appendChild(ul);
                } else {
                    bibliotecaList.innerHTML = '<p>Sua biblioteca está vazia.</p>';
                }
            } else {
                bibliotecaList.innerHTML = `<p>Erro ao carregar biblioteca: ${jogosComprados.error || 'Ocorreu um problema ao buscar sua biblioteca.'}</p>`;
            }
        } catch (error) {
            console.error('Erro ao buscar biblioteca:', error);
            bibliotecaList.innerHTML = '<p>Não foi possível conectar ao servidor. Por favor, tente novamente mais tarde.</p>';
        }
    }

    window.trataForm = async function() {
        const nome = nomeInput.value.trim();
        const preco = precoInput.value.trim();
        const produtor = produtorInput.value.trim();

        let isValid = true;

        if (!nome) {
            alert('Por favor, preencha o nome do jogo.');
            isValid = false;
        }
        if (!preco || isNaN(parseFloat(preco))) {
            alert('Por favor, insira um preço válido para o jogo.');
            isValid = false;
        }
        if (!produtor) {
            alert('Por favor, preencha o produtor do jogo.');
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        const jogoDados = {
            nome,
            preco: parseFloat(preco),
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
                compraForm.reset();
                if (currentActivePanel === bibliotecaContent) {
                    await carregarBiblioteca();
                }
            } else {
                alert(result.error || `Erro ao efetuar a compra (status: ${resposta.status}). Tente novamente.`);
            }
        } catch (error) {
            console.error('Erro na requisição de compra:', error);
            alert('Erro de comunicação com o servidor ao tentar comprar o jogo. Verifique sua conexão.');
        }
    };
});