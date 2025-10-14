/**
 * Валидаторы для пошагового калькулятора
 */

/**
 * Нормализует и валидирует пол
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: string|null, error: string|null }
 */
export function validateGender(input) {
  const normalized = input.toLowerCase().trim();

  // Проверяем различные варианты ввода
  if (['м', 'муж', 'мужской', 'm', 'male'].includes(normalized)) {
    return { isValid: true, value: 'm', error: null };
  }

  if (['ж', 'жен', 'женский', 'f', 'female'].includes(normalized)) {
    return { isValid: true, value: 'f', error: null };
  }

  return { isValid: false, value: null, error: 'gender' };
}

/**
 * Валидирует возраст
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: number|null, error: string|null }
 */
export function validateAge(input) {
  const age = parseInt(input.trim(), 10);

  if (isNaN(age) || !Number.isInteger(age)) {
    return { isValid: false, value: null, error: 'age' };
  }

  if (age < 18 || age > 70) {
    return { isValid: false, value: null, error: 'age' };
  }

  return { isValid: true, value: age, error: null };
}

/**
 * Парсит и валидирует сумму дохода
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: number|null, error: string|null }
 */
export function validateIncome(input) {
  // Убираем пробелы, валютные символы, запятые и точки
  const cleaned = input.replace(/[\s₽,.]/g, '');
  const amount = parseInt(cleaned, 10);

  if (isNaN(amount) || !Number.isInteger(amount)) {
    return { isValid: false, value: null, error: 'income' };
  }

  if (amount < 10000 || amount > 1000000) {
    return { isValid: false, value: null, error: 'income' };
  }

  return { isValid: true, value: amount, error: null };
}

/**
 * Валидирует количество лет для начала выплат
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: number|null, error: string|null }
 */
export function validatePayoutYears(input) {
  const years = parseInt(input.trim(), 10);

  if (isNaN(years) || !Number.isInteger(years)) {
    return { isValid: false, value: null, error: 'payout_years' };
  }

  if (years < 1 || years > 30) {
    return { isValid: false, value: null, error: 'payout_years' };
  }

  return { isValid: true, value: years, error: null };
}

/**
 * Парсит и валидирует стартовый капитал
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: number|null, error: string|null }
 */
export function validateStartingCapital(input) {
  // Убираем пробелы, валютные символы, запятые и точки
  const cleaned = input.replace(/[\s₽,.]/g, '');
  const amount = parseInt(cleaned, 10);

  if (isNaN(amount) || !Number.isInteger(amount)) {
    return { isValid: false, value: null, error: 'starting_capital' };
  }

  if (amount < 0) {
    return { isValid: false, value: null, error: 'starting_capital' };
  }

  return { isValid: true, value: amount, error: null };
}

/**
 * Валидирует ставку НДФЛ
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: number|null, error: string|null }
 */
export function validateTaxRate(input) {
  const rate = parseInt(input.trim(), 10);

  if (isNaN(rate) || !Number.isInteger(rate)) {
    return { isValid: false, value: null, error: 'tax_rate' };
  }

  if (rate !== 13 && rate !== 15) {
    return { isValid: false, value: null, error: 'tax_rate' };
  }

  return { isValid: true, value: rate, error: null };
}

/**
 * Нормализует и валидирует ответ Да/Нет
 * @param {string} input - Ввод пользователя
 * @returns {Object} { isValid: boolean, value: boolean|null, error: string|null }
 */
export function validateYesNo(input) {
  const normalized = input.toLowerCase().trim();

  if (['да', 'yes', 'y', '1', 'true'].includes(normalized)) {
    return { isValid: true, value: true, error: null };
  }

  if (['нет', 'no', 'n', '0', 'false'].includes(normalized)) {
    return { isValid: true, value: false, error: null };
  }

  return { isValid: false, value: null, error: 'reinvest_tax' };
}

/**
 * Получает сообщение об ошибке по типу
 * @param {string} errorType - Тип ошибки
 * @returns {string} Сообщение об ошибке
 */
export function getErrorMessage(errorType) {
  const errorMessages = {
    gender: '⚠️ Введи м/ж (или: мужской/женский)',
    age: '⚠️ Введи целое число от 18 до 70',
    income: '⚠️ Нужна сумма от 10 000 до 1 000 000 руб/мес',
    payout_years: '⚠️ Введи целое число от 1 до 30',
    starting_capital: '⚠️ Введи неотрицательное число (0, если нет капитала)',
    tax_rate: '⚠️ Допустимые значения: 13 или 15',
    reinvest_tax: '⚠️ Выбери Да или Нет',
  };

  return errorMessages[errorType] || '⚠️ Неверный формат данных';
}
