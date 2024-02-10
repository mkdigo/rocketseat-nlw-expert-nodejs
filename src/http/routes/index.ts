import { FastifyInstance } from 'fastify';

import { PollController } from '../controllers/pollController';

import { PollRepository } from '../../repositories/poll-repository';

export async function routes(app: FastifyInstance) {
  const pollRepository = new PollRepository();
  const pollController = new PollController(pollRepository);

  app.get('/polls/:pollId', pollController.find.bind(pollController));
  app.post('/polls', pollController.create.bind(pollController));
  app.post('/polls/:pollId/votes', pollController.vote.bind(pollController));
}
