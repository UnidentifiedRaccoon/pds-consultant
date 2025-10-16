import { spawn } from 'child_process';
import { config } from '../src/config/env.js';
import { logger } from '../src/logger.js';

const PORT = config.DEV_PORT;

// Запускаем основной сервер
logger.info({ port: PORT }, 'Starting server...');
const server = spawn('node', ['src/index.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: PORT.toString() },
});

// Запускаем ngrok туннель
logger.info('Starting ngrok tunnel...');
const ngrok = spawn('ngrok', ['http', PORT.toString(), '--log=stdout'], {
  stdio: 'pipe',
});

let ngrokUrl = null;

ngrok.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);

  // Ищем URL в выводе ngrok
  const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.ngrok-free\.app/);
  if (urlMatch && !ngrokUrl) {
    ngrokUrl = urlMatch[0];
    logger.info({ ngrokUrl }, 'Ngrok tunnel established');

    // Устанавливаем webhook
    const webhookUrl = `${ngrokUrl}/tg/${config.WEBHOOK_SECRET}`;
    logger.info({ webhookUrl }, 'Set this URL as webhook in Telegram Bot API');
  }
});

ngrok.stderr.on('data', (data) => {
  console.error('ngrok error:', data.toString());
});

// Обработка завершения процессов
process.on('SIGINT', () => {
  logger.info('Shutting down...');
  server.kill();
  ngrok.kill();
  process.exit(0); // eslint-disable-line n/no-process-exit
});

process.on('SIGTERM', () => {
  logger.info('Shutting down...');
  server.kill();
  ngrok.kill();
  process.exit(0); // eslint-disable-line n/no-process-exit
});

server.on('close', (code) => {
  logger.error({ code }, 'Server process exited');
  ngrok.kill();
  process.exit(code); // eslint-disable-line n/no-process-exit
});

ngrok.on('close', (code) => {
  logger.error({ code }, 'Ngrok process exited');
  server.kill();
  process.exit(code); // eslint-disable-line n/no-process-exit
});
