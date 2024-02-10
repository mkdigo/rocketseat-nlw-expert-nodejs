import { Poll } from '../entities/Poll';
import { Vote } from '../entities/Vote';

export type CreatePollInputDTO = {
  title: string;
  options: string[];
};

export type CreateVoteInputDTO = {
  sessionId: string;
  pollId: string;
  pollOptionId: string;
};

export interface PollRepositoryInterface {
  find(pollId: string): Promise<Poll | null>;
  create(inputDTO: CreatePollInputDTO): Promise<Omit<Poll, 'options'>>;
  findVote(params: { sessionId: string; pollId: string }): Promise<Vote | null>;
  createVote(inputDTO: CreateVoteInputDTO): Promise<Vote>;
  deleteVote(voteId: number): Promise<boolean>;
  votes(pollId: string): Promise<Record<string, number>>;
}
