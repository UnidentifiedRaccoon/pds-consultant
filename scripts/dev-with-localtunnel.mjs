import { spawn } from 'child_process';
import { config } from '../src/config/env.js';
import { logger } from '../src/logger.js';
import { setWebhook, getWebhookInfo } from '../webhook/index.js';

const PORT = config.DEV_PORT;
const USE_NODEMON = true; // Режим разработки с автоперезагрузкой

let serverProcess = null;
let tunnelProcess = null;
let tunnelUrl = null;

/**
 * Запускает сервер
 */
function startServer() {
  if (serverProcess) {
    serverProcess.kill();
  }

  logger.info({ port: PORT, nodemon: USE_NODEMON }, 'Starting server...');

  const command = USE_NODEMON ? 'npx' : 'node';
  const args = USE_NODEMON ? ['nodemon', 'src/index.js'] : ['src/index.js'];

  serverProcess = spawn(command, args, {
    stdio: 'inherit',
    env: { ...process.env, PORT: PORT.toString() },
  });

  serverProcess.on('close', (code) => {
    logger.error({ code }, 'Server process exited');
    cleanup(code);
  });
}

/**
 * Запускает локальный туннель (localtunnel через npx)
 */
function startTunnel() {
  if (tunnelProcess) {
    tunnelProcess.kill();
  }

  logger.info('Starting localtunnel...');
  tunnelProcess = spawn('npx', ['--yes', 'localtunnel', '--port', PORT.toString()], {
    stdio: 'pipe',
  });

  tunnelProcess.stdout.on('data', handleTunnelOutput);
  tunnelProcess.stderr.on('data', (data) => {
    logger.error({ error: data.toString() }, 'localtunnel:error');
  });

  tunnelProcess.on('close', (code) => {
    logger.error({ code }, 'Localtunnel process exited');
    cleanup(code);
  });
}

/**
 * Обрабатывает вывод localtunnel и устанавливает webhook
 */
async function handleTunnelOutput(data) {
  const output = data.toString();
  console.log(output);

  const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.loca\.lt/);
  if (urlMatch && (!tunnelUrl || urlMatch[0] !== tunnelUrl)) {
    tunnelUrl = urlMatch[0];
    logger.info({ tunnelUrl }, 'Localtunnel established');

    const webhookUrl = `${tunnelUrl}/tg/${config.WEBHOOK_SECRET}`;
    logger.info({ webhookUrl }, 'Setting webhook automatically...');

    const success = await setWebhook(webhookUrl);
    if (success) {
      logger.info('✅ Webhook successfully registered! Bot is ready to use.');
    } else {
      logger.error('❌ Failed to register webhook. Please check your bot token.');
    }
  }
}

/**
 * Проверяет текущий webhook при запуске
 */
async function checkCurrentWebhook() {
  logger.info('Checking current webhook status...');
  const webhookInfo = await getWebhookInfo();
  if (webhookInfo) {
    if (webhookInfo.url) {
      logger.info({ currentWebhook: webhookInfo.url }, 'Current webhook URL');
    } else {
      logger.info('No webhook is currently set');
    }
  }
}

/**
 * Очистка ресурсов и завершение работы
 */
function cleanup(exitCode = 0) {
  if (serverProcess) serverProcess.kill();
  if (tunnelProcess) tunnelProcess.kill();
  process.exit(exitCode); // eslint-disable-line n/no-process-exit
}

/**
 * Обработчики сигналов завершения
 */
function setupSignalHandlers() {
  process.on('SIGINT', () => {
    logger.info('Shutting down...');
    cleanup(0);
  });

  process.on('SIGTERM', () => {
    logger.info('Shutting down...');
    cleanup(0);
  });
}

// Главная функция запуска
async function main() {
  await checkCurrentWebhook();
  setupSignalHandlers();
  startServer();
  setTimeout(startTunnel, 2000); // Даем серверу время запуститься
}

main();
