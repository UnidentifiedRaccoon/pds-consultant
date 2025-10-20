import { performance } from 'node:perf_hooks';
import { chromium, type Browser } from 'playwright';
import { MESSAGES } from './messages.js';
import { CapitalLumpSumResult } from '../../calculation-models/capital-lump-sum/index.js';
import { logger } from '../logger.js';

interface ConversationData {
  targetSum?: number;
  gender?: 'male' | 'female';
  age?: number;
  income?: 'low' | 'mid' | 'high';
  ndflRate?: string;
  reinvest?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace('₽', '₽');
}

export interface PdfReportOptions {
  targetSum?: number;
  data?: ConversationData;
}

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    logger.info({ scope: 'pdf', step: 'browser:launch:start' }, 'pdf:browser:launch');
    const launchedAt = performance.now();
    browserPromise = chromium.launch({
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    browserPromise
      .then(() => {
        logger.info(
          {
            scope: 'pdf',
            step: 'browser:launch:success',
            durationMs: Math.round(performance.now() - launchedAt),
          },
          'pdf:browser:launch:success'
        );
        return undefined;
      })
      .catch((error) => {
        logger.error(
          { scope: 'pdf', step: 'browser:launch:failed', err: error },
          'pdf:browser:launch:failed'
        );
        browserPromise = null;
        throw error;
      });
  } else {
    logger.info({ scope: 'pdf', step: 'browser:reuse' }, 'pdf:browser:reuse');
  }

  return browserPromise;
}

export async function generateCapitalPdfReport(
  calculation: CapitalLumpSumResult,
  options?: PdfReportOptions
): Promise<Buffer> {
  const startAt = performance.now();
  let lastMark = startAt;
  const logProgress = (step: string, extra?: Record<string, unknown>) => {
    const now = performance.now();
    const chunkMs = now - lastMark;
    const totalMs = now - startAt;
    lastMark = now;
    logger.info(
      {
        scope: 'pdf',
        step,
        chunkMs: Math.round(chunkMs),
        totalMs: Math.round(totalMs),
        ...(extra ?? {}),
      },
      'pdf:trace'
    );
  };

  const { targetSum, data } = options || {};
  logger.info(
    {
      scope: 'pdf',
      step: 'build:start',
      targetSum,
      gender: data?.gender,
      age: data?.age,
      income: data?.income,
      ndflRate: data?.ndflRate,
      reinvest: data?.reinvest,
    },
    'pdf:build:start'
  );

  const pdfHtml = MESSAGES.CAPITAL_FLOW.RESPONSES.PDF_TEMPLATE.replace(
    '{personalTotal}',
    formatCurrency(calculation.personalTotal)
  )
    .replace('{monthlyContribution}', formatCurrency(calculation.monthlyContribution))
    .replace('{stateTotal}', formatCurrency(calculation.stateTotal))
    .replace('{annualStateSupport}', formatCurrency(calculation.annualStateSupport))
    .replace('{opsTransfer}', formatCurrency(0))
    .replace('{investmentIncome}', formatCurrency(calculation.investmentIncome))
    .replace('{taxTotal}', formatCurrency(calculation.taxTotal))
    .replace('{taxRate}', String(data?.ndflRate ?? 0))
    .replace(
      '{taxNote}',
      calculation.reinvestedTaxTotal > 0
        ? ''
        : '<br/>Налоговый вычет не реинвестируется и выплачивается на ваш счёт.'
    )
    .replace('{lifePayment}', formatCurrency(calculation.lifePayment))
    .replace('{tenYearPayment}', formatCurrency(calculation.tenYearPayment))
    .replace('{lumpSum}', formatCurrency(targetSum || calculation.lumpSum));
  logProgress('html:ready', { htmlLength: pdfHtml.length });

  const browser = await getBrowser();
  logProgress('browser:ready');

  const context = await browser.newContext();
  logProgress('context:created');

  let pdfBuffer: Buffer;
  try {
    const page = await context.newPage();
    logProgress('page:created');

    await page.setContent(pdfHtml, { waitUntil: 'domcontentloaded' });
    logProgress('page:content:set');

    pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    logProgress('pdf:generated', { pdfSize: pdfBuffer.length });
  } finally {
    await context.close();
    logProgress('context:closed');
  }

  logger.info(
    { scope: 'pdf', step: 'build:done', totalMs: Math.round(performance.now() - startAt) },
    'pdf:build:done'
  );

  return pdfBuffer;
}
