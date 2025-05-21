import mysql, { Connection } from 'mysql2/promise';
import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';

const app = fastify();
app.register(cors);

const getConnection = (): Promise<Connection> =>
  mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'framework',
    port: 3306,
  });

app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
  let conn: Connection | null = null;
  try {
    conn = await getConnection();
    console.log('Conectado ao banco de dados MySQL');

    const [resultadoCompra] = await conn.query('SELECT * FROM compra');
    const [resultadoUsuario] = await conn.query('SELECT * FROM usuario');
    const [resultadoJogos] = await conn.query('SELECT * FROM jogos');

    reply.send({
      mensagem: 'Servidor Fastify está online e conectado ao banco de dados.',
      compras: resultadoCompra,
      usuarios: resultadoUsuario,
      jogos: resultadoJogos
    });
  } catch (erro: any) {
    handleDatabaseError(erro, reply);
  } finally {
    if (conn) await conn.end();
  }
});

app.get('/jogos', async (request: FastifyRequest, reply: FastifyReply) => {
  let conn: Connection | null = null;
  try {
    conn = await getConnection();
    const [jogos] = await conn.query('SELECT id, nome, preco, produtor FROM jogos');
    reply.send({ jogos });
  } catch (erro: any) {
    handleDatabaseError(erro, reply);
  } finally {
    if (conn) await conn.end();
  }
});

app.get('/jogos-disponiveis', async (request: FastifyRequest, reply: FastifyReply) => {
  let conn: Connection | null = null;
  try {
    conn = await getConnection();
    const [jogosDisponiveis] = await conn.query('SELECT * FROM jogos');
    reply.send(jogosDisponiveis);
  } catch (erro: any) {
    handleDatabaseError(erro, reply);
  } finally {
    if (conn) await conn.end();
  }
});

app.post('/compra', async (request: FastifyRequest, reply: FastifyReply) => {
    const { nome, preco, produtor } = request.body as {
      nome: string;
      preco: number;
      produtor: string;
    };

    if (!nome || preco === undefined || produtor === undefined) {
      return reply.status(400).send({ mensagem: 'Nome, preço e produtor são obrigatórios.' });
    }

    const precoNumerico = parseFloat(preco.toString());
    if (isNaN(precoNumerico)) {
      return reply.status(400).send({ mensagem: 'O preço deve ser um valor numérico válido.' });
    }

    let conn: Connection | null = null;

    try {
      conn = await getConnection();

      const [jogoExistente] = await conn.query(
        'SELECT id FROM jogos WHERE nome = ?',
        [nome]
      );

      if ((jogoExistente as any[]).length === 0) {
          return reply.status(404).send({
              mensagem: `Erro: Jogo '${nome}' não encontrado na lista de jogos disponíveis para compra.`
          });
      }

      const [existingComprado] = await conn.query(
        'SELECT id FROM comprado WHERE nome = ?',
        [nome]
      );

      if ((existingComprado as any[]).length > 0) {
        return reply.status(400).send({
          mensagem: `Erro: O jogo '${nome}' já foi comprado e está na sua biblioteca.`
        });
      }

      const [resultado]: any = await conn.query(
        'INSERT INTO comprado (nome, preco, produtor) VALUES (?, ?, ?)',
        [nome, precoNumerico, produtor]
      );

      reply.status(201).send({
        mensagem: 'Compra realizada com sucesso e jogo adicionado à sua biblioteca!',
        idComprado: resultado.insertId
      });
    } catch (erro: any) {
      handleDatabaseError(erro, reply);
    } finally {
      if (conn) await conn.end();
    }
});

