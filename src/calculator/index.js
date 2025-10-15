/**
 * Главный модуль пошагового калькулятора ПДС
 * Экспортирует все необходимые функции для интеграции с ботом
 */

// Экспортируем все из модулей
export {
  // Состояние
  CALCULATOR_STEPS,
  CALCULATION_GOALS,
  createCalculatorSession,
  getCalculatorSession,
  updateCalculatorSession,
  deleteCalculatorSession,
  cleanupExpiredSessions,
  getCalculatorStats,
  startSessionCleanup,
} from './state.js';

export {
  // Валидаторы
  validateGender,
  validateAge,
  validateIncome,
  validatePayoutYears,
  validateStartingCapital,
  validateTaxRate,
  validateYesNo,
  getErrorMessage,
} from './validators.js';

export {
  // Обработчики
  startCalculator,
  handleGoalSelection,
  handleUserInput,
  handlePayoutStartSelection,
  handleYesNoSelection,
  handleStartAgain,
  handleCancel,
  completeCalculation,
  isInCalculator,
} from './handlers.js';

export {
  // Вопросы
  askNextQuestion,
  showGoalSelection,
  handleTooManyErrors,
  getNextStep,
} from './questions.js';
