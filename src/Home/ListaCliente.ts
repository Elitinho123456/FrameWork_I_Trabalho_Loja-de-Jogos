interface Cliente {
    id: string;      
    nome: string;  
}


class ListaClientes {
    private clientes: Cliente[] = [];

    
    adicionarCliente(id: string, nome: string): void {
        this.clientes.push({ id, nome });
    }

  
    listarClientes(): Cliente[] {
        return this.clientes;
    }
}


const lista = new ListaClientes();
lista.adicionarCliente("123", "JoãoGaymer");
lista.adicionarCliente("steam_456", "MariaPro");
lista.adicionarCliente("789xyz", "CarlosPlayer");

console.log("Clientes cadastrados:", lista.listarClientes()); // se tiver alguma duvida, não pergunte pra mim UwU
