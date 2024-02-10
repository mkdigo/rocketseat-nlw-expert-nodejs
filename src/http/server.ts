import fastify from 'fastify';

const PORT = 3333;

const app = fastify();

app.get('/hello', () => {
  return 'Hello NLW';
});

app.listen({ port: 3333 }).then(() => {
  console.log(`HTTP server running on port ${PORT}!`);
});
