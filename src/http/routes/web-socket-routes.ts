import { FastifyInstance } from 'fastify';

import { pollResults } from '../web-sockets/poll-results';

export async function webSocketRoutes(app: FastifyInstance) {
  app.get('/polls/:pollId/results', { websocket: true }, pollResults);
}
