/**
 * Клавиатуры для ПДС-калькулятора
 * Использует ReplyKeyboardMarkup для основного меню и InlineKeyboard для выбора опций
 */

// Главное меню с тремя сценариями
export function createMainMenuKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        ['💰 Дополнительная выплата'],
        ['🏦 Капитал к началу выплат'],
        ['💸 Без цели — расчёт от взноса'],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  };
}

// Клавиатура выбора пола
export function createGenderKeyboard() {
  return {
    reply_markup: {
      keyboard: [['👨 Мужчина', '👩 Женщина']],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
}

// Клавиатура выбора режима взносов
export function createContributionModeKeyboard() {
  return {
    reply_markup: {
      keyboard: [['📅 Ежемесячно', '📆 Ежегодно']],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
}

// Клавиатура выбора времени начала выплат
export function createPayoutStartKeyboard() {
  return {
    reply_markup: {
      keyboard: [['📅 По общему правилу'], ['⏰ Через N лет']],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
}

// Клавиатура выбора ставки НДФЛ
export function createTaxRateKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        ['13%', '15%'],
        ['18%', '20%', '22%'],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
}

// Клавиатура Да/Нет
export function createYesNoKeyboard() {
  return {
    reply_markup: {
      keyboard: [['✅ Да', '❌ Нет']],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
}

// Клавиатура для возврата в главное меню
export function createBackToMainKeyboard() {
  return {
    reply_markup: {
      keyboard: [['🏠 Главное меню']],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
}

// Inline клавиатура для подтверждения данных
export function createConfirmDataInlineKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Подтвердить данные', callback_data: 'confirm_data' },
          { text: '✏️ Изменить данные', callback_data: 'edit_data' },
        ],
        [{ text: '🏠 Главное меню', callback_data: 'main_menu' }],
      ],
    },
  };
}

// Inline клавиатура для выбора модели выплат
export function createPayoutModelInlineKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📊 На 10 лет', callback_data: 'payout_10_years' },
          { text: '♾️ Пожизненно (черновая)', callback_data: 'payout_lifetime' },
        ],
        [{ text: '🏠 Главное меню', callback_data: 'main_menu' }],
      ],
    },
  };
}

// Inline клавиатура для результата расчёта
export function createResultInlineKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📄 Сохранить PDF (в разработке)', callback_data: 'save_pdf' }],
        [{ text: '🏠 Главное меню', callback_data: 'main_menu' }],
      ],
    },
  };
}

// Inline клавиатура для превышения лимита ошибок
export function createTooManyErrorsInlineKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔄 Начать сначала', callback_data: 'start_again' },
          { text: '❌ Отмена', callback_data: 'cancel' },
        ],
        [{ text: '🏠 Главное меню', callback_data: 'main_menu' }],
      ],
    },
  };
}
