# Архитектура PDS Consultant Bot

Полное руководство по архитектуре и реализации Telegram бота-консультанта по ПДС.

## 📚 Оглавление

- [Обзор архитектуры](#обзор-архитектуры)
- [Технический стек](#технический-стек)
- [Структура проекта](#структура-проекта)
- [Ключевые компоненты](#ключевые-компоненты)
- [Потоки данных](#потоки-данных)
- [Детальное описание модулей](#детальное-описание-модулей)

## Обзор архитектуры

Проект реализован на TypeScript с использованием современного фреймворка grammY для работы с Telegram Bot API. Архитектура построена на принципах модульности, типобезопасности и разделения ответственности.

### Основные принципы

1. **Типобезопасность** - весь код написан на TypeScript с strict mode
2. **Модульность** - четкое разделение на слои (бот, сервер, бизнес-логика)
3. **Webhook-based** - использование webhook вместо polling для production
4. **Stateful conversations** - потоковые диалоги на `@grammyjs/conversations`
5. **Structured logging** - JSON-логирование с помощью Pino

## Технический стек

### Core

- **TypeScript 5.9.3** - язык программирования
- **Node.js 20.10.0** - runtime environment
- **grammY 1.38.3** - фреймворк для Telegram ботов

### Web Server

- **Fastify 4.28.1** - HTTP сервер для webhook
  - Быстрый и легковесный
  - Встроенная валидация
  - Поддержка TypeScript

### Utilities

- **Playwright 1.48.0** - генерация PDF через headless browser
- **Pino 8.17.0** - структурированное логирование
- **dotenv-safe 9.1.0** - управление переменными окружения
- **envalid 8.1.0** - валидация env переменных
- **fs-extra 11.2.0** - расширенные файловые операции

### Development

- **tsx** - выполнение TypeScript напрямую
- **nodemon** - hot reload для разработки
- **ESLint + Prettier** - линтинг и форматирование
- **Husky + lint-staged** - pre-commit hooks

## Структура проекта

```
pds-consultant/
├── src/                          # Исходный код приложения
│   ├── bot/                      # Модуль бота
│   │   ├── attachBotHandlers.ts  # ⭐ Регистрация обработчиков
│   │   ├── conversations/        # ⭐ Сценарии на @grammyjs/conversations
│   │   │   └── capitalFlow.ts    #   Диалог расчета капитала
│   │   ├── messages.ts           # ⭐ Сообщения и UI
│   │   ├── pdfReport.ts          # PDF генерация
│   │   ├── types.ts              # Контексты и SessionFlavor
│   │   └── webhookBot.ts         # Инициализация бота + middleware
│   ├── config/                   # Конфигурация
│   │   └── env.ts                # Переменные окружения
│   ├── server/                   # HTTP сервер
│   │   └── fastify.ts            # Fastify + webhook endpoint
│   ├── index.ts                  # ⭐ Entry point
│   └── logger.ts                 # Логирование
├── calculation-models/           # Бизнес-логика расчетов
│   └── capital-lump-sum/         # Модель расчета капитала
│       ├── calculate.ts          # ⭐ Финансовые расчеты
│       └── index.ts              # Экспорты
├── scripts/                      # Утилиты для разработки
│   ├── dev-with-localtunnel.ts   # Dev окружение
│   └── webhook-manager.ts        # CLI для webhook
├── webhook/                      # Webhook API
│   └── index.ts                  # Методы управления webhook
├── dist/                         # Скомпилированный код
├── tsconfig.json                 # TypeScript конфигурация
├── .eslintrc.cjs                 # ESLint конфигурация
└── package.json                  # Зависимости и скрипты
```

## Ключевые компоненты

### 1. Entry Point (`src/index.ts`)

Точка входа приложения, отвечает за:

- Валидацию конфигурации
- Создание бота и сервера
- Запуск HTTP сервера
- Graceful shutdown

```typescript
async function startApp(): Promise<void> {
  validateConfig();
  const PORT = platformPort || config.DEV_PORT;
  const bot = createWebhookBot(); // Создание бота
  const server = createServer(bot); // Создание Fastify сервера
  await server.listen({ port: PORT, host: '0.0.0.0' });
  setupShutdownHandlers(server);
}
```

**Основные функции:**

- `validateConfig()` - проверяет наличие обязательных переменных окружения
- `startApp()` - главная функция запуска
- `setupShutdownHandlers()` - обработка SIGINT/SIGTERM для graceful shutdown

### 2. Бот (`src/bot/webhookBot.ts`)

Создает экземпляр grammY бота и подключает обработчики:

```typescript
export function createWebhookBot(): Bot<MyContext> {
  const bot = new Bot<MyContext>(config.TELEGRAM_BOT_TOKEN);

  bot.use(session({ initial: () => ({}) }));
  bot.use(conversations());
  bot.use(createConversation(capitalFlow));

  attachBotHandlers(bot);
  return bot;
}
```

### 3. Обработчики событий (`src/bot/attachBotHandlers.ts`)

**Самый важный файл бота!** Содержит всю логику обработки команд и сообщений.

#### Структура:

```typescript
export function attachBotHandlers(bot: Bot): void {
  // 1. Команда /start
  bot.command('start', async (ctx: Context) => {
    await handleCommand(chatId, 'start', bot);
  });

  // 2. Inline кнопки (callback_query)
  bot.on('callback_query:data', async (ctx: Context) => {
    await ctx.answerCallbackQuery();
    await handleCommand(chatId, data, bot);
  });

  // 3. Текстовые сообщения
  bot.on('message:text', async (ctx: Context) => {
    const conversation = getConversation(chatId);
    if (conversation?.scenario === 'capital') {
      await handleCapitalFlowText(chatId, text, bot, conversation);
    }
  });
}
```

#### Функция `handleCommand()`

Центральный роутер для всех команд:

```typescript
async function handleCommand(chatId: number, command: string, bot: Bot): Promise<void> {
  switch (command) {
    case 'start':
      await bot.api.sendMessage(chatId, MESSAGES.WELCOME, createMainKeyboard());
      clearConversation(chatId);
      break;

    case 'calculate_capital':
      await bot.api.sendMessage(chatId, MESSAGES.CAPITAL_FLOW.INTRO, ...);
      resetConversation(chatId, { scenario: 'capital', step: 'intro' });
      break;

    case 'capital_gender_male':
    case 'capital_gender_female':
      updateConversation(chatId, {
        step: 'age',
        data: { gender: command === 'capital_gender_male' ? 'male' : 'female' }
      });
      break;
    // ... другие команды
  }
}
```

#### Обработка сценария "Капитал к выплатам"

Многошаговый диалог с сохранением состояния:

```typescript
async function handleCapitalFlowText(
  chatId: number,
  text: string,
  bot: Bot,
  conversation: ConversationState
): Promise<void> {
  switch (conversation.step) {
    case 'target_sum':
      const target = Number.parseInt(text, 10);
      if (!Number.isFinite(target) || target < 50000 || target > 100000000) {
        await bot.api.sendMessage(chatId, MESSAGES.CAPITAL_FLOW.ERRORS.INVALID_TARGET_SUM);
        return;
      }
      updateConversation(chatId, { step: 'gender', data: { targetSum: target } });
      await bot.api.sendMessage(chatId, MESSAGES.CAPITAL_FLOW.PROMPTS.GENDER, ...);
      break;

    case 'age':
      // Аналогично для возраста
      break;
  }
}
```

#### Расчет и отправка результата

```typescript
async function sendCapitalCalculationResult(
  chatId: number,
  bot: Bot,
  data: ConversationData | undefined
): Promise<void> {
  const calculation = calculateCapitalLumpSum({
    targetSum: data?.targetSum ?? 0,
    incomeLevel: data?.income ?? 'high',
    ndflRate: ndflRateDecimal,
    reinvest: Boolean(data?.reinvest),
  });

  const message = formatCalculationResult(calculation);
  await bot.api.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    ...createCapitalResultKeyboard(),
  });
}
```

### 4. Управление состоянием (`src/bot/conversationState.ts`)

In-memory хранилище состояний диалогов:

```typescript
export interface ConversationData {
  targetSum?: number;
  gender?: 'male' | 'female';
  age?: number;
  income?: 'low' | 'mid' | 'high';
  ndflRate?: string;
  reinvest?: boolean;
}

export interface ConversationState {
  scenario?: 'capital';
  step?: string;
  finished?: boolean;
  data?: ConversationData;
}

const conversations = new Map<number, ConversationState>();

export function getConversation(chatId: number): ConversationState | undefined {
  return conversations.get(chatId);
}

export function updateConversation(
  chatId: number,
  patch: Partial<ConversationState>
): ConversationState {
  const current = conversations.get(chatId) || {};
  const nextData = { ...(current.data || {}), ...(patch.data || {}) };
  const nextState = { ...current, ...patch, data: nextData };
  conversations.set(chatId, nextState);
  return nextState;
}
```

**Важно:** Состояния хранятся в памяти процесса. При рестарте все данные теряются. Для production с несколькими инстансами нужно использовать Redis/MongoDB.

### 5. Сообщения и UI (`src/bot/messages.ts`)

Централизованное хранение всех текстов и клавиатур:

```typescript
export const MESSAGES = {
  WELCOME: `👋 Привет! Я бот-консультант по ПДС...`,
  INFO_ABOUT_PDS: `✨ Что такое ПДС...`,
  CAPITAL_FLOW: {
    INTRO: `🧮 Что посчитаем...`,
    PROMPTS: {
      TARGET_SUM: `🎯 Целевая сумма...`,
      GENDER: `👤 Пол...`,
      AGE: `🎂 Возраст...`,
      // ...
    },
    ERRORS: {
      INVALID_TARGET_SUM: `😅 Не удалось распознать...`,
      // ...
    },
    RESPONSES: {
      RESULT_HEADER: `✅ Спасибо! Считаю...`,
      RESULT_BODY: `<b>📊 Сводка...</b>...`,
      // ...
    },
  },
  BUTTONS: {
    CALCULATE: '🧮 Рассчитать',
    INFO: 'ℹ️ Что такое ПДС?',
    // ...
  },
  CALLBACK_DATA: {
    CALCULATE: 'calculate',
    INFO: 'info',
    // ...
  },
};
```

Функции создания клавиатур:

```typescript
type InlineKeyboardMarkup = {
  inline_keyboard: Array<Array<{ text: string; callback_data: string }>>;
};

export function createMainKeyboard(): { reply_markup: InlineKeyboardMarkup } {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: MESSAGES.BUTTONS.CALCULATE, callback_data: MESSAGES.CALLBACK_DATA.CALCULATE },
          { text: MESSAGES.BUTTONS.INFO, callback_data: MESSAGES.CALLBACK_DATA.INFO },
        ],
      ],
    },
  };
}
```

### 6. HTTP Сервер (`src/server/fastify.ts`)

Fastify сервер с webhook endpoint для Telegram:

```typescript
export function createServer(bot: Bot): FastifyInstance {
  const app = Fastify({
    logger: false,
    trustProxy: true, // Для работы за прокси
  });

  // Health check
  app.get('/health', async () => ({
    ok: true,
    timestamp: new Date().toISOString(),
    service: 'pds-consultant',
  }));

  // Webhook endpoint
  const path = `/tg/${config.WEBHOOK_SECRET}`;
  app.post(path, async (request, reply) => {
    // 1. Проверка секретного токена
    const secret = request.headers['x-telegram-bot-api-secret-token'];
    if (secret && secret !== config.WEBHOOK_SECRET) {
      return reply.code(401).send({ ok: false, error: 'Unauthorized' });
    }

    // 2. Валидация тела запроса
    const typedUpdate = request.body as Update;
    if (!typedUpdate.update_id) {
      return reply.code(400).send({ ok: false, error: 'Missing update_id' });
    }

    // 3. Обработка через grammY
    try {
      await bot.handleUpdate(typedUpdate);
      return reply.send({ ok: true });
    } catch (error) {
      logger.error({ err: error, update_id: typedUpdate.update_id }, 'webhook:handler:error');
      return reply.code(500).send({ ok: false, error: 'Internal server error' });
    }
  });

  return app;
}
```

**Ключевые моменты:**

- Endpoint защищен secret token из заголовка
- Используется `bot.handleUpdate()` вместо `webhookCallback()` для прямой обработки
- Все ошибки логируются и возвращают правильные HTTP статусы

### 7. Модель расчетов (`calculation-models/capital-lump-sum/calculate.ts`)

Финансовая математика для расчета капитала:

```typescript
// Константы
const ANNUAL_RETURN = 0.1; // 10% годовых
const MONTHLY_RATE = Math.pow(1 + ANNUAL_RETURN, 1 / 12) - 1;
const YEARS = 15;
const STATE_SUPPORT_YEARS = 10;
const STATE_SUPPORT_LIMIT = 36000; // Максимум в год от государства
const TAX_LIMIT = 400000; // Лимит базы для вычета

// Коэффициенты господдержки по доходу
const MATCH_BY_INCOME: Record<string, number> = {
  low: 1, // 100% от взносов (до лимита)
  mid: 0.5, // 50%
  high: 0.25, // 25%
};
```

#### Основные функции:

**1. Расчет будущей стоимости с учетом всех факторов:**

```typescript
function futureCapital({
  monthlyContribution,
  matchPct,
  ndflRate,
  reinvest,
}: FutureCapitalParams): number {
  const yearlyContribution = monthlyContribution * 12;
  const support = annualStateSupport(matchPct, yearlyContribution);
  const tax = annualTaxDeduction(ndflRate, yearlyContribution);

  // Будущая стоимость личных взносов с капитализацией
  const contributionsPart = monthlyContribution * ((BASE_GROWTH - 1) / MONTHLY_RATE);

  // Будущая стоимость господдержки (10 лет)
  const statePart = support * weight(STATE_SUPPORT_YEARS);

  // Будущая стоимость реинвестированного вычета (15 лет)
  const taxPart = reinvest ? tax * weight(YEARS) : 0;

  return contributionsPart + statePart + taxPart;
}
```

**2. Функция веса (коэффициент роста):**

```typescript
function weight(years: number): number {
  if (years <= 0) return 0;

  const startPower = Math.pow(YEARLY_FACTOR, YEARS - years);
  const numerator = Math.pow(YEARLY_FACTOR, years) - 1;
  const denominator = YEARLY_FACTOR - 1;

  return startPower * (numerator / denominator);
}
```

**3. Бинарный поиск нужного взноса:**

```typescript
function findMonthlyContribution(
  target: number,
  { matchPct, ndflRate, reinvest }: FindMonthlyContributionParams
): number {
  let low = 0;
  let high = 2_000_000;

  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    const capital = futureCapital({ monthlyContribution: mid, matchPct, ndflRate, reinvest });

    if (capital >= target) {
      high = mid;
    } else {
      low = mid;
    }

    if (high - low < 0.01) break;
  }

  return high;
}
```

**4. Главная экспортируемая функция:**

```typescript
export function calculateCapitalLumpSum({
  targetSum,
  incomeLevel,
  ndflRate,
  reinvest,
}: CapitalLumpSumParams): CapitalLumpSumResult {
  if (!Number.isFinite(targetSum) || targetSum <= 0) {
    throw new Error('Target sum is required for calculation');
  }

  const matchPct = MATCH_BY_INCOME[incomeLevel] ?? MATCH_BY_INCOME.high;
  const monthlyContribution = findMonthlyContribution(targetSum, { matchPct, ndflRate, reinvest });

  const yearlyContribution = monthlyContribution * 12;
  const supportYear = annualStateSupport(matchPct, yearlyContribution);
  const taxYear = annualTaxDeduction(ndflRate, yearlyContribution);

  const capital = futureCapital({ monthlyContribution, matchPct, ndflRate, reinvest });

  const personalTotal = yearlyContribution * YEARS;
  const stateTotal = supportYear * STATE_SUPPORT_YEARS;
  const taxTotal = taxYear * YEARS;
  const reinvestedTaxTotal = reinvest ? taxTotal : 0;

  const investmentIncome = capital - (personalTotal + stateTotal + reinvestedTaxTotal);

  const lifePayment = capital / (LIFE_EXPECTANCY_YEARS * 12);
  const tenYearPayment = capital / (10 * 12);

  return {
    capital,
    monthlyContribution,
    personalTotal,
    stateTotal,
    annualStateSupport: supportYear,
    taxYear,
    taxTotal,
    reinvestedTaxTotal,
    investmentIncome,
    lifePayment,
    tenYearPayment,
    lumpSum: capital,
    matchPct,
  };
}
```

### 8. PDF генерация (`src/bot/pdfReport.ts`)

Использует Playwright для рендеринга HTML в PDF:

```typescript
export async function generateCapitalPdfReport(
  calculation: CapitalLumpSumResult,
  options?: PdfReportOptions
): Promise<Buffer> {
  const { targetSum, data } = options || {};

  // 1. Подставляем данные в HTML шаблон
  const pdfHtml = MESSAGES.CAPITAL_FLOW.RESPONSES.PDF_TEMPLATE.replace(
    '{personalTotal}',
    formatCurrency(calculation.personalTotal)
  ).replace('{monthlyContribution}', formatCurrency(calculation.monthlyContribution));
  // ... остальные замены
  // 2. Создаем временный файл
  await ensureReportsDir();
  const pdfPath = path.join(REPORTS_DIR, `pds-capital-report-${Date.now()}.pdf`);

  // 3. Рендерим через Playwright
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(pdfHtml, { waitUntil: 'load' });
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  } finally {
    await browser.close();
  }

  // 4. Читаем и удаляем временный файл
  const buffer = await fs.promises.readFile(pdfPath);
  await fs.promises.unlink(pdfPath);

  return buffer;
}
```

### 9. Конфигурация (`src/config/env.ts`)

Типобезопасная работа с переменными окружения:

```typescript
import dotenvSafe from 'dotenv-safe';
import { cleanEnv, num, str } from 'envalid';

// Загружаем .env если он есть (для локальной разработки)
if (fs.existsSync('.env')) {
  dotenvSafe.config({ example: '.env.example', allowEmptyValues: true });
}

// Валидируем и экспортируем типизированный config
export const config = cleanEnv(process.env, {
  TELEGRAM_BOT_TOKEN: str(),
  DEV_PORT: num({ default: 8080 }),
  WEBHOOK_SECRET: str(),
  PUBLIC_BASE_URL: str({ default: '' }),
});
```

**Преимущества:**

- `dotenv-safe` проверяет наличие всех переменных из `.env.example`
- `envalid` валидирует типы и предоставляет defaults
- TypeScript знает точные типы всех переменных

### 10. Логирование (`src/logger.ts`)

Структурированное JSON-логирование с Pino:

```typescript
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: { svc: 'pds-consultant' }, // Добавляется ко всем логам
  timestamp: pino.stdTimeFunctions.isoTime,
});
```

Использование:

```typescript
logger.info({ port: PORT, env: process.env.NODE_ENV }, 'http:listening');
logger.error({ chatId, command, err: error }, 'handleCommand:error');
logger.fatal({ errors }, 'config:validation:failed');
```

Вывод:

```json
{
  "level": 30,
  "time": "2025-10-17T10:00:00.000Z",
  "svc": "pds-consultant",
  "port": 8080,
  "env": "production",
  "msg": "http:listening"
}
```

## Потоки данных

### 1. Обработка входящего апдейта

```
Telegram → Webhook → Fastify → grammY Bot → Handler → Response → Telegram
                                     ↓
                              conversationState.ts
                                     ↓
                              calculation-models/
```

**Детально:**

1. Telegram отправляет POST на `/tg/{WEBHOOK_SECRET}`
2. Fastify валидирует запрос и передает в `bot.handleUpdate()`
3. grammY определяет тип апдейта (command, callback_query, message)
4. Соответствующий handler обрабатывает апдейт:
   - Читает состояние из `conversationState`
   - Вызывает бизнес-логику (расчеты)
   - Обновляет состояние
   - Отправляет ответ через `bot.api.sendMessage()`

### 2. Сценарий "Капитал к выплатам"

```
/start → "Рассчитать" → "Капитал к выплатам" →
  Целевая сумма (text) →
  Пол (buttons) →
  Возраст (text) →
  Доход (buttons) →
  НДФЛ (buttons) →
  Реинвестировать? (buttons) →
  РАСЧЕТ →
  Результат + PDF
```

**Состояние на каждом шаге:**

```typescript
// Шаг 1: intro
{ scenario: 'capital', step: 'intro', data: {} }

// Шаг 2: ввод суммы
{ scenario: 'capital', step: 'target_sum', data: {} }

// Шаг 3: выбор пола
{ scenario: 'capital', step: 'gender', data: { targetSum: 5000000 } }

// Шаг 4: ввод возраста
{ scenario: 'capital', step: 'age', data: { targetSum: 5000000, gender: 'male' } }

// ... и так далее

// Финальное состояние
{
  scenario: 'capital',
  step: 'complete',
  finished: true,
  data: {
    targetSum: 5000000,
    gender: 'male',
    age: 35,
    income: 'high',
    ndflRate: '13',
    reinvest: true
  }
}
```

### 3. Генерация PDF

```
Результат расчета →
  HTML шаблон с подстановкой данных →
  Playwright (headless Chromium) →
  PDF в /tmp →
  Buffer →
  Telegram sendDocument →
  Удаление временного файла
```

## TypeScript конфигурация

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022", // Современный JS
    "module": "NodeNext", // ESM модули
    "moduleResolution": "NodeNext", // Новый алгоритм разрешения
    "outDir": "./dist", // Выходная директория
    "strict": true, // Все strict проверки
    "esModuleInterop": true, // Совместимость с CommonJS
    "skipLibCheck": true, // Пропуск проверки .d.ts
    "resolveJsonModule": true, // Импорт JSON
    "noUnusedLocals": true, // Ошибка на неиспользуемые переменные
    "noUnusedParameters": true, // Ошибка на неиспользуемые параметры
    "noImplicitReturns": true, // Все пути должны возвращать значение
    "noFallthroughCasesInSwitch": true // Нет fallthrough в switch
  },
  "include": ["src/**/*", "scripts/**/*", "calculation-models/**/*", "webhook/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### ESLint конфигурация

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['dist/', 'node_modules/', '*.d.ts'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

## Скрипты разработки

### `scripts/dev-with-localtunnel.ts`

Автоматизация локальной разработки:

```typescript
async function main(): Promise<void> {
  // 1. Проверяем текущий webhook
  await checkCurrentWebhook();

  // 2. Запускаем сервер с nodemon (hot reload)
  startServer(); // nodemon src/index.ts

  // 3. Запускаем localtunnel через 2 секунды
  setTimeout(startTunnel, 2000);

  // 4. При получении URL от localtunnel - автоматически устанавливаем webhook
  // handleTunnelOutput() -> setWebhook()
}
```

**Что делает:**

1. Запускает TypeScript сервер через `tsx` + `nodemon`
2. Создает публичный туннель через `localtunnel`
3. Парсит URL туннеля из вывода
4. Автоматически устанавливает webhook на этот URL
5. При Ctrl+C корректно завершает все процессы

### `scripts/webhook-manager.ts`

CLI для управления webhook:

```typescript
async function main(): Promise<number> {
  switch (command) {
    case 'set':
      await setWebhook(webhookUrl);
      break;
    case 'info':
      const info = await getWebhookInfo();
      console.log('Webhook Info:', info);
      break;
    case 'delete':
      await deleteWebhook();
      break;
  }
}
```

## Безопасность

### 1. Webhook защита

- **Secret token** в URL: `/tg/{WEBHOOK_SECRET}`
- **Secret token в заголовке**: `x-telegram-bot-api-secret-token`
- Двойная проверка предотвращает несанкционированный доступ

### 2. Валидация входных данных

```typescript
// Проверка целевой суммы
if (!Number.isFinite(target) || target < 50000 || target > 100000000) {
  await bot.api.sendMessage(chatId, MESSAGES.CAPITAL_FLOW.ERRORS.INVALID_TARGET_SUM);
  return;
}

// Проверка возраста
if (!Number.isFinite(age) || age < 18 || age > 100) {
  await bot.api.sendMessage(chatId, MESSAGES.CAPITAL_FLOW.ERRORS.INVALID_AGE);
  return;
}
```

### 3. Обработка ошибок

Все асинхронные операции обернуты в try-catch:

```typescript
try {
  await handleCommand(chatId, 'start', bot);
} catch (error) {
  logger.error({ err: error, chatId }, 'command:error');
  await bot.api.sendMessage(chatId, MESSAGES.ERRORS.GENERIC, createMainKeyboard());
}
```

## Масштабирование

### Текущие ограничения

1. **Состояние в памяти** - теряется при рестарте
2. **Одиночный процесс** - нет горизонтального масштабирования
3. **PDF в /tmp** - может заполнить диск

### Рекомендации для production

1. **Redis для состояний:**

```typescript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export async function getConversation(chatId: number) {
  const data = await redis.get(`conversation:${chatId}`);
  return data ? JSON.parse(data) : undefined;
}
```

2. **Несколько инстансов:**

- Использовать PM2 или Kubernetes
- Общий Redis для состояний
- Load balancer перед инстансами

3. **S3 для PDF:**

```typescript
const s3Url = await uploadToS3(pdfBuffer);
await bot.api.sendDocument(chatId, new InputFile(s3Url));
```

4. **Rate limiting:**

```typescript
import rateLimit from '@fastify/rate-limit';
app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});
```

## Мониторинг и отладка

### Уровни логирования

```bash
# Development
LOG_LEVEL=debug npm run dev

# Production
LOG_LEVEL=info npm start

# Только ошибки
LOG_LEVEL=error npm start
```

### Структура логов

```typescript
// Информационные
logger.info({ port, env }, 'http:listening');

// Предупреждения
logger.warn({ signal }, 'shutdown:start');

// Ошибки
logger.error({ err, chatId }, 'handleCommand:error');

// Критические
logger.fatal({ errors }, 'config:validation:failed');
```

### Отладка webhook

```bash
# Проверить статус
npm run webhook:info

# Если есть ошибки - удалить и переустановить
npm run webhook:delete
npm run dev  # Автоматически установит новый
```

## Заключение

Архитектура проекта построена на принципах:

- ✅ Типобезопасность (TypeScript strict mode)
- ✅ Модульность (четкое разделение слоев)
- ✅ Отказоустойчивость (обработка всех ошибок)
- ✅ Читаемость (понятная структура и именование)
- ✅ Расширяемость (легко добавить новые сценарии)

Код готов к production с минимальными доработками (Redis, мониторинг, метрики).
