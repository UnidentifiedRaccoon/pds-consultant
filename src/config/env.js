import fs from 'node:fs';
import dotenvSafe from 'dotenv-safe';
import { cleanEnv, num, str } from 'envalid';

// Загружаем .env только локально/в CI — в YC его нет
if (fs.existsSync('.env')) {
  dotenvSafe.config({ example: '.env.example', allowEmptyValues: true });
}

export const config = cleanEnv(process.env, {
  TELEGRAM_BOT_TOKEN: str(),
  DEV_PORT: num({ default: 8080 }),
  WEBHOOK_SECRET: str(),
  PUBLIC_BASE_URL: str({ default: '' }),
});
