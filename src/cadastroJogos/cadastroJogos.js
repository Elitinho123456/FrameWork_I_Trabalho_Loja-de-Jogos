async function enviaBancoJogos() {

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

    if (!preco.includes('R$')) {

        preco = `${parseFloat(preco).toFixed(2)}`;

    }

    const obj = {
        nome,
        preco,
        produtor
    }

    try {

        const resposta = await fetch("http://localhost:5000/", {

            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(obj)

        });

        switch (resposta.status) {

            case 404:
                alert('Erro: Jogo não adicionado à biblioteca.');
                break;

            case 200:
                alert('Jogo cadastrado com sucesso!');
                // Clear form
                idNome.value = '';
                idPreco.value = '';
                idProdutor.value = '';
                break;

            default:
                alert('Erro inesperado.');
                break;

        }
    } catch (erro) {

        console.error('Erro:', erro);
        alert("Erro de conexão com o servidor.");

    }
};