import type { Context, SessionFlavor } from 'grammy';
import type { Conversation, ConversationFlavor } from '@grammyjs/conversations';

interface SessionData {
  lastCalculation?: {
    targetSum: number;
    gender: 'male' | 'female';
    age: number;
    income: 'low' | 'mid' | 'high';
    ndflRate: string;
    reinvest: boolean;
  };
}

export type MyContext = Context &
  SessionFlavor<SessionData> &
  ConversationFlavor<Context & SessionFlavor<SessionData>>;
export type MyConversation = Conversation<MyContext, MyContext>;
