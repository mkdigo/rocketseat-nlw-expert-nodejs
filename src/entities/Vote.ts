export type Vote = {
  id: number;
  sessionId: string;
  pollId: string;
  pollOptionId: string;
  createdAt: Date;
};
