/**
 * Главный файл калькулятора ПДС
 * Экспортирует все функции для работы с калькулятором
 */

// Экспорт функций состояния
export {
  CALCULATOR_STEPS,
  CALCULATION_GOALS,
  createCalculatorSession,
  getCalculatorSession,
  updateCalculatorSession,
  deleteCalculatorSession,
  cleanupExpiredSessions,
  startSessionCleanup,
} from './state.js';

// Экспорт функций валидации
export {
  validateGender,
  validateAge,
  validateIncome,
  validateTargetPayment,
  validatePayoutYears,
  validateExpectedReturn,
  validateStartingCapital,
  validateOpsTransfer,
  validateTaxRate,
  validateUsedOtherLimit,
  validateYesNo,
  validateMonthlyContribution,
  validateAnnualContribution,
  validateHorizonAge,
  getErrorMessage,
} from './validators.js';

// Экспорт функций вопросов
export {
  askNextQuestion,
  showGoalSelection,
  handleTooManyErrors,
  getNextStep,
} from './questions.js';

// Экспорт функций обработчиков
export {
  startCalculator,
  handleGoalSelection,
  handleUserInput,
  handlePayoutStartSelection,
  handleYesNoSelection,
  handleContributionTypeSelection,
  handleHorizonTypeSelection,
  handleStartAgain,
  handleCancel,
  completeCalculation,
  isInCalculator,
} from './handlers.js';

// Экспорт функций расчетов
export {
  solveMonthlyContribForTargetPayment,
  computeCapitalAtStart,
  computeFromContrib,
  buildReport,
  formatCurrency,
  getPayoutYearsByRule,
} from './calculations.js';
