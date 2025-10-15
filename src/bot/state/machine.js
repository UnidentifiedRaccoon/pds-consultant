/**
 * FSM-диспетчер для ПДС-калькулятора
 * Управляет переходами состояний и валидацией ввода
 */

import {
  STATE_IDS,
  GENDER,
  TAX_RATE,
  CONTRIBUTION_MODE,
  createStateTransition,
  createValidationResult,
} from './types.js';
import {
  createGenderKeyboard,
  createContributionModeKeyboard,
  createBackToMainKeyboard,
  createConfirmDataInlineKeyboard,
} from '../keyboards.js';

/**
 * Валидаторы для различных типов ввода
 */
export const validators = {
  /**
   * Валидация пола
   */
  gender: (input) => {
    const normalized = input.toLowerCase().trim();
    if (normalized.includes('муж') || normalized.includes('м')) {
      return createValidationResult(true, GENDER.MALE);
    }
    if (normalized.includes('жен') || normalized.includes('ж')) {
      return createValidationResult(true, GENDER.FEMALE);
    }
    return createValidationResult(false, null, 'Выберите пол: мужчина или женщина');
  },

  /**
   * Валидация возраста
   */
  age: (input) => {
    const age = parseInt(input.trim());
    if (isNaN(age) || age < 18 || age > 100) {
      return createValidationResult(false, null, 'Введите возраст от 18 до 100 лет');
    }
    return createValidationResult(true, age);
  },

  /**
   * Валидация денежной суммы
   */
  money: (input, min = 0, max = 100000000) => {
    // Убираем пробелы и разделители
    const cleaned = input.replace(/[\s,]/g, '');
    const amount = parseInt(cleaned);

    if (isNaN(amount) || amount < min || amount > max) {
      return createValidationResult(
        false,
        null,
        `Введите сумму от ${min.toLocaleString('ru-RU')} до ${max.toLocaleString('ru-RU')} руб.`
      );
    }
    return createValidationResult(true, amount);
  },

  /**
   * Валидация дохода
   */
  income: (input) => {
    return validators.money(input, 0, 10000000);
  },

  /**
   * Валидация ежемесячного взноса
   */
  monthlyContribution: (input) => {
    return validators.money(input, 0, 2000000);
  },

  /**
   * Валидация ежегодного взноса
   */
  annualContribution: (input) => {
    return validators.money(input, 0, 24000000);
  },

  /**
   * Валидация желаемой выплаты
   */
  desiredPayout: (input) => {
    return validators.money(input, 1000, 1000000);
  },

  /**
   * Валидация горизонта лет
   */
  horizonYears: (input) => {
    const years = parseInt(input.trim());
    if (isNaN(years) || years < 2 || years > 40) {
      return createValidationResult(false, null, 'Введите количество лет от 2 до 40');
    }
    return createValidationResult(true, years);
  },

  /**
   * Валидация стартового капитала
   */
  startingCapital: (input) => {
    return validators.money(input, 0, 100000000);
  },

  /**
   * Валидация перевода ОПС
   */
  opsTransfer: (input) => {
    return validators.money(input, 0, 100000000);
  },

  /**
   * Валидация режима взносов
   */
  contributionMode: (input) => {
    const normalized = input.toLowerCase().trim();
    if (normalized.includes('месяч') || normalized.includes('ежемесяч')) {
      return createValidationResult(true, CONTRIBUTION_MODE.MONTHLY);
    }
    if (normalized.includes('годов') || normalized.includes('ежегодн')) {
      return createValidationResult(true, CONTRIBUTION_MODE.ANNUAL);
    }
    return createValidationResult(false, null, 'Выберите режим: ежемесячно или ежегодно');
  },

  /**
   * Валидация ставки НДФЛ
   */
  taxRate: (input) => {
    const rate = parseInt(input.replace('%', '').trim());
    const validRates = [
      TAX_RATE.RATE_13,
      TAX_RATE.RATE_15,
      TAX_RATE.RATE_18,
      TAX_RATE.RATE_20,
      TAX_RATE.RATE_22,
    ];

    if (isNaN(rate) || !validRates.includes(rate)) {
      return createValidationResult(
        false,
        null,
        'Выберите ставку НДФЛ: 13%, 15%, 18%, 20% или 22%'
      );
    }
    return createValidationResult(true, rate);
  },

  /**
   * Валидация да/нет
   */
  yesNo: (input) => {
    const normalized = input.toLowerCase().trim();
    if (normalized.includes('да') || normalized.includes('yes') || normalized.includes('✅')) {
      return createValidationResult(true, true);
    }
    if (normalized.includes('нет') || normalized.includes('no') || normalized.includes('❌')) {
      return createValidationResult(true, false);
    }
    return createValidationResult(false, null, 'Выберите: да или нет');
  },
};

