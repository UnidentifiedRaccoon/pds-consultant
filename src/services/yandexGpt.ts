import { config } from '../config/env.js';
import { MESSAGES } from '../bot/messages.js';
import { logger } from '../logger.js';

type ChatRole = 'user' | 'assistant';

export interface ConsultationHistoryMessage {
  role: ChatRole;
  text: string;
}

interface YcMessage {
  role: 'system' | ChatRole;
  text: string;
}

const HISTORY_LIMIT = 8;

const modelUri = config.YC_GPT_MODEL.startsWith('gpt://')
  ? config.YC_GPT_MODEL
  : `gpt://${config.YC_FOLDER_ID}/${config.YC_GPT_MODEL}`;

function buildPayload(
  history: ConsultationHistoryMessage[],
  userMessage: string
): { messages: YcMessage[] } {
  const limitedHistory = history.slice(-HISTORY_LIMIT);
  const messages: YcMessage[] = [
    {
      role: 'system',
      text: MESSAGES.CONSULTATION.SYSTEM_PROMPT,
    },
    ...limitedHistory.map((item) => ({
      role: item.role,
      text: item.text,
    })),
    {
      role: 'user',
      text: userMessage,
    },
  ];

  return { messages };
}

interface YcContentItem {
  text?: string;
}

interface YcMessagePayload {
  text?: string;
  content?: YcContentItem[];
}

interface YcChoice {
  message?: YcMessagePayload;
  text?: string;
}

interface YcResponse {
  choices?: YcChoice[];
  result?: {
    alternatives?: Array<{
      message?: YcMessagePayload;
      text?: string;
    }>;
  };
}

function pickTextFromMessage(message?: YcMessagePayload): string | null {
  if (!message) {
    return null;
  }

  if (typeof message.text === 'string' && message.text.trim()) {
    return message.text.trim();
  }

  if (Array.isArray(message.content)) {
    const combined = message.content
      .map((item) => item?.text)
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .join('\n')
      .trim();
    if (combined) {
      return combined;
    }
  }

  return null;
}

function extractAssistantText(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const withChoices = data as YcResponse;
  const choice = withChoices.choices?.[0];
  if (choice) {
    const { message, text } = choice;
    const fromMessage = pickTextFromMessage(message);
    if (fromMessage) {
      return fromMessage;
    }
    if (typeof text === 'string' && text.trim()) {
      return text.trim();
    }
  }

  const result = withChoices.result;
  const alternative = result?.alternatives?.[0];
  if (alternative) {
    const { message, text } = alternative;
    const fromMessage = pickTextFromMessage(message);
    if (fromMessage) {
      return fromMessage;
    }
    if (typeof text === 'string' && text.trim()) {
      return text.trim();
    }
  }

  return null;
}

export async function fetchConsultationReply(
  history: ConsultationHistoryMessage[],
  userMessage: string
): Promise<{ text: string; history: ConsultationHistoryMessage[] }> {
  const payload = buildPayload(history, userMessage);

  const requestBody = {
    modelUri,
    completionOptions: {
      stream: false,
      temperature: 0.2,
      maxTokens: 800,
      topP: 0.95,
    },
    messages: payload.messages,
  };

  const data = await callYandexGpt(requestBody);

  const assistantRaw = extractAssistantText(data);

  if (!assistantRaw) {
    throw new Error('YC GPT returned empty response');
  }

  const assistantText = sanitizeAssistantText(assistantRaw);

  const trimmedHistory = history.slice(-HISTORY_LIMIT);
  const updatedHistory: ConsultationHistoryMessage[] = [
    ...trimmedHistory,
    { role: 'user' as const, text: userMessage },
    { role: 'assistant' as const, text: assistantText },
  ].slice(-HISTORY_LIMIT);

  return { text: assistantText, history: updatedHistory };
}

async function callYandexGpt(body: unknown): Promise<unknown> {
  const endpoints = buildEndpointList(config.YC_GPT_ENDPOINT);
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    logger.debug({ endpoint, bodySize: JSON.stringify(body).length }, 'yandex-gpt:request:start');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Api-Key ${config.YC_API_KEY}`,
        'x-folder-id': config.YC_FOLDER_ID,
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      logger.debug({ endpoint }, 'yandex-gpt:request:success');
      return response.json();
    }

    const errorText = await response.text();
    lastError = new Error(`YC GPT request failed (${endpoint}): ${response.status} ${errorText}`);
    logger.warn({ endpoint, status: response.status, errorText }, 'yandex-gpt:request:failed');
  }

  throw lastError ?? new Error('YC GPT request failed');
}

function buildEndpointList(initialEndpoint: string): string[] {
  const endpoints = [initialEndpoint];

  if (initialEndpoint.endsWith('/chat/completions')) {
    const fallback = initialEndpoint.replace(/\/chat\/completions$/, '/completion');
    endpoints.push(fallback);
  }

  return endpoints;
}

function sanitizeAssistantText(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/gs, '$1').trim();
}
