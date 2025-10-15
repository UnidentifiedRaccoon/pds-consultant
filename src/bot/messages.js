/**
 * Фразы и сообщения бота PDS Consultant
 * Централизованное хранение всех текстов для удобства редактирования
 */

export const MESSAGES = {
  // ========================================
  // ПРИВЕТСТВИЕ И НАВИГАЦИЯ
  // ========================================

  /** Приветственное сообщение при команде /start */
  WELCOME: `👋 Привет! Я Capital Compass AI.

🎯 Что я умею:
• Рассчитать взносы по ПДС
• Спрогнозировать капитал к пенсии
• Вычислить ежемесячную выплату

🚀 Готов начать?
— Нажми «🧮 Рассчитать» или отправь «рассчитать»
— Хочешь узнать о правилах ПДС — выбери «ℹ️ Что такое ПДС?»`,

  /** Сообщение об очистке контекста чата */
  CLEAR_CONTEXT: 'Контекст чата очищен. Начинаем с чистого листа! 🧹',

  // ========================================
  // КНОПКИ И ИНТЕРФЕЙС
  // ========================================

  /** Тексты кнопок */
  BUTTONS: {
    CALCULATE: '🧮 Рассчитать',
    INFO: 'ℹ️ Что такое ПДС?',
    CONSULTATION: '💬 Получить консультацию',
    DOWNLOAD_PDF: '📄 Скачать PDF',
    CONFIRM_DATA: '✅ Подтвердить данные',
    EDIT_DATA: '✏️ Изменить данные',
    // Кнопки для калькулятора
    ADDITIONAL_PAYMENT: '💰 Дополнительная выплата',
    CAPITAL_TO_PAYOUT: '🏦 Капитал к началу выплат',
    NO_GOAL: '💸 Без цели — рассчитать от взноса',
    BY_RULE: '📅 По общему правилу',
    IN_YEARS: '⏰ Через N лет',
    YES: '✅ Да',
    NO: '❌ Нет',
    START_AGAIN: '🔄 Начать сначала',
    CANCEL: '❌ Отмена',
  },

  /** Данные для callback-запросов */
  CALLBACK_DATA: {
    CALCULATE: 'calculate',
    INFO: 'info',
    CONSULTATION: 'consultation',
    MAIN_MENU: 'main_menu',
    DOWNLOAD_PDF: 'download_pdf',
    CONFIRM_DATA: 'confirm_data',
    EDIT_DATA: 'edit_data',
    // Callback данные для калькулятора
    GOAL_ADDITIONAL_PAYMENT: 'goal_additional_payment',
    GOAL_CAPITAL_TO_PAYOUT: 'goal_capital_to_payout',
    GOAL_NO_GOAL: 'goal_no_goal',
    PAYOUT_BY_RULE: 'payout_by_rule',
    PAYOUT_IN_YEARS: 'payout_in_years',
    YES: 'yes',
    NO: 'no',
    START_AGAIN: 'start_again',
    CANCEL: 'cancel',
  },

  // ========================================
  // ОСНОВНЫЕ ФУНКЦИИ
  // ========================================

  /** Информация о программе долгосрочных сбережений */
  INFO_ABOUT_PDS: `✨ Что такое ПДС

Программа долгосрочных сбережений (ПДС) — это новый способ формировать личный капитал 💰. Её запустили по инициативе правительства, Минфина и Банка России 🏛️. Цель — помочь гражданам создать дополнительный доход и финансовую «подушку» на будущее.

👥 Участвовать может любой совершеннолетний: достаточно заключить договор с НПФ.

💡 Что даёт ПДС:
• 💸 Господдержка: прибавка к взносам в первые 10 лет (ФЗ №177-ФЗ от 13.07.2024)
• 🛡️ Защита: страхование вложений и дохода
• 💰 Налоговый вычет каждый год
• ⏳ Гибкость: можно забрать деньги через 15 лет или раньше — в особых случаях
• 👨‍👩‍👧 Наследование: сбережения переходят родным

🔗 Подробнее: https://объясняем.рф/articles/useful/kak-priumnozhit-i-poluchit-nakopitelnuyu-pensiyu/

Отправьте "рассчитать" для персонального расчёта!`,

  /** Сообщение о функции консультации в разработке */
  CONSULTATION_IN_DEVELOPMENT: `🚧 Функция консультации находится в разработке

В данный момент я могу помочь вам:
• Рассчитать взносы по ПДС
• Спрогнозировать капитал к пенсии
• Вычислить ежемесячную выплату

Скоро добавлю возможность персональных консультаций!`,

  // ========================================
  // ПОШАГОВЫЙ КАЛЬКУЛЯТОР
  // ========================================

  /** Выбор цели расчета */
  CALCULATOR_GOAL_SELECTION: `🎯 Выберите сценарий расчёта ПДС

Я помогу вам рассчитать оптимальную стратегию накоплений! Выберите, что вас больше всего интересует:`,

  /** Выбор цели расчета (детальное описание) */
  CALCULATOR_GOAL_SELECTION_DETAILED: `🎯 Выбери цель расчёта:

💰 Дополнительная выплата — рассчитаю, сколько нужно вносить для получения желаемой ежемесячной выплаты

🏦 Капитал к началу выплат — рассчитаю, какой капитал накоплю к определённому возрасту

💸 Без цели — рассчитаю от взноса — покажу, что получится при регулярных взносах`,

  /** Сообщение о функции в разработке */
  FEATURE_IN_DEVELOPMENT: `🛠️ Эта функция пока в разработке. Возвращаюсь в главное меню.`,

  /** Вопросы пошагового опроса */
  CALCULATOR_QUESTIONS: {
    GENDER: '👤 Укажи пол для обращения (м/ж):',
    AGE: '🎂 Возраст (полных лет) — ?',
    INCOME: '💵 Среднемесячный доход до НДФЛ (руб/мес) — ?',
    PAYOUT_START: '📅 Когда начать выплаты:',
    PAYOUT_YEARS: '⏰ Через сколько лет начать выплаты?',
    STARTING_CAPITAL: '💰 Есть ли стартовый капитал для ПДС (если нет — введи 0):',
    TAX_RATE: '📊 Укажи ставку НДФЛ: 13 или 15 (%)',
    REINVEST_TAX: '🔄 Реинвестировать вычет?',
  },

  /** Сообщения об ошибках валидации */
  VALIDATION_ERRORS: {
    GENDER: '⚠️ Введи м/ж (или: мужской/женский)',
    AGE: '⚠️ Введи целое число от 18 до 70',
    INCOME: '⚠️ Нужна сумма от 10 000 до 1 000 000 руб/мес',
    PAYOUT_YEARS: '⚠️ Введи целое число от 1 до 30',
    STARTING_CAPITAL: '⚠️ Введи неотрицательное число (0, если нет капитала)',
    TAX_RATE: '⚠️ Допустимые значения: 13 или 15',
    REINVEST_TAX: '⚠️ Выбери Да или Нет',
  },

  /** Сообщение о завершении сбора данных */
  DATA_COLLECTION_COMPLETE: '✅ Все данные получены. Выполняю расчёт…',

  /** Сообщение о превышении лимита ошибок */
  TOO_MANY_ERRORS: '❌ Слишком много ошибок. Хочешь начать расчёт сначала?',

  /** Сообщение о сбросе сессии */
  SESSION_RESET: '🔄 Сессия сброшена. Начинаем заново!',

  // ========================================
  // CALLBACK ОТВЕТЫ
  // ========================================

  /** Ответы на нажатия кнопок */
  CALLBACK_RESPONSES: {
    CALCULATE: 'Начинаем расчёт! Отправьте "рассчитать" или напишите свой вопрос.',
    INFO: 'Рассказываю о ПДС!',
    CONSULTATION: 'Функция консультации в разработке',
    DOWNLOAD_PDF: 'Генерирую PDF-отчёт...',
    CONFIRM_DATA: 'Выполняю расчёт...',
    EDIT_DATA: 'Внесите изменения в данные.',
    ERROR: 'Произошла ошибка. Попробуйте ещё раз.',
  },

  // ========================================
  // СИСТЕМНЫЕ СООБЩЕНИЯ И ОШИБКИ
  // ========================================

  /** Сообщение о том, что бот занят предыдущим запросом */
  WAIT_PREVIOUS: 'Подожди, ещё отвечаю на прошлый вопрос…',

  /** Сообщение об ошибке LLM */
  LLM_ERROR: 'Не удалось получить ответ. Попробуй ещё раз позже.',

  /** Сообщение о неизвестной команде */
  UNKNOWN_COMMAND: `❓ Не понимаю эту команду.

💡 Что можно сделать:
• Используйте кнопки ниже
• Напишите "рассчитать" для начала работы
• Отправьте /start для перезапуска`,

  // ========================================
  // ТЕКСТОВЫЕ КОМАНДЫ
  // ========================================

  /** Текстовые команды пользователя */
  TEXT_COMMANDS: {
    CALCULATE: 'рассчитать',
    INFO: 'что такое пдс',
  },
};

