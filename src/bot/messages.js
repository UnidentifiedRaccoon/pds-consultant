/**
 * Фразы и сообщения бота PDS Consultant
 */

export const MESSAGES = {
  /** Приветственное сообщение при команде /start */
  WELCOME: `👋 Привет! Я бот-консультант по ПДС.

🎯 Что я умею:
• Рассчитать взносы по ПДС
• Узнать о ПДС

Выберите действие:`,

  /** Информация о программе долгосрочных сбережений */
  INFO_ABOUT_PDS: `✨ Что такое ПДС

Программа долгосрочных сбережений (ПДС) — это новый способ формировать личный капитал 💰. Её запустили по инициативе правительства, Минфина и Банка России 🏛️.

👥 Участвовать может любой совершеннолетний: достаточно заключить договор с НПФ.

💡 Что даёт ПДС:
• 💸 Господдержка: прибавка к взносам в первые 10 лет
• 🛡️ Защита: страхование вложений и дохода
• 💰 Налоговый вычет каждый год
• ⏳ Гибкость: можно забрать деньги через 15 лет
• 👨‍👩‍👧 Наследование: сбережения переходят родным

🔗 Подробнее: <a href="https://объясняем.рф/articles/useful/kak-priumnozhit-i-poluchit-nakopitelnuyu-pensiyu/">объясняем.рф</a>`,

  /** Выбор сценария расчёта */
  CALCULATE_PROMPT: `🎯 Выбери цель расчёта:

💰 Дополнительная выплата — рассчитаю, сколько нужно вносить для получения желаемой ежемесячной выплаты

🏦 Капитал к началу выплат — рассчитаю, какой капитал накоплю к определённому возрасту

💸 Без цели — рассчитаю от взноса — покажу, что получится при регулярных взносах`,

  /** Заглушки для сценариев расчёта */
  CALCULATE_RESPONSES: {
    EXTRA_PAYOUT: `💰 Расчёт дополнительной выплаты пока в разработке. Скоро добавим!`,
    WITHOUT_GOAL: `📊 Расчёт без цели пока в разработке. Скоро добавим!`,
  },

  /** Последовательность шагов для сценария "Капитал к началу выплат" */
  CAPITAL_FLOW: {
    INTRO: `🧮 Что посчитаем
• Итоговую сумму через 15 лет.
• Плюс ориентиры ежемесячных выплат (если решите не забрать всё сразу).

⏱️ Когда вообще можно получить деньги

✅ Через 15 лет — можно забрать разом или оформить ежемесячные выплаты.

⚠️ Если ежемесячная получается очень маленькой — менее 10% прожиточного минимума пенсионера — обычно разрешают забрать всё сразу.

❤️ Особые случаи (например, дорогостоящее лечение) — могут дать право на досрочное получение по правилам вашего НПФ.`,
    PROMPTS: {
      TARGET_SUM: `Сумма, которую нужно накопить к 15-му году, ₽
Введите целое число от 50 000 до 100 000 000 без разделителей.`,
      GENDER: `Пол
Выберите вариант:`,
      AGE: `Возраст сейчас, лет
Введите целое число от 18 до 100.`,
      INCOME: `Ваш среднемесячный доход (диапазон) — для расчёта софинансирования государства
Выберите подходящий вариант:`,
      NDFL: `Ставка НДФЛ (для налогового вычета)
Выберите вариант:`,
      REINVEST: `Реинвестировать налоговый вычет в ПДС?`,
    },
    ERRORS: {
      INVALID_TARGET_SUM: `Пожалуйста, введите целое число от 50 000 до 100 000 000 ₽ без пробелов и дополнительных символов.`,
      INVALID_AGE: `Пожалуйста, введите целое число от 18 до 100.`,
    },
    RESPONSES: {
      COMPLETE: `✅ Спасибо! Мы сохранили ответы. Подробный расчёт появится совсем скоро.`,
      RESULT_HEADER: `✅ Спасибо! Считаю при доходности 10% годовых и ежемесячной капитализацией…
Учту: госдоплату (для вашего диапазона дохода — до 36 000 ₽/год в течение 10 лет) и налоговый вычет по выбранной ставке.
Minfin`,
      RESULT_BODY: `Бот (результат):
📊 Сводка на конец 15-го года (разовая выплата):

Личные взносы: ≈ {personalTotal}

Ежемесячный взнос (расчётный): ≈ {monthlyContribution}/мес

Софинансирование государства: ≈ {stateTotal} (по {annualStateSupport}/год в первые 10 лет)
Minfin

Перевод пенсионных сбережений (ОПС): {opsTransfer}

Инвестиционный доход: ≈ {investmentIncome}

Налоговый вычет (сумма возвратов): ≈ {taxTotal} ({taxRate}% от ваших годовых взносов в пределах лимита 400 000 ₽/год){taxNote}
Fincult

Размер ежемесячных выплат (оценка):
• пожизненно (грубо, 20 лет): ≈ {lifePayment}/мес
• на 10 лет: ≈ {tenYearPayment}/мес
• единовременно: {lumpSum}`,
      RESTART_HINT: `Хотите попробовать другой сценарий? Нажмите «⬅️ Главное меню».`,
    },
  },

  /** Общие сообщения об ошибках */
  ERRORS: {
    GENERIC: `❌ Произошла ошибка. Попробуйте позже.`,
  },

  /** Тексты кнопок */
  BUTTONS: {
    CALCULATE: '🧮 Рассчитать',
    INFO: 'ℹ️ Что такое ПДС?',
    CALCULATE_EXTRA_PAYOUT: '💰 Доп. выплата',
    CALCULATE_CAPITAL: '🏦 Капитал к началу выплат',
    CALCULATE_WITHOUT_GOAL: '📊 Рассчитать от взноса',
    CAPITAL_CONTINUE: '➡️ Продолжить',
    CAPITAL_GENDER_MALE: '👨 Мужчина',
    CAPITAL_GENDER_FEMALE: '👩 Женщина',
    CAPITAL_INCOME_LOW: '📉 До 80 000 ₽/мес',
    CAPITAL_INCOME_MID: '📈 80 001–150 000 ₽/мес',
    CAPITAL_INCOME_HIGH: '💼 Свыше 150 000 ₽/мес',
    CAPITAL_NDFL_13: '13% НДФЛ',
    CAPITAL_NDFL_15: '15% НДФЛ',
    CAPITAL_NDFL_18: '18% НДФЛ',
    CAPITAL_NDFL_20: '20% НДФЛ',
    CAPITAL_NDFL_22: '22% НДФЛ',
    CAPITAL_REINVEST_YES: '✅ Да',
    CAPITAL_REINVEST_NO: '❌ Нет',
    BACK_TO_MENU: '⬅️ Главное меню',
  },

  /** Данные для callback-запросов */
  CALLBACK_DATA: {
    CALCULATE: 'calculate',
    INFO: 'info',
    CALCULATE_EXTRA_PAYOUT: 'calculate_extra_payout',
    CALCULATE_CAPITAL: 'calculate_capital',
    CALCULATE_WITHOUT_GOAL: 'calculate_without_goal',
    CAPITAL_CONTINUE: 'capital_continue',
    CAPITAL_GENDER_MALE: 'capital_gender_male',
    CAPITAL_GENDER_FEMALE: 'capital_gender_female',
    CAPITAL_INCOME_LOW: 'capital_income_low',
    CAPITAL_INCOME_MID: 'capital_income_mid',
    CAPITAL_INCOME_HIGH: 'capital_income_high',
    CAPITAL_NDFL_13: 'capital_ndfl_13',
    CAPITAL_NDFL_15: 'capital_ndfl_15',
    CAPITAL_NDFL_18: 'capital_ndfl_18',
    CAPITAL_NDFL_20: 'capital_ndfl_20',
    CAPITAL_NDFL_22: 'capital_ndfl_22',
    CAPITAL_REINVEST_YES: 'capital_reinvest_yes',
    CAPITAL_REINVEST_NO: 'capital_reinvest_no',
    BACK_TO_MENU: 'start',
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
 * Создает клавиатуру для выбора типа расчета
 * @returns {Object} Клавиатура с вариантами расчета
 */
export function createCalculateKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CALCULATE_EXTRA_PAYOUT,
            callback_data: MESSAGES.CALLBACK_DATA.CALCULATE_EXTRA_PAYOUT,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.CALCULATE_CAPITAL,
            callback_data: MESSAGES.CALLBACK_DATA.CALCULATE_CAPITAL,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.CALCULATE_WITHOUT_GOAL,
            callback_data: MESSAGES.CALLBACK_DATA.CALCULATE_WITHOUT_GOAL,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.BACK_TO_MENU,
            callback_data: MESSAGES.CALLBACK_DATA.BACK_TO_MENU,
          },
        ],
      ],
    },
  };
}

