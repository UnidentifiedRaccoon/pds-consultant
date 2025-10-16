import { spawn } from 'child_process';
import { config } from '../src/config/env.js';
import { logger } from '../src/logger.js';

const PORT = config.DEV_PORT;

let serverProcess = null;
let ngrokProcess = null;
let ngrokUrl = null;

function startServer() {
  if (serverProcess) {
    serverProcess.kill();
  }

  logger.info({ port: PORT }, 'Starting server...');
  serverProcess = spawn('npx', ['nodemon', 'src/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: PORT.toString() },
  });

  serverProcess.on('close', (code) => {
    logger.error({ code }, 'Server process exited');
    if (ngrokProcess) {
      ngrokProcess.kill();
    }
    process.exit(code); // eslint-disable-line n/no-process-exit
  });
}

function startNgrok() {
  if (ngrokProcess) {
    ngrokProcess.kill();
  }

  logger.info('Starting ngrok tunnel...');
  ngrokProcess = spawn('ngrok', ['http', PORT.toString(), '--log=stdout'], {
    stdio: 'pipe',
  });

  ngrokProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);

    // Ищем URL в выводе ngrok
    const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.ngrok-free\.app/);
    if (urlMatch && (!ngrokUrl || urlMatch[0] !== ngrokUrl)) {
      ngrokUrl = urlMatch[0];
      logger.info({ ngrokUrl }, 'Ngrok tunnel established');

      // Устанавливаем webhook
      const webhookUrl = `${ngrokUrl}/tg/${config.WEBHOOK_SECRET}`;
      logger.info({ webhookUrl }, 'Set this URL as webhook in Telegram Bot API');
      logger.info('Webhook URL will remain the same during development');
    }
  });

  ngrokProcess.stderr.on('data', (data) => {
    console.error('ngrok error:', data.toString());
  });

  ngrokProcess.on('close', (code) => {
    logger.error({ code }, 'Ngrok process exited');
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(code); // eslint-disable-line n/no-process-exit
  });
}

// Запускаем процессы
startServer();
setTimeout(startNgrok, 2000); // Даем серверу время запуститься

// Обработка завершения процессов
process.on('SIGINT', () => {
  logger.info('Shutting down...');
  if (serverProcess) serverProcess.kill();
  if (ngrokProcess) ngrokProcess.kill();
  process.exit(0); // eslint-disable-line n/no-process-exit
});

process.on('SIGTERM', () => {
  logger.info('Shutting down...');
  if (serverProcess) serverProcess.kill();
  if (ngrokProcess) ngrokProcess.kill();
  process.exit(0); // eslint-disable-line n/no-process-exit
});
