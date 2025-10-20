import { chromium, type Browser } from 'playwright';
import { MESSAGES } from './messages.js';
import { CapitalLumpSumResult } from '../../calculation-models/capital-lump-sum/index.js';

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
    browserPromise = chromium
      .launch({
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      })
      .catch((error) => {
        browserPromise = null;
        throw error;
      });
  }

  return browserPromise;
}

export async function generateCapitalPdfReport(
  calculation: CapitalLumpSumResult,
  options?: PdfReportOptions
): Promise<Buffer> {
  const { targetSum, data } = options || {};

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

  const browser = await getBrowser();
  const context = await browser.newContext();
  let pdfBuffer: Buffer;
  try {
    const page = await context.newPage();
    await page.setContent(pdfHtml, { waitUntil: 'domcontentloaded' });
    pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  } finally {
    await context.close();
  }

  return pdfBuffer;
}
