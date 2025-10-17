import type { MyContext, MyConversation } from '../types.js';
import { MESSAGES, createCapitalResultKeyboard } from '../messages.js';
import { calculateCapitalLumpSum } from '../../../calculation-models/capital-lump-sum/index.js';
import { generateCapitalPdfReport } from '../pdfReport.js';
import { logger } from '../../logger.js';
import { InputFile } from 'grammy';

interface CapitalData {
  targetSum: number;
  gender: 'male' | 'female';
  age: number;
  income: 'low' | 'mid' | 'high';
  ndflRate: string;
  reinvest: boolean;
}

export async function capitalFlow(conversation: MyConversation, ctx: MyContext) {
  const data: Partial<CapitalData> = {};

  try {
    // Шаг 1: Целевая сумма
    await ctx.reply(MESSAGES.CAPITAL_FLOW.PROMPTS.TARGET_SUM);
    const targetCtx = await conversation.wait();

    const targetText = targetCtx.message?.text?.replace(/\s+/g, '') || '';
    const target = Number.parseInt(targetText, 10);

    if (!Number.isFinite(target) || target < 50000 || target > 100000000) {
      await ctx.reply(MESSAGES.CAPITAL_FLOW.ERRORS.INVALID_TARGET_SUM);
      return;
    }
    data.targetSum = target;

    // Шаг 2: Пол
    await ctx.reply(MESSAGES.CAPITAL_FLOW.PROMPTS.GENDER, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: MESSAGES.BUTTONS.CAPITAL_GENDER_MALE, callback_data: 'male' },
            { text: MESSAGES.BUTTONS.CAPITAL_GENDER_FEMALE, callback_data: 'female' },
          ],
        ],
      },
    });
    const genderCtx = await conversation.wait();
    await genderCtx.answerCallbackQuery();
    data.gender = genderCtx.callbackQuery?.data as 'male' | 'female';

    // Шаг 3: Возраст
    await ctx.reply(MESSAGES.CAPITAL_FLOW.PROMPTS.AGE);
    const ageCtx = await conversation.wait();

    const ageText = ageCtx.message?.text?.replace(/\s+/g, '') || '';
    const age = Number.parseInt(ageText, 10);

    if (!Number.isFinite(age) || age < 18 || age > 100) {
      await ctx.reply(MESSAGES.CAPITAL_FLOW.ERRORS.INVALID_AGE);
      return;
    }
    data.age = age;

    // Шаг 4: Доход
    await ctx.reply(MESSAGES.CAPITAL_FLOW.PROMPTS.INCOME, {
      reply_markup: {
        inline_keyboard: [
          [{ text: MESSAGES.BUTTONS.CAPITAL_INCOME_LOW, callback_data: 'low' }],
          [{ text: MESSAGES.BUTTONS.CAPITAL_INCOME_MID, callback_data: 'mid' }],
          [{ text: MESSAGES.BUTTONS.CAPITAL_INCOME_HIGH, callback_data: 'high' }],
        ],
      },
    });
    const incomeCtx = await conversation.wait();
    await incomeCtx.answerCallbackQuery();
    data.income = incomeCtx.callbackQuery?.data as 'low' | 'mid' | 'high';

    // Шаг 5: НДФЛ
    await ctx.reply(MESSAGES.CAPITAL_FLOW.PROMPTS.NDFL, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: MESSAGES.BUTTONS.CAPITAL_NDFL_13, callback_data: '13' },
            { text: MESSAGES.BUTTONS.CAPITAL_NDFL_15, callback_data: '15' },
          ],
          [
            { text: MESSAGES.BUTTONS.CAPITAL_NDFL_18, callback_data: '18' },
            { text: MESSAGES.BUTTONS.CAPITAL_NDFL_20, callback_data: '20' },
          ],
          [{ text: MESSAGES.BUTTONS.CAPITAL_NDFL_22, callback_data: '22' }],
        ],
      },
    });
    const ndflCtx = await conversation.wait();
    await ndflCtx.answerCallbackQuery();
    data.ndflRate = ndflCtx.callbackQuery?.data || '13';

    // Шаг 6: Реинвестировать
    await ctx.reply(MESSAGES.CAPITAL_FLOW.PROMPTS.REINVEST, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: MESSAGES.BUTTONS.CAPITAL_REINVEST_YES, callback_data: 'yes' },
            { text: MESSAGES.BUTTONS.CAPITAL_REINVEST_NO, callback_data: 'no' },
          ],
        ],
      },
    });
    const reinvestCtx = await conversation.wait();
    await reinvestCtx.answerCallbackQuery();
    data.reinvest = reinvestCtx.callbackQuery?.data === 'yes';

    // Расчет и отправка результата
    await sendCalculationResult(ctx, data as CapitalData);

    // Сохраняем данные в session для PDF
    ctx.session.lastCalculation = data as CapitalData;
  } catch (error) {
    logger.error({ err: error, chatId: ctx.chat?.id }, 'capitalFlow:error');
    await ctx.reply(MESSAGES.ERRORS.GENERIC);
  }
}