app.post('/usuario', async (request: FastifyRequest, reply: FastifyReply) => {
  const { nome, email, senha } = request.body as {
    nome?: string;
    email?: string;
    senha?: string;
  };

  if (!nome || !email || !senha) {
    return reply.status(400).send({ mensagem: 'Nome, email e senha são obrigatórios para o cadastro.' });
  }

  let conn: Connection | null = null;

  try {
    conn = await getConnection();

    const [emailJaExiste] = await conn.query('SELECT id FROM usuario WHERE email = ?', [email]);

    if ((emailJaExiste as any[]).length > 0) {
      return reply.status(409).send({ mensagem: 'Erro: Este endereço de email já está cadastrado.' });
    }

    const [resultado]: any = await conn.query(
      'INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha]
    );

    reply.status(201).send({
      mensagem: 'Usuário cadastrado com sucesso!',
      usuaId: resultado.insertId,
    });
  } catch (erro: any) {
    handleDatabaseError(erro, reply);
  } finally {
    if (conn) await conn.end();
  }
});

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

  if (!nome || !preco || !produtor) {
    return reply.status(400).send({ mensagem: 'Nome, preço e produtor são obrigatórios para cadastrar o jogo.' });
  }

  const precoNumerico = parseFloat(preco);
  if (isNaN(precoNumerico)) {
    return reply.status(400).send({ mensagem: 'O preço do jogo deve ser um valor numérico válido.' });
  }

  let conn: Connection | null = null;

  try {
    conn = await getConnection();

    const [jogoExistente] = await conn.query(
      'SELECT id FROM jogos WHERE nome = ? AND produtor = ?',
      [nome, produtor]
    );

    if ((jogoExistente as any[]).length > 0) {
      return reply.status(409).send({ mensagem: 'Erro: Este jogo já está cadastrado na loja.' });
    }

    const [resultado]: any = await conn.query(
      'INSERT INTO jogos (nome, preco, produtor) VALUES (?, ?, ?)',
      [nome, precoNumerico, produtor]
    );

    reply.status(201).send({
      mensagem: 'Jogo cadastrado com sucesso na loja!',
      jogoId: resultado.insertId,
    });
  } catch (erro: any) {
    handleDatabaseError(erro, reply);
  } finally {
    if (conn) await conn.end();
  }
});

app.get('/biblioteca', async (request: FastifyRequest, reply: FastifyReply) => {
  let conn: Connection | null = null;
  try {
    conn = await getConnection();
    const [jogosComprados] = await conn.query('SELECT id, nome, preco, produtor, data_compra, status_compra FROM comprado');
    reply.send({ jogosComprados });
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
      console.error(`${logPrefix} Tabela não encontrada.`, error.message);
      reply.status(500).send({ mensagem: 'Erro interno: Tabela do banco de dados não encontrada. Contate o suporte.' });
      break;
    case 'ER_PARSE_ERROR':
      console.error(`${logPrefix} Erro de sintaxe SQL.`, error.message);
      reply.status(500).send({ mensagem: 'Erro interno: Sintaxe SQL inválida no servidor. Contate o suporte.' });
      break;
    case 'ECONNREFUSED':
      console.error(`${logPrefix} Conexão recusada. Verifique se o servidor MySQL está em execução e acessível.`, error.message);
      reply.status(503).send({ mensagem: 'Serviço indisponível: Não foi possível conectar ao banco de dados. Tente novamente mais tarde.' });
      break;
    case 'ER_BAD_DB_ERROR':
      console.error(`${logPrefix} Banco de dados não existe.`, error.message);
      reply.status(500).send({ mensagem: 'Erro interno: O banco de dados especificado não existe ou está incorreto. Contate o suporte.' });
      break;
    case 'ER_ACCESS_DENIED_ERROR':
      console.error(`${logPrefix} Usuário ou senha inválidos.`, error.message);
      reply.status(401).send({ mensagem: 'Erro de autenticação: Credenciais de acesso ao banco de dados inválidas no servidor.' });
      break;
    case 'ER_DUP_ENTRY':
      console.error(`${logPrefix} Duplicidade de dados.`, error.message);
      reply.status(409).send({ mensagem: 'Erro de conflito: Este registro já existe no sistema.' });
      break;
    default:
      console.error(`${logPrefix} Erro não tratado:`, error);
      reply.status(500).send({ mensagem: 'Erro interno no servidor. Por favor, tente novamente ou contate o suporte.' });
  }
}

app.listen({ port: 5000 }, (erro, address) => {
  if (erro) {
    console.error('Erro ao iniciar o servidor Fastify:', erro);
    process.exit(1);
  } else {
    console.log(`Servidor Fastify iniciado e ouvindo em ${address}`);
  }
});
