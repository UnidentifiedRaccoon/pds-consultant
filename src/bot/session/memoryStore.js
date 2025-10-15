/**
 * In-memory хранилище сессий для ПДС-калькулятора
 * Простое хранилище на основе Map для хранения сессий пользователей
 */

import { createSession } from '../state/types.js';

class MemorySessionStore {
  constructor() {
    this.sessions = new Map();
    this.maxSessionAge = 30 * 60 * 1000; // 30 минут
  }

  /**
   * Создаёт новую сессию
   * @param {number} chatId - ID чата
   * @param {string} scenario - Сценарий расчёта
   * @returns {Object} Новая сессия
   */
  createSession(chatId, scenario = null) {
    const session = createSession(chatId, scenario);
    this.sessions.set(chatId, session);
    return session;
  }

  /**
   * Получает сессию по ID чата
   * @param {number} chatId - ID чата
   * @returns {Object|undefined} Сессия или undefined
   */
  getSession(chatId) {
    const session = this.sessions.get(chatId);

    if (session && this.isSessionValid(session)) {
      return session;
    }

    if (session) {
      this.sessions.delete(chatId);
    }

    return undefined;
  }

  /**
   * Обновляет сессию
   * @param {Object} session - Сессия для обновления
   */
  updateSession(session) {
    session.updatedAt = new Date();
    this.sessions.set(session.chatId, session);
  }

  /**
   * Обновляет состояние сессии
   * @param {number} chatId - ID чата
   * @param {string} state - Новое состояние
   */
  updateSessionState(chatId, state) {
    const session = this.getSession(chatId);
    if (session) {
      session.state = state;
      this.updateSession(session);
    }
  }

  /**
   * Обновляет данные сессии
   * @param {number} chatId - ID чата
   * @param {Object} data - Новые данные
   */
  updateSessionData(chatId, data) {
    const session = this.getSession(chatId);
    if (session) {
      session.data = { ...session.data, ...data };
      this.updateSession(session);
    }
  }

  /**
   * Увеличивает счётчик ошибок
   * @param {number} chatId - ID чата
   */
  incrementErrorCount(chatId) {
    const session = this.getSession(chatId);
    if (session) {
      session.errorCount += 1;
      this.updateSession(session);
    }
  }

  /**
   * Сбрасывает счётчик ошибок
   * @param {number} chatId - ID чата
   */
  resetErrorCount(chatId) {
    const session = this.getSession(chatId);
    if (session) {
      session.errorCount = 0;
      this.updateSession(session);
    }
  }

  /**
   * Удаляет сессию
   * @param {number} chatId - ID чата
   */
  deleteSession(chatId) {
    this.sessions.delete(chatId);
  }

  /**
   * Проверяет, действительна ли сессия
   * @param {Object} session - Сессия для проверки
   * @returns {boolean} true, если сессия действительна
   */
  isSessionValid(session) {
    const now = new Date();
    const age = now.getTime() - session.createdAt.getTime();
    return age < this.maxSessionAge;
  }

  /**
   * Очищает устаревшие сессии
   */
  cleanupExpiredSessions() {
    const now = new Date();
    const expiredChatIds = [];

    for (const [chatId, session] of this.sessions.entries()) {
      const age = now.getTime() - session.createdAt.getTime();
      if (age >= this.maxSessionAge) {
        expiredChatIds.push(chatId);
      }
    }

    expiredChatIds.forEach((chatId) => this.sessions.delete(chatId));
  }

  /**
   * Получает статистику сессий
   * @returns {Object} Статистика
   */
  getStats() {
    return {
      totalSessions: this.sessions.size,
      activeSessions: Array.from(this.sessions.values()).filter((s) => this.isSessionValid(s))
        .length,
    };
  }
}

// Экспортируем единственный экземпляр
export const sessionStore = new MemorySessionStore();

// Запускаем периодическую очистку устаревших сессий
setInterval(
  () => {
    sessionStore.cleanupExpiredSessions();
  },
  5 * 60 * 1000
); // Каждые 5 минут
