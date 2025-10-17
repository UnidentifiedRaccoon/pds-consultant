import {
  MESSAGES,
  createMainKeyboard,
  createCalculateKeyboard,
  createCapitalContinueKeyboard,
  createCapitalGenderKeyboard,
  createCapitalIncomeKeyboard,
  createCapitalNdflKeyboard,
  createCapitalReinvestKeyboard,
  createCapitalResultKeyboard,
} from './messages.js';
import {
  resetConversation,
  updateConversation,
  getConversation,
  clearConversation,
} from './conversationState.js';
import { calculateCapitalLumpSum } from '../../calculation-models/capital-lump-sum/index.js';
import { generateCapitalPdfReport } from './pdfReport.js';
import { logger } from '../logger.js';

/**
 * Обработка команд пользователя
 */
async function handleCommand(chatId, command, bot) {
  if (!chatId || !command || !bot) {
    logger.error({ chatId, command }, 'handleCommand:invalid:params');
    return;
  }

  try {
    switch (command) {
      case 'start': {
        const keyboard = createMainKeyboard();
        await bot.sendMessage(chatId, MESSAGES.WELCOME, keyboard);
        clearConversation(chatId);
        break;
      }
      case 'calculate': {
        await bot.sendMessage(chatId, MESSAGES.CALCULATE_PROMPT, createCalculateKeyboard());
        break;
      }
      case 'calculate_extra_payout': {
        await bot.sendMessage(chatId, MESSAGES.CALCULATE_RESPONSES.EXTRA_PAYOUT);
        break;
      }
      case 'calculate_capital': {
        await bot.sendMessage(chatId, MESSAGES.CAPITAL_FLOW.INTRO, createCapitalContinueKeyboard());
        resetConversation(chatId, {
          scenario: 'capital',
          step: 'intro',
          data: {},
        });
        break;
      }
      case 'capital_continue': {
        updateConversation(chatId, { step: 'target_sum' });
        await bot.sendMessage(chatId, MESSAGES.CAPITAL_FLOW.PROMPTS.TARGET_SUM);
        break;
      }
      case 'capital_gender_male':
      case 'capital_gender_female': {
        updateConversation(chatId, {
          step: 'age',
          data: {
            gender: command === 'capital_gender_male' ? 'male' : 'female',
          },
        });
        await bot.sendMessage(chatId, MESSAGES.CAPITAL_FLOW.PROMPTS.AGE);
        break;
      }
      case 'capital_income_low':
      case 'capital_income_mid':
      case 'capital_income_high': {
        updateConversation(chatId, {
          step: 'ndfl',
          data: {
            income:
              command === 'capital_income_low'
                ? 'low'
                : command === 'capital_income_mid'
                  ? 'mid'
                  : 'high',
          },
        });
        await bot.sendMessage(
          chatId,
          MESSAGES.CAPITAL_FLOW.PROMPTS.NDFL,
          createCapitalNdflKeyboard()
        );
        break;
      }
      case 'capital_ndfl_13':
      case 'capital_ndfl_15':
      case 'capital_ndfl_18':
      case 'capital_ndfl_20':
      case 'capital_ndfl_22': {
        updateConversation(chatId, {
          step: 'reinvest',
          data: { ndflRate: command.replace('capital_ndfl_', '') },
        });
        await bot.sendMessage(
          chatId,
          MESSAGES.CAPITAL_FLOW.PROMPTS.REINVEST,
          createCapitalReinvestKeyboard()
        );
        break;
      }
      case 'capital_reinvest_yes':
      case 'capital_reinvest_no': {
        const updatedState = updateConversation(chatId, {
          step: 'complete',
          finished: true,
          data: {
            ...getConversation(chatId)?.data,
            reinvest: command === 'capital_reinvest_yes',
          },
        });

        await sendCapitalCalculationResult(chatId, bot, updatedState?.data);
        break;
      }
      case 'capital_pdf': {
        const conversation = getConversation(chatId);
        if (!conversation?.data) {
          await bot.sendMessage(chatId, MESSAGES.ERRORS.GENERIC, createMainKeyboard());
          return;
        }

        await sendCapitalPdfReport(chatId, bot, conversation.data);
        break;
      }
      case 'calculate_without_goal': {
        await bot.sendMessage(chatId, MESSAGES.CALCULATE_RESPONSES.WITHOUT_GOAL);
        break;
      }
      case 'info': {
        await bot.sendMessage(chatId, MESSAGES.INFO_ABOUT_PDS, {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          ...createMainKeyboard(),
        });
        break;
      }
      default:
        logger.warn({ chatId, command }, 'handleCommand:unknown:command');
    }
  } catch (error) {
    logger.error({ chatId, command, err: error }, 'handleCommand:error');
    // Пытаемся отправить сообщение об ошибке пользователю
    try {
      await bot.sendMessage(chatId, MESSAGES.ERRORS.GENERIC, createMainKeyboard());
    } catch (sendError) {
      logger.error({ chatId, err: sendError }, 'handleCommand:send:error');
    }
  }
}

