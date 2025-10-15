/**
 * Типы для FSM и сценариев ПДС-калькулятора
 */

// Константы
export const ANNUAL_RATE = 0.1; // 10% годовых
export const MONTHLY_RATE = Math.pow(1 + ANNUAL_RATE, 1 / 12) - 1; // Месячная ставка

// Идентификаторы состояний
export const STATE_IDS = {
  IDLE: 'idle',
  GENDER_SELECTION: 'gender_selection',
  AGE_INPUT: 'age_input',
  INCOME_INPUT: 'income_input',
  PAYOUT_START_SELECTION: 'payout_start_selection',
  PAYOUT_YEARS_INPUT: 'payout_years_input',
  CONTRIBUTION_MODE_SELECTION: 'contribution_mode_selection',
  MONTHLY_CONTRIBUTION_INPUT: 'monthly_contribution_input',
  ANNUAL_CONTRIBUTION_INPUT: 'annual_contribution_input',
  DESIRED_PAYOUT_INPUT: 'desired_payout_input',
  HORIZON_YEARS_INPUT: 'horizon_years_input',
  STARTING_CAPITAL_INPUT: 'starting_capital_input',
  OPS_TRANSFER_INPUT: 'ops_transfer_input',
  TAX_RATE_SELECTION: 'tax_rate_selection',
  REINVEST_TAX_SELECTION: 'reinvest_tax_selection',
  CONFIRMATION: 'confirmation',
  CALCULATION: 'calculation',
  RESULT: 'result',
};

// Идентификаторы сценариев
export const SCENARIO_IDS = {
  ADDITIONAL_PAYMENT: 'additional_payment', // 💰 Дополнительная выплата
  CAPITAL_AT_START: 'capital_at_start', // 🏦 Капитал к началу выплат
  FROM_CONTRIBUTION: 'from_contribution', // 💸 Без цели — расчёт от взноса
};

// Пол
export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
};

// Режим взносов
export const CONTRIBUTION_MODE = {
  MONTHLY: 'monthly',
  ANNUAL: 'annual',
};

// Ставка НДФЛ
export const TAX_RATE = {
  RATE_13: 13,
  RATE_15: 15,
  RATE_18: 18,
  RATE_20: 20,
  RATE_22: 22,
};

/**
 * Создаёт новую сессию пользователя
 * @param {number} chatId - ID чата
 * @param {string} scenario - Сценарий расчёта
 * @returns {Object} Новая сессия
 */
export function createSession(chatId, scenario = null) {
  const now = new Date();
  return {
    chatId,
    scenario,
    state: STATE_IDS.IDLE,
    data: {},
    createdAt: now,
    updatedAt: now,
    errorCount: 0,
  };
}

/**
 * Создаёт результат перехода состояния
 * @param {string} nextState - Следующее состояние
 * @param {string} message - Сообщение пользователю
 * @param {Object} keyboard - Клавиатура (опционально)
 * @param {string} error - Ошибка (опционально)
 * @returns {Object} Результат перехода
 */
export function createStateTransition(nextState, message, keyboard = null, error = null) {
  return {
    nextState,
    message,
    keyboard,
    error,
  };
}

/**
 * Создаёт результат валидации
 * @param {boolean} isValid - Валидность
 * @param {*} value - Значение (если валидно)
 * @param {string} error - Ошибка (если невалидно)
 * @returns {Object} Результат валидации
 */
export function createValidationResult(isValid, value = null, error = null) {
  return {
    isValid,
    value,
    error,
  };
}