/**
 * Клавиатура "Продолжить" для сценария капитала
 */
export function createCapitalContinueKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_CONTINUE,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_CONTINUE,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.BACK_TO_MENU,
            callback_data: MESSAGES.CALLBACK_DATA.BACK_TO_MENU,
          },
        ],
      ],
    },
  };
}

export function createCapitalGenderKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_GENDER_MALE,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_GENDER_MALE,
          },
          {
            text: MESSAGES.BUTTONS.CAPITAL_GENDER_FEMALE,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_GENDER_FEMALE,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.BACK_TO_MENU,
            callback_data: MESSAGES.CALLBACK_DATA.BACK_TO_MENU,
          },
        ],
      ],
    },
  };
}

export function createCapitalIncomeKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_INCOME_LOW,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_INCOME_LOW,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_INCOME_MID,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_INCOME_MID,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_INCOME_HIGH,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_INCOME_HIGH,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.BACK_TO_MENU,
            callback_data: MESSAGES.CALLBACK_DATA.BACK_TO_MENU,
          },
        ],
      ],
    },
  };
}

export function createCapitalNdflKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_NDFL_13,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_NDFL_13,
          },
          {
            text: MESSAGES.BUTTONS.CAPITAL_NDFL_15,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_NDFL_15,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_NDFL_18,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_NDFL_18,
          },
          {
            text: MESSAGES.BUTTONS.CAPITAL_NDFL_20,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_NDFL_20,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_NDFL_22,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_NDFL_22,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.BACK_TO_MENU,
            callback_data: MESSAGES.CALLBACK_DATA.BACK_TO_MENU,
          },
        ],
      ],
    },
  };
}

export function createCapitalReinvestKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: MESSAGES.BUTTONS.CAPITAL_REINVEST_YES,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_REINVEST_YES,
          },
          {
            text: MESSAGES.BUTTONS.CAPITAL_REINVEST_NO,
            callback_data: MESSAGES.CALLBACK_DATA.CAPITAL_REINVEST_NO,
          },
        ],
        [
          {
            text: MESSAGES.BUTTONS.BACK_TO_MENU,
            callback_data: MESSAGES.CALLBACK_DATA.BACK_TO_MENU,
          },
        ],
      ],
    },
  };
}
