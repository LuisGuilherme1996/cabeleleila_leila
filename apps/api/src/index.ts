import { env } from './config/env.js';
import { app } from './app.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`[API Server] Running successfully at http://localhost:${PORT}`);
  console.log(`[API Server] Health check available at http://localhost:${PORT}/health`);
});
