
export type SentimentType = 'إيجابي' | 'سلبي' | 'محايد';

export interface SentimentAnalysis {
  sentiment: SentimentType;
  confidence: number;
  emoji: string;
  explanation: string;
}

export interface Attachment {
  data: string; // Base64
  mimeType: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  attachment?: Attachment;
  sentimentResult?: SentimentAnalysis;
  timestamp: Date;
}
