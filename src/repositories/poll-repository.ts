import { Poll } from '../entities/Poll';
import { Vote } from '../entities/Vote';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import {
  CreatePollInputDTO,
  CreateVoteInputDTO,
  PollRepositoryInterface,
} from './poll-repository-interface';

export class PollRepository implements PollRepositoryInterface {
  async find(pollId: string): Promise<Poll | null> {
    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId,
      },
      include: {
        options: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return poll;
  }

  async create({
    title,
    options,
  }: CreatePollInputDTO): Promise<Omit<Poll, 'options'>> {
    const poll = await prisma.poll.create({
      data: {
        title,
        options: {
          createMany: {
            data: options.map((option) => {
              return {
                title: option,
              };
            }),
          },
        },
      },
    });

    return poll;
  }

  async findVote({
    sessionId,
    pollId,
  }: {
    sessionId: string;
    pollId: string;
  }): Promise<Vote | null> {
    const vote = await prisma.vote.findUnique({
      where: {
        sessionId_pollId: {
          sessionId,
          pollId,
        },
      },
    });

    return vote;
  }

  async createVote({
    sessionId,
    pollId,
    pollOptionId,
  }: CreateVoteInputDTO): Promise<Vote> {
    const vote = await prisma.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId,
      },
    });

    return vote;
  }

  async deleteVote(voteId: number): Promise<boolean> {
    await prisma.vote.delete({
      where: {
        id: voteId,
      },
    });

    return true;
  }

  async votes(pollId: string): Promise<Record<string, number>> {
    const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES');

    const votes = result.reduce((obj, line, index) => {
      if (index % 2 === 0) {
        const score = result[index + 1];

        Object.assign(obj, {
          [line]: Number(score),
        });
      }

      return obj;
    }, {} as Record<string, number>);

    return votes;
  }
}
