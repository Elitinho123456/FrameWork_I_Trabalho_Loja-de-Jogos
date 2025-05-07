async function trataForm(){
    const idnome = document.getElementById("nome");
    const idpreco = document.getElementById("preço");
    const idprodutor = document.getElementById("produtor");
    const nome = idnome.value
    const preco = idpreco.value
    const produtor = idprodutor.value

    const objCompra = {
        nome,
        preco,
        produtor
    }
    try{
        const resposta = await fetch("http://localhost:5000/compra", {
            headers:{
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(objCompra)
        })
        if (resposta.status === 404){
            alert("Compra não realizada")
        }
        if (resposta.status === 400){
            const dados = await resposta.json()
            alert(`Deu erro no servidor:\n${dados.mensagem}`)
        }
        if (resposta.status === 200){
            alert("Compra realizada com sucesso")
        }
    }catch(erro){
        console.log(erro)
        alert("Erro na requisição do POST! \n Você ligou o servidor com 'npm run dev'?")
    }
}