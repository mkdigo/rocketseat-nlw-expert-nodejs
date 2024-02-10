import { FastifyRequest } from 'fastify';
import { SocketStream } from '@fastify/websocket';
import { z } from 'zod';

import { voting } from '../../utils/votting-pub-sub';

export async function pollResults(
  connection: SocketStream,
  request: FastifyRequest
) {
  const getPollParams = z.object({
    pollId: z.string().uuid(),
  });

  const { pollId } = getPollParams.parse(request.params);

  voting.subscribe(pollId, (message) => {
    connection.socket.send(JSON.stringify(message));
  });
}