async function handleCapitalFlowText(chatId, text, bot, conversation) {
  const numericText = text.replace(/\s+/g, '');

  switch (conversation.step) {
    case 'target_sum': {
      const target = Number.parseInt(numericText, 10);

      if (!Number.isFinite(target) || target < 50000 || target > 100000000) {
        await bot.sendMessage(chatId, MESSAGES.CAPITAL_FLOW.ERRORS.INVALID_TARGET_SUM);
        return;
      }

      updateConversation(chatId, {
        step: 'gender',
        data: { ...conversation.data, targetSum: target },
      });

      await bot.sendMessage(
        chatId,
        MESSAGES.CAPITAL_FLOW.PROMPTS.GENDER,
        createCapitalGenderKeyboard()
      );
      return;
    }

    case 'age': {
      const age = Number.parseInt(numericText, 10);

      if (!Number.isFinite(age) || age < 18 || age > 100) {
        await bot.sendMessage(chatId, MESSAGES.CAPITAL_FLOW.ERRORS.INVALID_AGE);
        return;
      }

      updateConversation(chatId, {
        step: 'income',
        data: { ...conversation.data, age },
      });

      await bot.sendMessage(
        chatId,
        MESSAGES.CAPITAL_FLOW.PROMPTS.INCOME,
        createCapitalIncomeKeyboard()
      );
      return;
    }

    default: {
      logger.warn({ chatId, step: conversation.step }, 'capital_flow:unexpected:text');
    }
  }
}

async function sendCapitalCalculationResult(chatId, bot, data) {
  try {
    const ndflRateDecimal = (Number.parseFloat(data?.ndflRate ?? '0') || 0) / 100;
    const incomeLevel = data?.income ?? 'high';
    const targetSum = Number(data?.targetSum) || 0;

    const calculation = calculateCapitalLumpSum({
      targetSum,
      incomeLevel,
      ndflRate: ndflRateDecimal,
      reinvest: Boolean(data?.reinvest),
    });

    const formatCurrency = (value) =>
      new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
      })
        .format(value)
        .replace('₽', '₽');

    const formatMonthly = (value) => `${formatCurrency(value)}`;
    const taxRatePercent = Math.round(ndflRateDecimal * 100);
    if (targetSum > 0) {
      const deviation = Math.abs(calculation.lumpSum - targetSum) / targetSum;
      if (deviation > 0.05) {
        logger.error(
          {
            chatId,
            targetSum,
            calculated: calculation.lumpSum,
            deviation,
          },
          'capital_calculation:deviation_exceeds_threshold'
        );
      }
    }
    const taxNote = calculation.reinvest
      ? ''
      : '<br/>Налоговый вычет не реинвестируется и выплачивается на ваш счёт.';

    const capitalSummary = MESSAGES.CAPITAL_FLOW.RESPONSES.RESULT_BODY.replace(
      '{personalTotal}',
      formatCurrency(calculation.personalTotal)
    )
      .replace('{monthlyContribution}', formatMonthly(calculation.monthlyContribution))
      .replace('{stateTotal}', formatCurrency(calculation.stateTotal))
      .replace('{annualStateSupport}', formatCurrency(calculation.annualStateSupport))
      .replace('{opsTransfer}', formatCurrency(0))
      .replace('{investmentIncome}', formatCurrency(calculation.investmentIncome))
      .replace('{taxTotal}', formatCurrency(calculation.taxTotal))
      .replace('{taxRate}', String(taxRatePercent))
      .replace('{taxNote}', taxNote)
      .replace('{lifePayment}', formatMonthly(calculation.lifePayment))
      .replace('{tenYearPayment}', formatMonthly(calculation.tenYearPayment))
      .replace('{lumpSum}', formatCurrency(targetSum || calculation.lumpSum));

    const message = `${MESSAGES.CAPITAL_FLOW.RESPONSES.RESULT_HEADER}<br/><br/>${capitalSummary}<br/><br/>${MESSAGES.CAPITAL_FLOW.RESPONSES.RESTART_HINT}`;

    await bot.sendMessage(chatId, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: false,
      ...createCapitalResultKeyboard(),
    });
  } catch (error) {
    logger.error({ chatId, data, err: error }, 'capital_calculation:error');
    await bot.sendMessage(chatId, MESSAGES.ERRORS.GENERIC, createMainKeyboard());
  }
}

