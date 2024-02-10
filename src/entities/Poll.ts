export type Poll = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  options: Array<{
    id: string;
    title: string;
  }>;
};
