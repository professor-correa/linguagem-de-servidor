import 'dotenv/config';
import http from 'node:http';
import { router } from './routes/index.js';

const port = Number(process.env.PORT) || 3000;

const server = http.createServer((request, response) => {
  const startedAt = Date.now();

  response.on('finish', () => {
    const duration = Date.now() - startedAt;
    console.log(`${request.method} ${request.url} ${response.statusCode} ${duration}ms`);
  });

  router(request, response);
});

server.listen(port, () => {
  console.log(`Raffle API running at http://localhost:${port}`);
});