async function sendCapitalPdfReport(chatId, bot, data) {
  try {
    const ndflRateDecimal = (Number.parseFloat(data?.ndflRate ?? '0') || 0) / 100;
    const calculation = calculateCapitalLumpSum({
      targetSum: data?.targetSum,
      incomeLevel: data?.income ?? 'high',
      ndflRate: ndflRateDecimal,
      reinvest: Boolean(data?.reinvest),
    });

    const pdfBuffer = await generateCapitalPdfReport(calculation, {
      targetSum: data?.targetSum,
      data,
    });

    await bot.sendDocument(
      chatId,
      pdfBuffer,
      {},
      {
        filename: 'pds-capital-report.pdf',
        contentType: 'application/pdf',
      }
    );
  } catch (error) {
    logger.error({ chatId, data, err: error }, 'capital_pdf:error');
    await bot.sendMessage(chatId, MESSAGES.ERRORS.GENERIC, createCapitalResultKeyboard());
  }
}

export function attachBotHandlers(bot) {
  if (!bot) {
    throw new Error('Bot instance is required');
  }

  // Обработчик команды /start
  bot.onText(/\/start/, async (msg) => {
    try {
      const chatId = msg?.chat?.id;
      if (!chatId) {
        logger.error({ msg }, 'start:missing:chatId');
        return;
      }
      await handleCommand(chatId, 'start', bot);
    } catch (error) {
      logger.error({ err: error, msg }, 'start:error');
    }
  });

  // Обработчик нажатий на inline кнопки
  bot.on('callback_query', async (callbackQuery) => {
    try {
      const chatId = callbackQuery?.message?.chat?.id;
      const data = callbackQuery?.data;

      if (!chatId || !data) {
        logger.error({ callbackQuery }, 'callback:missing:data');
        return;
      }

      // Убираем "часики" на кнопке (без всплывающего текста)
      await bot.answerCallbackQuery(callbackQuery.id);

      // Выполняем команду
      await handleCommand(chatId, data, bot);
    } catch (e) {
      logger.error({ err: e, callbackQuery }, 'callback:error');
      // Пытаемся убрать "часики" даже при ошибке
      try {
        await bot.answerCallbackQuery(callbackQuery.id);
      } catch (answerError) {
        logger.error({ err: answerError }, 'callback:answer:error');
      }
    }
  });

  bot.on('message', async (msg) => {
    try {
      const chatId = msg?.chat?.id;
      const text = (msg?.text ?? '').trim();

      if (!chatId) {
        logger.error({ msg }, 'message:missing:chatId');
        return;
      }

      if (!text || text.startsWith('/')) {
        return;
      }

      const conversation = getConversation(chatId);
      if (conversation?.scenario === 'capital') {
        await handleCapitalFlowText(chatId, text, bot, conversation);
      }
    } catch (error) {
      logger.error({ err: error, msg }, 'message:error');
    }
  });

  bot.on('polling_error', (err) => logger.error({ err }, 'polling:error'));
}