// ========================================
// УТИЛИТЫ ДЛЯ СОЗДАНИЯ ИНТЕРФЕЙСА
// ========================================

/**
 * Создает клавиатуру с кнопками для главного меню
 * @returns {Object} Объект клавиатуры для Telegram
 */
export function createMainKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CALCULATE,
            callback_data: MESSAGES.CALLBACK_DATA.CALCULATE,
          },
          {
            text: MESSAGES.BUTTONS.INFO,
            callback_data: MESSAGES.CALLBACK_DATA.INFO,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.CONSULTATION,
            callback_data: MESSAGES.CALLBACK_DATA.CONSULTATION,
          },
        ],
      ],
    },
  };
}

/**
 * Создает клавиатуру для возврата в главное меню
 * @returns {Object} Объект клавиатуры для Telegram
 */
export function createBackToMainKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🏠 Главное меню',
            callback_data: MESSAGES.CALLBACK_DATA.MAIN_MENU,
          },
        ],
      ],
    },
  };
}

/**
 * Создает клавиатуру с кнопкой скачивания PDF
 * @returns {Object} Объект клавиатуры для Telegram
 */
export function createPdfKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.DOWNLOAD_PDF,
            callback_data: MESSAGES.CALLBACK_DATA.DOWNLOAD_PDF,
          },
        ],
        [
          {
            text: '🏠 Главное меню',
            callback_data: MESSAGES.CALLBACK_DATA.MAIN_MENU,
          },
        ],
      ],
    },
  };
}

