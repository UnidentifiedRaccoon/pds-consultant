import { tryLock, unlock } from './antiFlood.js';
import {
  handlePDSStartCommand,
  handlePDSMenuCommand,
  handlePDSTextMessage,
  handlePDSCallbackQuery,
} from './pdsCalculator.js';

/**
 * Генерирует статический ответ на основе контекста сообщений
 * @param {Array<{role: 'system'|'user'|'assistant', text: string}>} messages
 * @returns {Promise<string>} статический ответ
 */
async function generateStaticResponse(messages) {
  // Получаем последнее сообщение пользователя
  const lastUserMessage = messages.filter((msg) => msg.role === 'user').pop();
  const userText = lastUserMessage?.text?.toLowerCase() || '';

  // Простые ответы на основе ключевых слов
  if (userText.includes('рассчитать') || userText.includes('расчет')) {
    return `🎯 Для расчёта пенсионных накоплений мне нужны следующие данные:

1) Пол (жен/муж) — ?
2) Возраст (полных лет) — ?
3) Официальный среднемесячный доход «до НДФЛ» (руб/мес) — ?
4) Цель: допвыплата (руб/мес) или капитал к началу выплат (руб) — ?
5) Планируемый регулярный взнос в ПДС (руб/мес) — ?
6) Когда начать выплаты: «по общему правилу» или «через N лет» — ?

По желанию (для точности):
7) Стартовый капитал для ПДС (если есть), руб — ?
8) Ставка НДФЛ: 13% (по умолчанию) / 15% — ?
9) Реинвестировать налоговый вычет обратно в ПДС: да (по умолчанию) / нет — ?

Пожалуйста, предоставьте эти данные для расчёта.`;
  }

  if (userText.includes('что такое пдс') || userText.includes('пдс')) {
    return `✨ Что такое ПДС

Программа долгосрочных сбережений (ПДС) — это новый способ формировать личный капитал 💰.
Её запустили по инициативе правительства, Минфина и Банка России 🏛️.
Главная цель — помочь гражданам создать дополнительный доход и финансовую «подушку» на будущее.

👥 Участвовать может любой совершеннолетний: достаточно заключить договор с НПФ.

💡 Что даёт ПДС:

💸 Господдержка: прибавка к взносам в первые 10 лет (по ФЗ № 177-ФЗ от 13.07.2024).

🛡️ Защита: страхование вложений и дохода.

💰 Налоговый вычет каждый год.

⏳ Гибкость: можно забрать деньги через 15 лет или раньше — в особых случаях.

👨‍👩‍👧 Наследование: сбережения переходят родным.

🔗 Подробнее: [объясняем.рф](https://объясняем.рф/articles/useful/kak-priumnozhit-i-poluchit-nakopitelnuyu-pensiyu/)

Хотите рассчитать свои накопления?`;
  }

  if (userText.includes('привет') || userText.includes('здравствуй')) {
    return `👋 Привет! Я помогу вам разобраться с пенсионными накоплениями через Программу долгосрочных сбережений (ПДС).

Вы можете:
• Узнать что такое ПДС
• Рассчитать свои накопления
• Получить персональные рекомендации

Что вас интересует?`;
  }

  if (userText.includes('спасибо') || userText.includes('благодарю')) {
    return `😊 Пожалуйста! Рад был помочь с вопросами по пенсионным накоплениям.

Если у вас есть ещё вопросы по ПДС или нужен расчёт — обращайтесь!`;
  }

  // Стандартный ответ для неопознанных запросов
  return `🤔 Я специализируюсь на консультациях по Программе долгосрочных сбережений (ПДС).

Вы можете:
• Узнать что такое ПДС
• Рассчитать свои накопления
• Получить персональные рекомендации

Используйте кнопки меню или напишите "рассчитать" для начала расчёта.`;
}
import {
  MESSAGES,
  createMainKeyboard,
  createPdfKeyboard,
  createBackToMainKeyboard,
  createConfirmDataKeyboard,
  createInfoKeyboard,
  getCommandType,
} from './messages.js';
import {
  startCalculator,
  handleGoalSelection,
  handleUserInput,
  handlePayoutStartSelection,
  handleYesNoSelection,
  handleStartAgain,
  handleCancel,
  isInCalculator,
  CALCULATION_GOALS,
} from '../calculator/index.js';
import { logger } from '../logger.js';
import { markUpdateStart, markUpdateOk, markUpdateErr, markLlm } from '../metrics.js';
import {
  getChatContext,
  addMessageToContext,
  clearChatContext,
  setChatState,
  getChatState,
} from '../storage/chatContext.js';
import { generatePdfReport } from '../pdf/pdfGenerator.js';

