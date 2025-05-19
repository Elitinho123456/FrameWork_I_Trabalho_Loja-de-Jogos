import mysql, { Connection } from 'mysql2/promise';
import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
//biblioteca importada para os token
import jwt from 'jsonwebtoken';

const app = fastify();
app.register(cors);


const getConnection = () =>
  mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'framework',
    port: 3306,
  });

app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const conn = await getConnection();

    console.log('Login efetuado no banco de dados MySQL');

    const [resultadoCompra] = await conn.query('SELECT * FROM compra');
    const [resultadoUsuario] = await conn.query('SELECT * FROM usuario');

    await conn.end();

    reply.send({ compras: resultadoCompra, usuarios: resultadoUsuario });
  } catch (erro: any) {
    handleDatabaseError(erro, reply);
  }
});


// Rota GET adicionada para buscar todos os jogos disponíveis na tabela 'jogos'
app.get('/jogos-disponiveis', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Estabelece a conexão com o banco de dados
    const conn = await getConnection();

    // Seleciona todos os campos de todos os registros na tabela 'jogos'
    const [jogosDisponiveis] = await conn.query('SELECT * FROM jogos');

    // Fecha a conexão com o banco de dados
    await conn.end();

    // Envia a lista de jogos disponíveis como resposta
    reply.send(jogosDisponiveis);
  } catch (erro: any) {
    // Trata erros de banco de dados usando a função auxiliar
    handleDatabaseError(erro, reply);
  }
});
// Rota POST para realizar a compra de um jogo
// Esta rota foi modificada para verificar se o jogo já foi comprado antes de inserir na tabela 'compra'.
app.post('/compra', async (request: FastifyRequest, reply: FastifyReply) => {
    // Extrai nome, preco e produtor do corpo da requisição
    // Espera que o corpo da requisição seja um objeto com essas propriedades.
    const { nome, preco, produtor } = request.body as {
      nome: string;
      preco: number; // Espera que o preço venha como número
      produtor: string;
    };

    // Validação inicial dos campos obrigatórios
    if (!nome || preco === undefined || produtor === undefined) {
      return reply.status(400).send({ mensagem: 'Nome, preco e produtor são obrigatórios.' });
    }

    // Valida se o preço é um número válido
    if (isNaN(parseFloat(preco.toString()))) { // Converte para string para garantir parseFloat
      return reply.status(400).send({ mensagem: 'O preço deve ser um valor numérico válido.' });
    }


    try {
      // Estabelece a conexão com o banco de dados
      const conn = await getConnection();

      // Comentário: Verificar se o jogo a ser comprado existe na tabela 'jogos'.
      // É importante garantir que apenas jogos cadastrados na lista principal possam ser comprados.
      const [jogoExistente] = await conn.query(
        'SELECT * FROM jogos WHERE nome = ?',
        [nome]
      );

      // Se o jogo não existir na tabela 'jogos' (lista de jogos disponíveis), retorna um erro 404.
      if ((jogoExistente as any[]).length === 0) {
          await conn.end();
          return reply.status(404).send({
              mensagem: `Erro: Jogo '${nome}' não encontrado na lista de jogos disponíveis para compra.`
          });
      }


      // Comentário: Verifica se o jogo com este nome já foi comprado consultando a tabela 'compra'.
      // Isso impede compras duplicadas do mesmo jogo para o mesmo usuário (simplificado - não há controle de usuário aqui).
      const [existing] = await conn.query(
        'SELECT nome FROM compra WHERE nome = ?',
        [nome]
      );

      // Se já existir um registro com o mesmo nome na tabela 'compra', significa que já foi comprado.
      if ((existing as any[]).length > 0) {
        // Fecha a conexão antes de retornar
        await conn.end();
        // Retorna uma mensagem de erro 400 indicando que o item já foi comprado.
        return reply.status(400).send({
          mensagem: `Erro: O jogo '${nome}' já foi comprado.`
        });
      }

      // Comentário: Insere os dados do jogo na tabela 'compra' para registrar a compra.
      // Um campo de ID auto-incrementado é recomendado para identificar cada compra unicamente.
      const [resultado] = await conn.query(
        'INSERT INTO compra (nome, preco, produtor) VALUES (?, ?, ?)',
        [nome, preco, produtor]
      );

      // Fecha a conexão após a operação
      await conn.end();
      // Retorna sucesso (status 201 - Created) e os dados do resultado da inserção.
      reply.status(201).send({
        mensagem: 'Compra realizada com sucesso.',
        dados: resultado
      });
    } catch (erro: any) {
      // Trata erros de banco de dados usando a função auxiliar
      handleDatabaseError(erro, reply);
    }
  });

