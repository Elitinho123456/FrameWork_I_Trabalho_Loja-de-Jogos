document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('formJogo');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            enviaBancoJogos();
        });
    } else {
        console.error('Formulário não encontrado! Verifique o ID do formulário.');
    }

    const botaoMenu = document.querySelector('.botao_menu');
    const menuOpcoes = document.querySelector('.menu-opcoes');


    if (botaoMenu && menuOpcoes) {
        botaoMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            if (menuOpcoes.style.display === 'flex') {
                menuOpcoes.style.display = 'none';
            } else {
                menuOpcoes.style.display = 'flex';
            }
        });

        document.addEventListener('click', function() {
            menuOpcoes.style.display = 'none';
        });

        menuOpcoes.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    } else {

        console.warn('Elementos do menu não encontrados. A funcionalidade do menu pode não funcionar.');

    }

});

async function enviaBancoJogos() {
    const form = document.getElementById('formJogo');
    const idNome = document.getElementById('nome');
    const idPreco = document.getElementById('preco');
    const idProdutor = document.getElementById('produtor');

    let nome = idNome.value.trim();
    let preco = idPreco.value.trim();
    let produtor = idProdutor.value.trim();

    if (!nome || !preco || !produtor) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (isNaN(parseFloat(preco))) {
        alert('Por favor, insira um valor numérico para o preço!');
        return;
    }

    preco = parseFloat(preco).toFixed(2);

    const obj = {
        nome,
        preco,
        produtor
    }

    try {
        const resposta = await fetch("http://localhost:5000/jogos", {

            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(obj)

        });

        const data = await resposta.json();

        if (resposta.ok) {

            alert('Jogo cadastrado com sucesso!');
            form.reset();

        } else {

            alert(`Erro: ${data.mensagem || 'Falha ao cadastrar jogo'}`);
        }

    } catch (erro) {
        
        console.error('Erro:', erro);
        
        let mensagemErro = 'Erro ao cadastrar jogo';
        
        if (erro instanceof TypeError && erro.message.includes('Failed to fetch')) {

            mensagemErro = 'Falha na conexão com o servidor. Verifique sua rede ou tente novamente mais tarde.';

        } else if (erro.name === 'AbortError') {

            mensagemErro = 'A requisição foi cancelada devido ao tempo de espera.';

        } else if (erro.cause) {

            switch(erro.cause.status) {

                case 400:
                    mensagemErro = 'Dados inválidos enviados ao servidor. Verifique os campos.';
                    if (erro.cause.data.mensagem) {
                        mensagemErro += ` Detalhes: ${erro.cause.data.mensagem}`;
                    }
                    break;

                case 401:
                    mensagemErro = 'Não autorizado. Você precisa estar autenticado.';
                    break;

                case 403:
                    mensagemErro = 'Acesso proibido. Você não tem permissão para esta ação.';
                    break;

                case 404:
                    mensagemErro = 'Endpoint não encontrado. O serviço pode estar indisponível.';
                    break;

                case 409:
                    mensagemErro = 'Conflito. Este jogo já pode estar cadastrado.';
                    break;

                case 413:
                    mensagemErro = 'Dados muito grandes. Reduza o tamanho dos campos.';
                    break;

                case 422:
                    mensagemErro = 'Erro de validação. Verifique os dados enviados.';
                    if (erro.cause.data.erros) {
                        mensagemErro += ` Erros: ${JSON.stringify(erro.cause.data.erros)}`;
                    }
                    break;

                case 500:
                    mensagemErro = 'Erro interno do servidor. Tente novamente mais tarde.';
                    break;

                case 501:
                    mensagemErro = 'Funcionalidade não implementada no servidor.';
                    break;

                case 503:
                    mensagemErro = 'Serviço indisponível. O servidor pode estar em manutenção.';
                    break;
                default:
                    mensagemErro = `Erro HTTP ${erro.cause.status}: ${erro.message}`;
            }
        } else {

            mensagemErro = erro.message || 'Erro desconhecido ao processar a requisição.';

        }
        
        alert(mensagemErro);

    }
}