/**
 * Создает клавиатуру для подтверждения данных
 * @returns {Object} Объект клавиатуры для Telegram
 */
export function createConfirmDataKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CONFIRM_DATA,
            callback_data: MESSAGES.CALLBACK_DATA.CONFIRM_DATA,
          },
          {
            text: MESSAGES.BUTTONS.EDIT_DATA,
            callback_data: MESSAGES.CALLBACK_DATA.EDIT_DATA,
          },
        ],
        [
          {
            text: '🏠 Главное меню',
            callback_data: MESSAGES.CALLBACK_DATA.MAIN_MENU,
          },
        ],
      ],
    },
  };
}

/**
 * Создает клавиатуру для информационного сообщения о ПДС
 * @returns {Object} Объект клавиатуры для Telegram
 */
export function createInfoKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CALCULATE,
            callback_data: MESSAGES.CALLBACK_DATA.CALCULATE,
          },
        ],
        [
          {
            text: '🏠 Главное меню',
            callback_data: MESSAGES.CALLBACK_DATA.MAIN_MENU,
          },
        ],
      ],
    },
  };
}

/**
 * Создает клавиатуру для выбора цели расчета
 * @returns {Object} Объект клавиатуры для Telegram
 */
export function createGoalSelectionKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.ADDITIONAL_PAYMENT,
            callback_data: MESSAGES.CALLBACK_DATA.GOAL_ADDITIONAL_PAYMENT,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_TO_PAYOUT,
            callback_data: MESSAGES.CALLBACK_DATA.GOAL_CAPITAL_TO_PAYOUT,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.NO_GOAL,
            callback_data: MESSAGES.CALLBACK_DATA.GOAL_NO_GOAL,
          },
        ],
        [
          {
            text: '🏠 Главное меню',
            callback_data: MESSAGES.CALLBACK_DATA.MAIN_MENU,
          },
        ],
      ],
    },
  };
}

/**
 * Создает клавиатуру для выбора времени начала выплат
 * @returns {Object} Объект клавиатуры для Telegram
 */
export function createPayoutStartKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.BY_RULE,
            callback_data: MESSAGES.CALLBACK_DATA.PAYOUT_BY_RULE,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.IN_YEARS,
            callback_data: MESSAGES.CALLBACK_DATA.PAYOUT_IN_YEARS,
          },
        ],
        [
          {
            text: '🏠 Главное меню',
            callback_data: MESSAGES.CALLBACK_DATA.MAIN_MENU,
          },
        ],
      ],
    },
  };
}

/**
 * Создает клавиатуру Да/Нет
 * @returns {Object} Объект клавиатуры для Telegram
 */
export function createYesNoKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.YES,
            callback_data: MESSAGES.CALLBACK_DATA.YES,
          },
          {
            text: MESSAGES.BUTTONS.NO,
            callback_data: MESSAGES.CALLBACK_DATA.NO,
          },
        ],
        [
          {
            text: '🏠 Главное меню',
            callback_data: MESSAGES.CALLBACK_DATA.MAIN_MENU,
          },
        ],
      ],
    },
  };
}

/**
 * Создает клавиатуру для превышения лимита ошибок
 * @returns {Object} Объект клавиатуры для Telegram
 */
export function createTooManyErrorsKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.START_AGAIN,
            callback_data: MESSAGES.CALLBACK_DATA.START_AGAIN,
          },
          {
            text: MESSAGES.BUTTONS.CANCEL,
            callback_data: MESSAGES.CALLBACK_DATA.CANCEL,
          },
        ],
        [
          {
            text: '🏠 Главное меню',
            callback_data: MESSAGES.CALLBACK_DATA.MAIN_MENU,
          },
        ],
      ],
    },
  };
}

/**
 * Получает тип команды по тексту
 * @param {string} text - Текст команды
 * @returns {string|null} Тип команды или null
 */
export function getCommandType(text) {
  const normalizedText = text.toLowerCase().trim();

  for (const [type, command] of Object.entries(MESSAGES.TEXT_COMMANDS)) {
    if (command === normalizedText) {
      return type.toLowerCase();
    }
  }

  return null;
}
