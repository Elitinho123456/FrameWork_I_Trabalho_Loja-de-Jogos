// Interface para representar um cliente
interface Cliente {
    id: string;      // Aceita qualquer formato de id (número ou texto)
    nome: string;    // Aceita qualquer nome
}

// Classe para gerenciar a lista de clientes
class ListaClientes {
    private clientes: Cliente[] = [];

    // Adiciona um novo cliente à lista
    adicionarCliente(id: string, nome: string): void {
        this.clientes.push({ id, nome });
    }

    // Retornando eles
    listarClientes(): Cliente[] {
        return this.clientes;
    }
}

// usando
const lista = new ListaClientes();
lista.adicionarCliente("123", "JoãoGaymer");
lista.adicionarCliente("steam_456", "MariaPro");
lista.adicionarCliente("789xyz", "CarlosPlayer");

console.log("Clientes cadastrados:", lista.listarClientes()); // se tiver alguma duvida, não pergunte pra mim UwU
