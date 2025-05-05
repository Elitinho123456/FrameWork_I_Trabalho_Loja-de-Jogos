async function trataForm() {
    const idInput = document.getElementById('id');
    const idNome = document.getElementById('nome');
    const id = idInput.value;
    const nome = idNome.value;

    const obj = {
        id,
        nome
    }

    try {
        const resposta = await fetch("http://localhost:5000/tabelas", {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(obj)
        }
        );

        if (resposta.status === 404) {
            alert("Estudante não Adicionado")
        };

        if (resposta.status === 200) {
            alert("Estudante ADICIONADO com sucesso")
        };

    } catch (erro) {
        console.log(erro)
        alert("Erro");
    }
}