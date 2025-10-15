/**
 * Интеграция ПДС-калькулятора с существующим ботом
 * Новый FSM-based калькулятор с тремя сценариями
 */

import {
  handleStartCommand,
  handleMenuCommand,
  handleTextMessage,
  handleCallbackQuery,
  handleUnknownCommand,
} from './handlers/menu.js';

/**
 * Обработчик команды /start для ПДС-калькулятора
 */
export function handlePDSStartCommand(bot, chatId) {
  return handleStartCommand(bot, chatId);
}

/**
 * Обработчик команды /menu для ПДС-калькулятора
 */
export function handlePDSMenuCommand(bot, chatId) {
  return handleMenuCommand(bot, chatId);
}

/**
 * Обработчик текстовых сообщений для ПДС-калькулятора
 */
export function handlePDSTextMessage(bot, chatId, message) {
  return handleTextMessage(bot, chatId, message);
}

/**
 * Обработчик callback-запросов для ПДС-калькулятора
 */
export function handlePDSCallbackQuery(bot, callbackQuery) {
  return handleCallbackQuery(bot, callbackQuery);
}

/**
 * Обработчик неизвестных команд для ПДС-калькулятора
 */
export function handlePDSUnknownCommand(bot, chatId, message) {
  return handleUnknownCommand(bot, chatId, message);
}
