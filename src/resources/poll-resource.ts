import { Poll } from '../entities/Poll';

type Resource = {
  id: string;
  title: string;
  options: {
    id: string;
    title: string;
    score: number;
  }[];
};

export class PollResource {
  constructor(private poll: Poll) {}

  resource(votes: Record<string, number>): Resource {
    return {
      id: this.poll.id,
      title: this.poll.title,
      options: this.poll.options.map((option) => ({
        id: option.id,
        title: option.title,
        score: option.id in votes ? votes[option.id] : 0,
      })),
    };
  }
}