app.post('/usuario', async (request: FastifyRequest, reply: FastifyReply) => {
  const { nome, email, senha } = request.body as {
    nome?: string;
    email?: string;
    senha?: string;
  };

  if (!nome || !email || !senha) {
    return reply.status(400).send({ mensagem: 'Nome, email e senha são obrigatórios.' });
  }

  let conn: Connection | null = null;

  try {
    conn = await getConnection();

    const [emailJaExiste] = await conn.query('SELECT id FROM usuario WHERE email = ?', [email]);

    if ((emailJaExiste as any[]).length > 0) {
      await conn.end();
      return reply.status(409).send({ mensagem: 'Email já está cadastrado.' });
    }

    const [resultado]: any = await conn.query(
      'INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha]
    );

    reply.status(201).send({
      mensagem: 'Usuário cadastrado com sucesso',
      usuaId: resultado.insertId,
    });
  } catch (erro: any) {
    handleDatabaseError(erro, reply);
  } finally {
    if (conn) await conn.end();
  }
});

// Adicione esta nova rota após as outras rotas POST
app.get('/usuarios', async (request: FastifyRequest, reply: FastifyReply) => {
  let conn: Connection | null = null;
  try {
    conn = await getConnection();
    const [usuarios] = await conn.query('SELECT id, nome, email FROM usuario');
    reply.send({ usuarios });
  } catch (erro: any) {
    handleDatabaseError(erro, reply);
  } finally {
    if (conn) await conn.end();
  }
});

app.post('/jogos', async (request: FastifyRequest, reply: FastifyReply) => {
  const { nome, preco, produtor } = request.body as {
    nome?: string;
    preco?: string;
    produtor?: string;
  };

  // Validação dos campos obrigatórios
  if (!nome || !preco || !produtor) {
    return reply.status(400).send({ mensagem: 'Nome, preço e produtor são obrigatórios.' });
  }

  // Validação do formato do preço
  const precoNumerico = parseFloat(preco);
  if (isNaN(precoNumerico)) {
    return reply.status(400).send({ mensagem: 'O preço deve ser um valor numérico.' });
  }

  let conn: Connection | null = null;

  try {
    conn = await getConnection();

    // Verifica se o jogo já existe (opcional)
    const [jogoExistente] = await conn.query(
      'SELECT id FROM jogos WHERE nome = ? AND produtor = ?',
      [nome, produtor]
    );

    if ((jogoExistente as any[]).length > 0) {
      return reply.status(409).send({ mensagem: 'Jogo já cadastrado na biblioteca.' });
    }

    // Insere o novo jogo
    const [resultado]: any = await conn.query(
      'INSERT INTO jogos (nome, preco, produtor) VALUES (?, ?, ?)',
      [nome, precoNumerico, produtor]
    );

    reply.status(201).send({
      mensagem: 'Jogo cadastrado com sucesso',
      jogoId: resultado.insertId,
    });
  } catch (erro: any) {
    handleDatabaseError(erro, reply);
  } finally {
    if (conn) await conn.end();
  }
});

function handleDatabaseError(error: any, reply: FastifyReply) {
  const logPrefix = 'Erro no banco de dados:';

  switch (error.code) {
    case 'ER_NO_SUCH_TABLE':
      console.error(`${logPrefix} Tabela não encontrada.`);
      reply.status(500).send({ mensagem: 'Tabela não encontrada.' });
      break;
    case 'ER_PARSE_ERROR':
      console.error(`${logPrefix} Erro de sintaxe SQL.`);
      reply.status(500).send({ mensagem: 'Erro de sintaxe SQL.' });
      break;
    case 'ECONNREFUSED':
      console.error(`${logPrefix} Conexão recusada. Verifique se o MySQL/Laragon está em execução.`);
      reply.status(503).send({ mensagem: 'Serviço indisponível. Verifique a conexão com o banco.' });
      break;
    case 'ER_BAD_DB_ERROR':
      console.error(`${logPrefix} Banco de dados não existe.`);
      reply.status(500).send({ mensagem: 'Nome do banco de dados incorreto.' });
      break;
    case 'ER_ACCESS_DENIED_ERROR':
      console.error(`${logPrefix} Usuário ou senha inválidos.`);
      reply.status(401).send({ mensagem: 'Usuário ou senha do banco inválidos.' });
      break;
    case 'ER_DUP_ENTRY':
      console.error(`${logPrefix} Duplicidade de dados.`);
      reply.status(409).send({ mensagem: 'Dados duplicados.' });
      break;
    default:
      console.error(`${logPrefix} ${error.message || error}`);
      reply.status(500).send({ mensagem: 'Erro interno no servidor.' });
  }
}

// Nova rota para listar os jogos
app.get('/jogos', async (request: FastifyRequest, reply: FastifyReply) => {
  let conn: Connection | null = null;
  try {
    conn = await getConnection();
    // Seleciona todos os campos da tabela 'jogos'
    const [jogos] = await conn.query('SELECT id, nome, preco, produtor FROM jogos');
    reply.send({ jogos });
  } catch (erro: any) {
    handleDatabaseError(erro, reply);
  } finally {
    if (conn) await conn.end();
  }
});

app.listen({ port: 5000 }, (erro, address) => {
  if (erro) {
    console.log('Erro: Fastify não foi iniciado', erro);
  } else {
    console.log(`Fastify iniciado em ${address}`);
  }
});