/**
 * Проверяет, является ли ответ бота запросом на подтверждение данных
 * @param {string} response - Ответ бота
 * @returns {boolean} true если это запрос на подтверждение
 */
function isDataConfirmationRequest(response) {
  // Проверяем наличие индикаторов запроса на подтверждение данных
  const confirmationIndicators = [
    '📋 Подтвердите введённые данные',
    'Проверьте правильность данных',
    'Возраст:',
    'Доход:',
    'Цель:',
    'Взнос:',
    'Начать выплаты:',
  ];

  return confirmationIndicators.some((indicator) => response.includes(indicator));
}

/**
 * Проверяет, является ли ответ бота расчётом пенсионных накоплений
 * @param {string} response - Ответ бота
 * @returns {boolean} true если это расчёт
 */
function isCalculationResponse(response) {
  // Проверяем наличие ключевых индикаторов расчёта
  const calculationIndicators = [
    '📊 Результаты:',
    'Требуемый взнос:',
    'Прогноз капитала',
    'Ежемесячная выплата',
    'Разбивка притока:',
    '💰 Личные взносы:',
    '🏛️ Господдержка:',
    '💸 Налоговый вычет:',
  ];

  return calculationIndicators.some((indicator) => response.includes(indicator));
}

/**
 * Начинает диалог расчёта с пошаговым калькулятором
 */
async function startCalculationDialog(chatId, bot) {
  try {
    await bot.sendChatAction(chatId, 'typing');

    // Добавляем сообщение пользователя в контекст
    addMessageToContext(chatId, 'user', 'рассчитать');

    // Запускаем пошаговый калькулятор
    await startCalculator(chatId, bot);

    markLlm(true);
    markUpdateOk();
  } catch (e) {
    markLlm(false);
    markUpdateErr();
    logger.error({ chatId, err: e }, 'calculation:error');
    await bot.sendMessage(chatId, MESSAGES.LLM_ERROR);
  }
}

/**
 * Обрабатывает подтверждение данных и выполняет расчёт
 */
async function processDataConfirmation(chatId, bot) {
  try {
    await bot.sendChatAction(chatId, 'typing');

    // Получаем контекст чата
    const context = getChatContext(chatId);

    // Формируем сообщения для статического ответа (контекст + подтверждение)
    const messages = [
      ...context.map((msg) => ({ role: msg.role, text: msg.text })),
      { role: 'user', text: 'подтверждаю данные, выполни расчёт с введенными параметрами' },
    ];

    const reply = await generateStaticResponse(messages);

    // Добавляем сообщение пользователя о подтверждении в контекст
    addMessageToContext(
      chatId,
      'user',
      'подтверждаю данные, выполни расчёт с введенными параметрами'
    );

    // Добавляем ответ бота в контекст
    addMessageToContext(chatId, 'assistant', reply);

    markLlm(true);

    // Проверяем, является ли ответ расчётом
    const isCalculation = isCalculationResponse(reply);

    // Сбрасываем состояние чата после обработки подтверждения
    setChatState(chatId, 'idle');

    // Отправляем ответ с кнопкой PDF только для расчётов
    if (isCalculation) {
      const keyboard = createPdfKeyboard();
      await bot.sendMessage(chatId, reply, {
        disable_web_page_preview: true,
        ...keyboard,
      });
    } else {
      // Для обычных ответов показываем только кнопку "Главное меню"
      const keyboard = createBackToMainKeyboard();
      await bot.sendMessage(chatId, reply, {
        disable_web_page_preview: true,
        ...keyboard,
      });
    }

    markUpdateOk();
  } catch (e) {
    markLlm(false);
    markUpdateErr();
    logger.error({ chatId, err: e }, 'confirmation:error');
    await bot.sendMessage(chatId, MESSAGES.LLM_ERROR);
  }
}

/**
 * Генерирует и отправляет PDF-отчёт
 */