/**
 * Получает следующее состояние на основе текущего состояния и ввода
 * @param {Object} session - Текущая сессия
 * @param {string} message - Сообщение пользователя
 * @returns {Object} Результат перехода состояния
 */
export function getNextState(session, message) {
  const { state, data, errorCount } = session;

  // Проверяем лимит ошибок
  if (errorCount >= 3) {
    return createStateTransition(
      STATE_IDS.IDLE,
      '❌ Слишком много ошибок. Начинаем заново.',
      createBackToMainKeyboard()
    );
  }

  // Обработка специальных команд
  if (message.toLowerCase().includes('главное меню') || message.toLowerCase().includes('отмена')) {
    return createStateTransition(
      STATE_IDS.IDLE,
      '🏠 Возвращаемся в главное меню',
      createBackToMainKeyboard()
    );
  }

  // Обработка состояний по сценариям
  switch (state) {
    case STATE_IDS.IDLE:
      return handleIdleState(message);

    case STATE_IDS.GENDER_SELECTION:
      return handleGenderSelection(message, data);

    case STATE_IDS.AGE_INPUT:
      return handleAgeInput(message, data);

    case STATE_IDS.INCOME_INPUT:
      return handleIncomeInput(message, data);

    case STATE_IDS.PAYOUT_START_SELECTION:
      return handlePayoutStartSelection(message, data);

    case STATE_IDS.PAYOUT_YEARS_INPUT:
      return handlePayoutYearsInput(message, data);

    case STATE_IDS.CONTRIBUTION_MODE_SELECTION:
      return handleContributionModeSelection(message, data);

    case STATE_IDS.MONTHLY_CONTRIBUTION_INPUT:
      return handleMonthlyContributionInput(message, data);

    case STATE_IDS.ANNUAL_CONTRIBUTION_INPUT:
      return handleAnnualContributionInput(message, data);

    case STATE_IDS.DESIRED_PAYOUT_INPUT:
      return handleDesiredPayoutInput(message, data);

    case STATE_IDS.HORIZON_YEARS_INPUT:
      return handleHorizonYearsInput(message, data);

    case STATE_IDS.STARTING_CAPITAL_INPUT:
      return handleStartingCapitalInput(message, data);

    case STATE_IDS.OPS_TRANSFER_INPUT:
      return handleOpsTransferInput(message, data);

    case STATE_IDS.TAX_RATE_SELECTION:
      return handleTaxRateSelection(message, data);

    case STATE_IDS.REINVEST_TAX_SELECTION:
      return handleReinvestTaxSelection(message, data);

    case STATE_IDS.CONFIRMATION:
      return handleConfirmation(message, data);

    default:
      return createStateTransition(
        STATE_IDS.IDLE,
        '❌ Неизвестное состояние. Начинаем заново.',
        createBackToMainKeyboard()
      );
  }
}

/**
 * Обработка состояния выбора сценария
 */
function handleIdleState(message) {
  if (message.includes('💰 Дополнительная выплата')) {
    return createStateTransition(
      STATE_IDS.GENDER_SELECTION,
      '👤 Выберите пол для обращения:',
      createGenderKeyboard()
    );
  }

  if (message.includes('🏦 Капитал к началу выплат')) {
    return createStateTransition(
      STATE_IDS.GENDER_SELECTION,
      '👤 Выберите пол для обращения:',
      createGenderKeyboard()
    );
  }

  if (message.includes('💸 Без цели — расчёт от взноса')) {
    return createStateTransition(
      STATE_IDS.GENDER_SELECTION,
      '👤 Выберите пол для обращения:',
      createGenderKeyboard()
    );
  }

  return createStateTransition(
    STATE_IDS.IDLE,
    '❓ Выберите один из предложенных сценариев расчёта.',
    createBackToMainKeyboard()
  );
}

/**
 * Обработка выбора пола
 */
function handleGenderSelection(message, data) {
  const validation = validators.gender(message);

  if (!validation.isValid) {
    return createStateTransition(
      STATE_IDS.GENDER_SELECTION,
      `⚠️ ${validation.error}\n\n👤 Выберите пол:`,
      createGenderKeyboard()
    );
  }

  data.gender = validation.value;
  return createStateTransition(
    STATE_IDS.AGE_INPUT,
    '🎂 Введите ваш возраст (полных лет):',
    createBackToMainKeyboard()
  );
}

/**
 * Обработка ввода возраста
 */
