import fastify from 'fastify';
import cookie from '@fastify/cookie';
import fastifyWebsocket from '@fastify/websocket';

import { routes } from './routes';
import { webSocketRoutes } from './routes/web-socket-routes';

const PORT = 3333;

const app = fastify();

app.register(cookie, {
  secret: 'polls-app-nlw',
  hook: 'onRequest',
});

app.register(fastifyWebsocket);

app.register(routes);
app.register(webSocketRoutes);

app.listen({ port: 3333 }).then(() => {
  console.log(`HTTP server running on port ${PORT}!`);
});