async function generateAndSendPdf(chatId, bot) {
  try {
    await bot.sendChatAction(chatId, 'typing');

    // Получаем последний ответ бота из контекста
    const context = getChatContext(chatId);

    const lastBotMessage = context.filter((msg) => msg.role === 'assistant').pop();

    if (!lastBotMessage) {
      logger.warn({ chatId, contextLength: context.length }, 'pdf:noData');
      await bot.sendMessage(chatId, 'Нет данных для генерации отчёта. Сначала выполните расчёт.');
      return;
    }

    if (!lastBotMessage.text || lastBotMessage.text.trim().length === 0) {
      logger.warn({ chatId }, 'pdf:emptyMessage');
      await bot.sendMessage(chatId, 'Ответ бота пуст. Нет данных для генерации отчёта.');
      return;
    }

    // Генерируем PDF
    const pdfBuffer = await generatePdfReport(lastBotMessage.text, {
      reportDate: new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      filename: `pension-report-${chatId}-${Date.now()}`,
    });

    // Проверяем размер PDF
    if (!pdfBuffer || pdfBuffer.length === 0) {
      logger.error({ chatId }, 'pdf:emptyBuffer');
      await bot.sendMessage(chatId, 'Ошибка: сгенерированный PDF пуст. Попробуйте позже.');
      return;
    }

    // Отправляем PDF как документ
    await bot.sendDocument(chatId, pdfBuffer, {
      filename: `pension-report-${Date.now()}.pdf`,
      caption: '📄 Ваш отчёт по пенсионным накоплениям готов!',
    });
  } catch (e) {
    // Детальное логирование ошибки
    logger.error(
      {
        chatId,
        err: e.message,
        stack: e.stack,
        errorName: e.name,
        errorCode: e.code,
      },
      'pdf:error'
    );

    // Определяем тип ошибки и отправляем соответствующее сообщение
    let errorMessage = 'Ошибка при генерации PDF-отчёта. Попробуйте позже.';

    if (e.message.includes('браузер для генерации PDF недоступен')) {
      errorMessage =
        '❌ Ошибка: браузер для генерации PDF недоступен. Обратитесь к администратору.';
    } else if (e.message.includes('превышено время ожидания') || e.message.includes('timeout')) {
      errorMessage = '⏱️ Ошибка: превышено время ожидания при генерации PDF. Попробуйте позже.';
    } else if (e.message.includes('некорректные данные')) {
      errorMessage = '📝 Ошибка: некорректные данные для генерации PDF.';
    } else if (e.message.includes('нет данных')) {
      errorMessage = '📄 Ошибка: нет данных для генерации PDF.';
    } else if (e.message.includes('не найдены необходимые файлы')) {
      errorMessage = '🔧 Ошибка: не найдены необходимые файлы для генерации PDF.';
    } else if (e.message.includes('недостаточно прав')) {
      errorMessage = '🔐 Ошибка: недостаточно прав для генерации PDF.';
    } else if (e.message.includes('PDF generation failed')) {
      errorMessage = '📄 Ошибка: не удалось сгенерировать PDF. Попробуйте позже.';
    } else if (e.message.includes('ENOENT') || e.message.includes('ENOTFOUND')) {
      errorMessage = '🔧 Ошибка: не найдены необходимые файлы. Обратитесь к администратору.';
    } else if (e.message.includes('EACCES') || e.message.includes('EPERM')) {
      errorMessage = '🔐 Ошибка: недостаточно прав доступа. Обратитесь к администратору.';
    }

    await bot.sendMessage(chatId, errorMessage);
  }
}

/**
 * Обработка команд пользователя
 */
async function handleCommand(chatId, command, bot) {
  switch (command) {
    case 'start': {
      clearChatContext(chatId);
      setChatState(chatId, 'idle');
      const keyboard = createMainKeyboard();
      await bot.sendMessage(chatId, MESSAGES.WELCOME, keyboard);
      break;
    }
    case 'clear':
      clearChatContext(chatId);
      setChatState(chatId, 'idle');
      await bot.sendMessage(chatId, MESSAGES.CLEAR_CONTEXT);
      break;
    case 'calculate':
      // Сразу начинаем диалог с LLM для сбора данных
      await startCalculationDialog(chatId, bot);
      break;
    case 'info': {
      const keyboard = createInfoKeyboard();
      await bot.sendMessage(chatId, MESSAGES.INFO_ABOUT_PDS, keyboard);
      break;
    }
    default:
      await bot.sendMessage(chatId, MESSAGES.UNKNOWN_COMMAND);
  }
}

