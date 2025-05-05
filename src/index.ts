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
            database: 'FramWork-B',
            port: 3306
        });

        console.log('Login efetuado em um Database SQL');

        const [resultado, Tabela] = await conn.query('SELECT * FROM alunos');
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