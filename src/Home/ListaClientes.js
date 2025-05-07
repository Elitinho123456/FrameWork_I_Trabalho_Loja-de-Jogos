async function enviaBancoJogos() {
    const idInput = document.getElementById('id');
    const idNome = document.getElementById('nome');
   

    let id = idInput.value;
    let nome = idNome.value;



    const obj = {

        id,
        nome
      

    }

    try {
        const resposta = await fetch("http://localhost:5000/", {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(obj)
        }
        );

        switch (resposta.status) {

            case 404:
                alert('Algo deu errado! cliente não adicionado .');
                break;

            case 200:
                alert('cliente cadastrado com sucesso.');
                break;
              
                case 400:
                    alert('Algo deu errado na requisição, arruma ai seus gays :3.');
                    break;
               
                    default:
                alert('Erro inesperadoUwU.');
                break;

        }

    } catch (erro) {
        console.log(erro)
        alert("Erro");
    }
}
