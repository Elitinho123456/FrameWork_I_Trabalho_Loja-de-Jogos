async function trataform(){
    const idInput = document.getElementById("id")
    const idNome = document.getElementById("nome")
    const id = idInput.value
    const nome = idNome.value

    const objClientes = {
        id,
        nome
    }
    try {
    const resposta = await fetch("http://localhost:5000/Clientes",{
        headers:{
            'content-type':'application/json'
        },
        method:"POST",
        body: JSON.stringify(objClientes)
    }) 
    if(resposta.status===404){
        alert("Cliente não foi exlcuído")
    }
    if(resposta.status===400){
        const dados = await resposta.JSON()
        alert(`Deu erro do lado do servidor\n"${dados.mensagem}`)
    }
    if(resposta.status===200){
        alert("Cliente cadastrado com sucesso")
    }
    if(resposta.status===500){
        alert("O servidor ta dando problema UwU resolvao ai seus inuteis")
    }
}catch(erro){
    console.log(erro)
   alert("Deu algo errado na requisição do post!\n vocÊ ligou o backend com npm run dev?UwU")
    
}
}