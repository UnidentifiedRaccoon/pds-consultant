/**
 * Фразы и сообщения бота Capital Compass AI
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
    DOWNLOAD_PDF: '📄 Скачать PDF',
    CONFIRM_DATA: '✅ Подтвердить данные',
    EDIT_DATA: '✏️ Изменить данные',
  },

  /** Данные для callback-запросов */
  CALLBACK_DATA: {
    CALCULATE: 'calculate',
    INFO: 'info',
    MAIN_MENU: 'main_menu',
    DOWNLOAD_PDF: 'download_pdf',
    CONFIRM_DATA: 'confirm_data',
    EDIT_DATA: 'edit_data',
  },

  // ========================================
  // ОСНОВНЫЕ ФУНКЦИИ
  // ========================================

  /** Информация о программе долгосрочных сбережений */
  INFO_ABOUT_PDS: `Программа долгосрочных сбережений (ПДС) — это государственная программа для накопления на пенсию с дополнительными льготами:

🏛️ Государственное софинансирование до 36 000 ₽ в год
💸 Налоговый вычет до 52 000 ₽ в год
🔒 Гарантирование средств государством до 2,8 млн ₽

Отправьте "рассчитать" для персонального расчёта!`,

  // ========================================
  // CALLBACK ОТВЕТЫ
  // ========================================

  /** Ответы на нажатия кнопок */
  CALLBACK_RESPONSES: {
    CALCULATE: 'Начинаем расчёт! Отправьте "рассчитать" или напишите свой вопрос.',
    INFO: 'Рассказываю о ПДС!',
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
