document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formJogo');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            enviaBancoJogos();
        });
    } else {
        console.error('Formulário não encontrado! Verifique o ID do formulário.');
    }
});

async function enviaBancoJogos() {
    const form = document.getElementById('formJogo'); // Adicionado
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
            form.reset(); // Agora funciona
        } else {
            alert(`Erro: ${data.mensagem || 'Falha ao cadastrar jogo'}`);
        }
    } catch (erro) {
        console.error('Erro:', erro);
        alert("Erro de conexão com o servidor.");
    }
}