export function attachBotHandlers(bot) {
  // Обработчик команд /start и /clear
  bot.onText(/^\/(start|clear)\b/, async (msg) => {
    const chatId = msg.chat.id;
    const command = msg.text.split(' ')[0].substring(1); // убираем /

    // Используем новый ПДС-калькулятор для команды /start
    if (command === 'start') {
      await handlePDSStartCommand(bot, chatId);
    } else {
      await handleCommand(chatId, command, bot);
    }
  });

  // Обработчик команды /menu для ПДС-калькулятора
  bot.onText(/^\/menu\b/, async (msg) => {
    const chatId = msg.chat.id;
    await handlePDSMenuCommand(bot, chatId);
  });

  // Обработчик текстовых команд
  bot.onText(/^(рассчитать|что такое пдс\?*)$/i, async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase().trim();
    const command = getCommandType(text) || 'unknown';

    // Для команды calculate сразу начинаем диалог
    if (command === 'calculate') {
      await startCalculationDialog(chatId, bot);
    } else {
      await handleCommand(chatId, command, bot);
    }
  });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = (msg.text ?? '').trim();
    if (!text || text.startsWith('/')) return;

    // Проверяем, является ли сообщение кнопкой ПДС-калькулятора
    if (
      text.includes('💰 Дополнительная выплата') ||
      text.includes('🏦 Капитал к началу выплат') ||
      text.includes('💸 Без цели — расчёт от взноса') ||
      text.includes('🏠 Главное меню')
    ) {
      await handlePDSTextMessage(bot, chatId, text);
      return;
    }

    // Проверяем, находится ли пользователь в процессе калькулятора
    if (isInCalculator(chatId)) {
      const handled = await handleUserInput(chatId, text, bot);
      if (handled) {
        return; // Обработано калькулятором
      }
    }

    // Проверяем состояние чата - если ожидается подтверждение данных, игнорируем текстовые сообщения
    const chatState = getChatState(chatId);
    if (chatState === 'waiting_confirmation') {
      await bot.sendMessage(
        chatId,
        '⏳ Пожалуйста, используйте кнопки для подтверждения или изменения данных.'
      );
      return;
    }

    markUpdateStart();

    if (!tryLock(chatId)) {
      await bot.sendMessage(chatId, MESSAGES.WAIT_PREVIOUS);
      return;
    }

    try {
      await bot.sendChatAction(chatId, 'typing');

      // Добавляем сообщение пользователя в контекст
      addMessageToContext(chatId, 'user', text);

      // Получаем контекст чата
      const context = getChatContext(chatId);

      // Формируем сообщения для статического ответа (контекст)
      const messages = [...context.map((msg) => ({ role: msg.role, text: msg.text }))];

      const reply = await generateStaticResponse(messages);

      // Добавляем ответ бота в контекст
      addMessageToContext(chatId, 'assistant', reply);

      markLlm(true);

      // Проверяем тип ответа
      const isDataConfirmation = isDataConfirmationRequest(reply);
      const isCalculation = isCalculationResponse(reply);

      // Отправляем ответ с соответствующей клавиатурой
      if (isDataConfirmation) {
        // Для запросов на подтверждение данных показываем кнопки подтверждения
        setChatState(chatId, 'waiting_confirmation');
        const keyboard = createConfirmDataKeyboard();
        await bot.sendMessage(chatId, reply, {
          disable_web_page_preview: true,
          ...keyboard,
        });
      } else if (isCalculation) {
        // Для расчётов показываем кнопку PDF
        const keyboard = createPdfKeyboard();
        await bot.sendMessage(chatId, reply, {
          disable_web_page_preview: true,
          ...keyboard,
        });
      } else {
        // Для обычных ответов показываем только кнопку "Главное меню"
        const keyboard = createBackToMainKeyboard();
        await bot.sendMessage(chatId, reply, {
          disable_web_page_preview: true,
          ...keyboard,
        });
      }

      markUpdateOk();
    } catch (e) {
      markLlm(false);
      markUpdateErr();
      logger.error({ chatId, err: e }, 'msg:out:error');
      await bot.sendMessage(chatId, MESSAGES.LLM_ERROR);
    } finally {
      unlock(chatId);
    }
  });

  // Обработчик нажатий на кнопки
  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    try {
      // Сначала проверяем, является ли это callback-запросом ПДС-калькулятора
      if (
        data.includes('confirm_data') ||
        data.includes('edit_data') ||
        data.includes('main_menu') ||
        data.includes('payout_') ||
        data.includes('start_again') ||
        data.includes('cancel') ||
        data.includes('goal_') ||
        data === MESSAGES.CALLBACK_DATA.CALCULATE ||
        data === MESSAGES.CALLBACK_DATA.INFO ||
        data === MESSAGES.CALLBACK_DATA.CONSULTATION
      ) {
        await handlePDSCallbackQuery(bot, callbackQuery);
        return;
      }
      // Обработка PDF-генерации
      if (data === MESSAGES.CALLBACK_DATA.DOWNLOAD_PDF) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Генерирую PDF...' });
        await generateAndSendPdf(chatId, bot);
        return;
      }

      // Обработка подтверждения данных
      if (data === MESSAGES.CALLBACK_DATA.CONFIRM_DATA) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Выполняю расчёт...' });
        await processDataConfirmation(chatId, bot);
        return;
      }

      // Обработка редактирования данных
      if (data === MESSAGES.CALLBACK_DATA.EDIT_DATA) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Внесите изменения в данные.' });
        // Сбрасываем состояние и очищаем контекст, начинаем заново
        setChatState(chatId, 'idle');
        clearChatContext(chatId);
        await startCalculationDialog(chatId, bot);
        return;
      }

      // Обработка кнопки консультации
      if (data === MESSAGES.CALLBACK_DATA.CONSULTATION) {
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: 'Функция консультации в разработке',
        });
        const keyboard = createBackToMainKeyboard();
        await bot.sendMessage(chatId, MESSAGES.CONSULTATION_IN_DEVELOPMENT, keyboard);
        return;
      }

      // Обработка кнопок калькулятора - выбор цели
      if (data === MESSAGES.CALLBACK_DATA.GOAL_ADDITIONAL_PAYMENT) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Выбрана дополнительная выплата' });
        await handleGoalSelection(chatId, CALCULATION_GOALS.ADDITIONAL_PAYMENT, bot);
        return;
      }

      if (data === MESSAGES.CALLBACK_DATA.GOAL_CAPITAL_TO_PAYOUT) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Выбран капитал к началу выплат' });
        await handleGoalSelection(chatId, CALCULATION_GOALS.CAPITAL_TO_PAYOUT, bot);
        return;
      }

      if (data === MESSAGES.CALLBACK_DATA.GOAL_NO_GOAL) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Выбрано без цели' });
        await handleGoalSelection(chatId, CALCULATION_GOALS.NO_GOAL, bot);
        return;
      }

      // Обработка выбора времени начала выплат
      if (data === MESSAGES.CALLBACK_DATA.PAYOUT_BY_RULE) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'По общему правилу' });
        await handlePayoutStartSelection(chatId, 'rule', bot);
        return;
      }

      if (data === MESSAGES.CALLBACK_DATA.PAYOUT_IN_YEARS) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Через N лет' });
        await handlePayoutStartSelection(chatId, 'years', bot);
        return;
      }

      // Обработка Да/Нет
      if (data === MESSAGES.CALLBACK_DATA.YES) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Да' });
        await handleYesNoSelection(chatId, true, bot);
        return;
      }

      if (data === MESSAGES.CALLBACK_DATA.NO) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Нет' });
        await handleYesNoSelection(chatId, false, bot);
        return;
      }

      // Обработка кнопок при превышении лимита ошибок
      if (data === MESSAGES.CALLBACK_DATA.START_AGAIN) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Начинаем сначала' });
        await handleStartAgain(chatId, bot);
        return;
      }

      if (data === MESSAGES.CALLBACK_DATA.CANCEL) {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Отменено' });
        await handleCancel(chatId, bot);
        return;
      }

      // Маппинг callback_data на команды
      const commandMap = {
        [MESSAGES.CALLBACK_DATA.CALCULATE]: 'calculate',
        [MESSAGES.CALLBACK_DATA.INFO]: 'info',
        [MESSAGES.CALLBACK_DATA.MAIN_MENU]: 'start',
      };

      const command = commandMap[data];
      if (command) {
        // Для команды calculate не показываем промежуточное сообщение
        if (command === 'calculate') {
          await bot.answerCallbackQuery(callbackQuery.id, { text: 'Начинаем расчёт!' });
          await startCalculationDialog(chatId, bot);
        } else {
          // Отвечаем на callback
          const responseText = MESSAGES.CALLBACK_RESPONSES[command.toUpperCase()] || 'OK';
          await bot.answerCallbackQuery(callbackQuery.id, { text: responseText });

          // Выполняем команду
          await handleCommand(chatId, command, bot);
        }
      }
    } catch (e) {
      logger.error({ chatId, err: e }, 'callback:error');
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: MESSAGES.CALLBACK_RESPONSES.ERROR,
      });
    }
  });

  bot.on('polling_error', (err) => logger.error({ err }, 'polling:error'));
}
