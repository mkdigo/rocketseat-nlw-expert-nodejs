import { randomUUID } from 'node:crypto';
import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { voting } from '../../utils/votting-pub-sub';
import { PollRepositoryInterface } from '../../repositories/poll-repository-interface';
import { PollResource } from '../../resources/poll-resource';

export class PollController {
  constructor(private repository: PollRepositoryInterface) {}

  async find(request: FastifyRequest, reply: FastifyReply) {
    const getPollParams = z.object({
      pollId: z.string().uuid(),
    });

    const { pollId } = getPollParams.parse(request.params);

    const poll = await this.repository.find(pollId);

    if (!poll) return reply.status(400).send({ message: 'Poll not found.' });

    const votes = await this.repository.votes(pollId);

    const pollResource = new PollResource(poll);

    return reply.send({
      poll: pollResource.resource(votes),
    });
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const createPollBody = z.object({
      title: z.string(),
      options: z.array(z.string()),
    });

    const { title, options } = createPollBody.parse(request.body);

    const poll = await this.repository.create({ title, options });

    return reply.status(201).send({
      pollId: poll.id,
    });
  }

  async vote(request: FastifyRequest, reply: FastifyReply) {
    const voteOnPollBody = z.object({
      pollOptionId: z.string().uuid(),
    });

    const voteOnPollParams = z.object({
      pollId: z.string().uuid(),
    });

    const { pollOptionId } = voteOnPollBody.parse(request.body);
    const { pollId } = voteOnPollParams.parse(request.params);

    let { sessionId } = request.cookies;

    if (sessionId) {
      const userPreviousVoteOnPoll = await this.repository.findVote({
        sessionId,
        pollId,
      });

      if (
        userPreviousVoteOnPoll &&
        userPreviousVoteOnPoll.pollOptionId !== pollOptionId
      ) {
        // remove previous vote
        await this.repository.deleteVote(userPreviousVoteOnPoll.id);

        const votes = await redis.zincrby(
          pollId,
          -1,
          userPreviousVoteOnPoll.pollOptionId
        );

        voting.publish(pollId, {
          pollOptionId: userPreviousVoteOnPoll.pollOptionId,
          votes: Number(votes),
        });
      } else if (userPreviousVoteOnPoll) {
        return reply.status(400).send({
          message: 'You already voted on this poll.',
        });
      }
    }

    if (!sessionId) {
      sessionId = randomUUID();

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        signed: true,
        httpOnly: true,
      });
    }

    await this.repository.createVote({ sessionId, pollId, pollOptionId });

    const votes = await redis.zincrby(pollId, 1, pollOptionId);

    voting.publish(pollId, {
      pollOptionId,
      votes: Number(votes),
    });

    return reply.status(201).send();
  }
}
