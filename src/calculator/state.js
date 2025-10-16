/**
 * Управление состоянием пошагового калькулятора
 * Хранит состояние пользователей в процессе заполнения данных
 */

// Map: chatId -> { step, data, retries, createdAt }
const calculatorSessions = new Map();

// TTL сессий (30 минут)
const SESSION_TTL = 30 * 60 * 1000;

// Шаги опроса
export const CALCULATOR_STEPS = {
  GOAL_SELECTION: 'goal_selection',
  GENDER: 'gender',
  AGE: 'age',
  INCOME: 'income',
  TARGET_PAYMENT: 'target_payment',
  PAYOUT_START: 'payout_start',
  PAYOUT_YEARS: 'payout_years',
  EXPECTED_RETURN: 'expected_return',
  STARTING_CAPITAL: 'starting_capital',
  OPS_TRANSFER: 'ops_transfer',
  TAX_RATE: 'tax_rate',
  USED_OTHER_LIMIT: 'used_other_limit',
  REINVEST_TAX: 'reinvest_tax',
  // Новые шаги для сценариев 2 и 3
  CONTRIBUTION_TYPE: 'contribution_type',
  MONTHLY_CONTRIBUTION: 'monthly_contribution',
  ANNUAL_CONTRIBUTION: 'annual_contribution',
  HORIZON_TYPE: 'horizon_type',
  HORIZON_AGE: 'horizon_age',
  COMPLETED: 'completed',
};

// Цели расчета
export const CALCULATION_GOALS = {
  ADDITIONAL_PAYMENT: 'additional_payment',
  CAPITAL_TO_PAYOUT: 'capital_to_payout',
  NO_GOAL: 'no_goal',
};

/**
 * Создать новую сессию калькулятора
 * @param {number} chatId - ID чата
 * @param {string} goal - Цель расчета
 * @returns {Object} Сессия калькулятора
 */
export function createCalculatorSession(chatId, goal = null) {
  const session = {
    step: goal ? CALCULATOR_STEPS.GENDER : CALCULATOR_STEPS.GOAL_SELECTION,
    goal,
    data: {},
    retries: 0,
    createdAt: Date.now(),
  };

  calculatorSessions.set(chatId, session);
  return session;
}

/**
 * Получить сессию калькулятора
 * @param {number} chatId - ID чата
 * @returns {Object|null} Сессия калькулятора или null
 */
export function getCalculatorSession(chatId) {
  const session = calculatorSessions.get(chatId);

  if (!session) {
    return null;
  }

  // Проверяем TTL
  if (Date.now() - session.createdAt > SESSION_TTL) {
    calculatorSessions.delete(chatId);
    return null;
  }

  return session;
}

/**
 * Обновить сессию калькулятора
 * @param {number} chatId - ID чата
 * @param {Object} updates - Обновления сессии
 */
export function updateCalculatorSession(chatId, updates) {
  const session = getCalculatorSession(chatId);
  if (!session) {
    return null;
  }

  Object.assign(session, updates);
  calculatorSessions.set(chatId, session);
  return session;
}

/**
 * Удалить сессию калькулятора
 * @param {number} chatId - ID чата
 */
export function deleteCalculatorSession(chatId) {
  calculatorSessions.delete(chatId);
}

/**
 * Очистить устаревшие сессии
 */
export function cleanupExpiredSessions() {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [chatId, session] of calculatorSessions.entries()) {
    if (now - session.createdAt > SESSION_TTL) {
      calculatorSessions.delete(chatId);
      cleanedCount++;
    }
  }

  return cleanedCount;
}

/**
 * Запустить периодическую очистку устаревших сессий
 * @param {number} intervalMs - Интервал очистки в миллисекундах (по умолчанию 5 минут)
 */
export function startSessionCleanup(intervalMs = 5 * 60 * 1000) {
  setInterval(() => {
    const cleanedCount = cleanupExpiredSessions();
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired calculator sessions`);
    }
  }, intervalMs);
}