function handleAgeInput(message, data) {
  const validation = validators.age(message);

  if (!validation.isValid) {
    return createStateTransition(
      STATE_IDS.AGE_INPUT,
      `⚠️ ${validation.error}\n\n🎂 Введите возраст:`,
      createBackToMainKeyboard()
    );
  }

  data.age = validation.value;
  return createStateTransition(
    STATE_IDS.INCOME_INPUT,
    '💵 Введите среднемесячный доход до НДФЛ (руб/мес):',
    createBackToMainKeyboard()
  );
}

/**
 * Обработка ввода дохода
 */
function handleIncomeInput(message, data) {
  const validation = validators.income(message);

  if (!validation.isValid) {
    return createStateTransition(
      STATE_IDS.INCOME_INPUT,
      `⚠️ ${validation.error}\n\n💵 Введите доход:`,
      createBackToMainKeyboard()
    );
  }

  data.income = validation.value;

  // Определяем следующий шаг в зависимости от сценария
  // Пока что для всех сценариев переходим к выбору режима взносов
  return createStateTransition(
    STATE_IDS.CONTRIBUTION_MODE_SELECTION,
    '📅 Выберите режим взносов:',
    createContributionModeKeyboard()
  );
}

/**
 * Обработка выбора режима взносов
 */
function handleContributionModeSelection(message, data) {
  const validation = validators.contributionMode(message);

  if (!validation.isValid) {
    return createStateTransition(
      STATE_IDS.CONTRIBUTION_MODE_SELECTION,
      `⚠️ ${validation.error}\n\n📅 Выберите режим:`,
      createContributionModeKeyboard()
    );
  }

  data.contributionMode = validation.value;

  if (validation.value === CONTRIBUTION_MODE.MONTHLY) {
    return createStateTransition(
      STATE_IDS.MONTHLY_CONTRIBUTION_INPUT,
      '💰 Введите размер ежемесячного взноса (руб):',
      createBackToMainKeyboard()
    );
  } else {
    return createStateTransition(
      STATE_IDS.ANNUAL_CONTRIBUTION_INPUT,
      '💰 Введите размер ежегодного взноса (руб):',
      createBackToMainKeyboard()
    );
  }
}

/**
 * Обработка ввода ежемесячного взноса
 */
function handleMonthlyContributionInput(message, data) {
  const validation = validators.monthlyContribution(message);

  if (!validation.isValid) {
    return createStateTransition(
      STATE_IDS.MONTHLY_CONTRIBUTION_INPUT,
      `⚠️ ${validation.error}\n\n💰 Введите размер взноса:`,
      createBackToMainKeyboard()
    );
  }

  data.monthlyContribution = validation.value;
  return createStateTransition(
    STATE_IDS.CONFIRMATION,
    '✅ Данные собраны. Подтвердите для расчёта:',
    createConfirmDataInlineKeyboard()
  );
}

/**
 * Обработка ввода ежегодного взноса
 */
function handleAnnualContributionInput(message, data) {
  const validation = validators.annualContribution(message);

  if (!validation.isValid) {
    return createStateTransition(
      STATE_IDS.ANNUAL_CONTRIBUTION_INPUT,
      `⚠️ ${validation.error}\n\n💰 Введите размер взноса:`,
      createBackToMainKeyboard()
    );
  }

  data.annualContribution = validation.value;
  return createStateTransition(
    STATE_IDS.CONFIRMATION,
    '✅ Данные собраны. Подтвердите для расчёта:',
    createConfirmDataInlineKeyboard()
  );
}

// Заглушки для остальных обработчиков (будут реализованы в сценариях)
function handlePayoutStartSelection(_message, _data) {
  return createStateTransition(STATE_IDS.IDLE, 'В разработке');
}

function handlePayoutYearsInput(_message, _data) {
  return createStateTransition(STATE_IDS.IDLE, 'В разработке');
}

function handleDesiredPayoutInput(_message, _data) {
  return createStateTransition(STATE_IDS.IDLE, 'В разработке');
}

function handleHorizonYearsInput(_message, _data) {
  return createStateTransition(STATE_IDS.IDLE, 'В разработке');
}

function handleStartingCapitalInput(_message, _data) {
  return createStateTransition(STATE_IDS.IDLE, 'В разработке');
}

function handleOpsTransferInput(_message, _data) {
  return createStateTransition(STATE_IDS.IDLE, 'В разработке');
}

function handleTaxRateSelection(_message, _data) {
  return createStateTransition(STATE_IDS.IDLE, 'В разработке');
}

function handleReinvestTaxSelection(_message, _data) {
  return createStateTransition(STATE_IDS.IDLE, 'В разработке');
}

function handleConfirmation(_message, _data) {
  return createStateTransition(STATE_IDS.IDLE, 'В разработке');
}
