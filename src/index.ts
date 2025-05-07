import mysql, { Connection, ConnectionOptions, QueryError } from 'mysql2/promise';
import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';


const app = fastify();
app.register(cors);

app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {

    try {

        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'framework',
            port: 3306
        });

        console.log('Login efetuado em um Database SQL');

        const [resultado, Tabela] = await conn.query('SELECT * FROM compra');
        reply.send(resultado);


        await conn.end();

    } catch (erro: any) {

        switch (erro.code) {

            case 'ER_NO_SUCH_TABLE':

                console.log("Tabela Desconhecida.");
                reply.send('ERRO: Tabela Desconhecida')
                break;

            case 'ER_PARSE_ERROR':

                console.log("Erro de sintaxe SQL");
                reply.send("ERRO: Erro de sintaxe SQL")
                break;

            case 'ECONNREFUSED':
                console.log(`Ouve um erro ao se conectar com o servidor: ${erro}`)

                console.log('Inicie o Laragon')
                reply.send("ERRO: Inicie o Laragon")
                break;

            case 'ER_BAD_DB_ERROR':
                console.log(`Ouve um erro ao se conectar com o servidor: ${erro}`)

                console.log("Erro, nome do Banco de Dados incorreto")
                reply.send("ERRO, nome do Banco de Dados incorreto")
                break;

            case 'ER_ACCESS_DENIED_ERROR':
                console.log(`Ouve um erro ao se conectar com o servidor: ${erro}`)

                console.log('Erro no Login!')
                reply.send("ERRO: Login MySql")
                break;

            default:
                console.log(`Ouve um erro: ${erro}`)

                console.log('Erro indefinido');
                reply.send("ERRO: Indefinido")
                break;
        }
    };

});

    
    app.post("/compra", async (request: FastifyRequest, reply: FastifyReply) => {
        const { id, nome ,preco,produtor } = request.body as any
        try {
            const conn = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'framework',
                port: 3306
            });
            const [existing] = await conn.query("SELECT id FROM compra WHERE id = ?", [id]);
            if ((existing as any[]).length > 0) {
                reply.status(400).send({ mensagem: "ERRO : esse id ja possui um jogo" });
                return;
            }
            const resultado = await conn.query("INSERT INTO estudantes (id,nome,preco,produtor) VALUES (?,?,?,?)", [id, nome, preco, produtor]);
            const [dados, estruturaTabela] = resultado;
            reply.status(200).send(dados);
            }
            

        
        catch (erro:any) {
    
            if (erro.code === "ECONNREFUSED") {
                console.log("ERRO: LIGUE O LARAGON")
                reply.status(400).send({ mensagem: "ERRO: LIGUE O LARAGON" })
            } else if (erro.code === "ER_BAD_DB_ERROR") {
                console.log("ERRO: CONFIRA O NOME DO BANCO DE DADOS OU CRIE UM NOVO BANCO COM O NOME QUE VOCÊ COLOCOU LÁ NA CONEXÃO")
                reply.status(400).send({ mensagem: "ERRO: CONFIRA O NOME DO BANCO DE DADOS OU CRIE UM NOVO BANCO COM O NOME QUE VOCÊ COLOCOU LÁ NA CONEXÃO" })
            } else if (erro.code === "ER_ACCESS_DENIED_ERROR") {
                console.log("ERRO: CONFIRA O USUÁRIO E SENHA NA CONEXÃO")
                reply.status(400).send({ mensagem: "ERRO: CONFIRA O USUÁRIO E SENHA NA CONEXÃO" })
            } else {
                console.log(erro)
                reply.status(400).send({ mensagem: "ERRO DESCONHECIDO OLHE O TERMINAL" })
            }
        }
    });


//Fernando - Marcação para lembrar de apresentar essa parte se for preciso...
app.post('/usuario', async (request: FastifyRequest, reply:FastifyReply)=>{

    interface usuaRequestBody{
        nome?: string;
        email?: string;
        senha?: string;
    }

    const {nome, email, senha} = request.body as usuaRequestBody;

    if (!nome || !email || !senha) {
        reply.status(400).send({mensagem: "Nome, email e senha são obrigatorios"});
        return;
    }

    let conn: Connection | null = null;
    
    try{
        conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'framework',
            port: 3306
        });

        const [emailJaExiste] = await conn.query('select id from usuario where email = ?', [email]);

        if ((emailJaExiste as any[]).length > 0) {
            reply.status(409).send({mensagem: "Email já está cadastrado."});
            await conn.end();
            return;
        }

        const [resultado] = await conn.query(
            "insert into usuario (nome, email, senha) values (?,?,?)",
            [nome, email, senha]
        );

        const insertResult = resultado as any;
        if (insertResult.affectedRows > 0) {
            console.log(`Usuário '${email}' criado com id: ${insertResult.insertId} na tabela 'usuario'.` );
            reply.status(201).send({
                mensagem: 'Usuário cadastrado com sucesso',
                usuaId: insertResult.insertId
            });
        }else {
            console.warn('Nenhuma linha afetada ao tentar criar usuário na tabela \'usuario\'.');
            reply.status(500).send({mensagem:'Falha ao criar usuário, nenhuma linha afetada.'});
        }


    }catch (erro:any){
        console.error(`Erro ao cadastrar usuário '${email}': ${erro.message}`);


        if (erro.code) {
            switch (erro.code) {
                case 'ER_DUP_ENTRY':
                    reply.status(409).send({mensagem: 'Violção de constraint única (não relacionada ao email.'});
                    break;
                case 'ECONNREFUSED':
                    console.error('Falha ao conectar ao banco: ECONNREFUSED.');
                    reply.status(503).send({ mensagem: 'Serviço indisponível. Tente novamente mais tarde.' });
                    break;
                case 'ER_BAD_DB_ERROR':
                    console.error(`Erro de banco de dados inválido: ${erro.message}.`);
                    reply.status(500).send({ mensagem: 'Erro de configuração do banco de dados.' });
                    break;
                case 'ER_ACCESS_DENIED_ERROR':
                    console.error(`Acesso negado ao banco de dados: ${erro.message}.`);
                    reply.status(500).send({ mensagem: 'Erro de autenticação com o banco de dados.' });
                    break;
                case 'ER_NO_SUCH_TABLE':
                     console.error(`A tabela não foi encontrada: ${erro.message}`); // Log mais específico
                     reply.status(500).send({ mensagem: 'Erro: Tabela de dados não encontrada.' }); // Mensagem para o usuário
                     break;
                default:
                    reply.status(500).send({ mensagem: 'Erro no banco de dados ao processar sua solicitação.' });
            }
        }else{
            reply.status(500).send({mensagem: 'Erro no banco de dados ao processar a solicitação.'});
        }
    } finally {
        if(conn){
            await conn.end();
        }
    }
})

app.listen({ port: 5000 }, (erro, address) => {
    switch (erro) {
        case null:
            console.log(`Fastify iniciado ${address}`);
            break;
        default:
            console.log('ERRO: FASTIFY was not inicialized');
            break;
    }
});