async function sendCalculationResult(ctx: MyContext, data: CapitalData) {
  const ndflRatePercent = Number.parseFloat(data.ndflRate);
  const ndflRateDecimal = ndflRatePercent / 100;

  const calculation = calculateCapitalLumpSum({
    targetSum: data.targetSum,
    incomeLevel: data.income,
    ndflRate: ndflRateDecimal,
    reinvest: data.reinvest,
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace('₽', '₽');

  const taxRatePercent = Math.round(ndflRatePercent);
  const taxNote =
    calculation.reinvestedTaxTotal > 0
      ? ''
      : '\nНалоговый вычет не реинвестируется и выплачивается на ваш счёт.';

  const capitalSummary = MESSAGES.CAPITAL_FLOW.RESPONSES.RESULT_BODY.replace(
    '{personalTotal}',
    formatCurrency(calculation.personalTotal)
  )
    .replace('{monthlyContribution}', formatCurrency(calculation.monthlyContribution))
    .replace('{stateTotal}', formatCurrency(calculation.stateTotal))
    .replace('{annualStateSupport}', formatCurrency(calculation.annualStateSupport))
    .replace('{opsTransfer}', formatCurrency(0))
    .replace('{investmentIncome}', formatCurrency(calculation.investmentIncome))
    .replace('{taxTotal}', formatCurrency(calculation.taxTotal))
    .replace('{taxRate}', String(taxRatePercent))
    .replace('{taxNote}', taxNote)
    .replace('{lifePayment}', formatCurrency(calculation.lifePayment))
    .replace('{tenYearPayment}', formatCurrency(calculation.tenYearPayment))
    .replace('{lumpSum}', formatCurrency(data.targetSum));

  const message = `${MESSAGES.CAPITAL_FLOW.RESPONSES.RESULT_HEADER}\n\n${capitalSummary}\n\n${MESSAGES.CAPITAL_FLOW.RESPONSES.RESTART_HINT}`;

  await ctx.reply(message, {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    ...createCapitalResultKeyboard(),
  });
}

export async function sendPdfReport(ctx: MyContext) {
  try {
    const data = ctx.session.lastCalculation;
    if (!data) {
      await ctx.reply(MESSAGES.ERRORS.GENERIC);
      return;
    }

    const ndflRateDecimal = Number.parseFloat(data.ndflRate) / 100;
    const calculation = calculateCapitalLumpSum({
      targetSum: data.targetSum,
      incomeLevel: data.income,
      ndflRate: ndflRateDecimal,
      reinvest: data.reinvest,
    });

    const pdfBuffer = await generateCapitalPdfReport(calculation, {
      targetSum: data.targetSum,
      data,
    });

    await ctx.replyWithDocument(new InputFile(pdfBuffer, 'pds-capital-report.pdf'));
  } catch (error) {
    logger.error({ err: error, chatId: ctx.chat?.id }, 'capital_pdf:error');
    await ctx.reply(MESSAGES.ERRORS.GENERIC);
  }
}
