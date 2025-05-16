document.addEventListener('DOMContentLoaded', function () {
    const listaJogosContainer = document.getElementById('lista-jogos-container');

    if (!listaJogosContainer) {
        console.error('Elemento container para lista de jogos não encontrado!');
        return;
    }

    async function carregarJogos() {
        try {
            const resposta = await fetch('http://localhost:5000/jogos'); // Mesma porta do seu backend

            if (!resposta.ok) {
                throw new Error(`Erro HTTP: ${resposta.status}`);
            }

            const dados = await resposta.json();

            if (dados.jogos && dados.jogos.length > 0) {
                // Limpa o container caso haja algo (ex: mensagem de "carregando")
                listaJogosContainer.innerHTML = ''; 

                const ul = document.createElement('ul');
                ul.className = 'lista-de-jogos'; // Adiciona uma classe para estilização opcional

                dados.jogos.forEach(jogo => {
                    const li = document.createElement('li');
                    li.className = 'item-jogo'; // Adiciona uma classe para estilização opcional

                    // Formata o preço para o padrão brasileiro (R$)
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
                listaJogosContainer.appendChild(ul);
            } else {
                listaJogosContainer.innerHTML = '<p>Nenhum jogo cadastrado no momento.</p>';
            }

        } catch (erro) {
            console.error('Falha ao carregar os jogos:', erro);
            listaJogosContainer.innerHTML = '<p>Não foi possível carregar os jogos. Tente novamente mais tarde.</p>';
        }
    }

    carregarJogos();
});