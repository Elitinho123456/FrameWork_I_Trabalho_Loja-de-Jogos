if (!nome || !preco || !produtor) {
    return reply.status(400).send({ mensagem: 'Todos os campos são obrigatórios' });
}
const precoNumerico = parseFloat(preco);
if (isNaN(precoNumerico)) {
    return reply.status(400).send({ mensagem: 'Preço deve ser um número válido' });
}