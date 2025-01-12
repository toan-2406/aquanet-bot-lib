import { z } from 'zod';

/**
 * Các loại mô hình LLM được hỗ trợ
 */
export const LLMProviders = {
  DEEPSEEK: 'deepseek',
  OPENAI: 'openai',
  GEMINI: 'gemini',
  ANTHROPIC: 'anthropic',
} as const;

export type LLMProvider = typeof LLMProviders[keyof typeof LLMProviders];

/**
 * Định dạng dữ liệu đầu vào cho các mô hình
 */
export interface LLMInput {
  prompt: string;
  context?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  extraParams?: Record<string, any>;
}

/**
 * Định dạng dữ liệu đầu ra từ các mô hình
 */
export interface LLMOutput {
  content: string;
  metadata?: {
    provider: LLMProvider;
    model: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    confidence?: number;
    citations?: Array<{
      source: string;
      reference: string;
    }>;
  };
}

/**
 * Định dạng dữ liệu stream
 */
export interface LLMStreamChunk {
  content: string;
  done: boolean;
  metadata?: {
    provider: LLMProvider;
    model: string;
  };
}

/**
 * Cấu hình cho mỗi provider
 */
export const LLMConfigSchema = z.object({
  provider: z.enum([
    LLMProviders.DEEPSEEK,
    LLMProviders.OPENAI,
    LLMProviders.GEMINI,
    LLMProviders.ANTHROPIC,
  ]),
  apiKey: z.string(),
  baseUrl: z.string().optional(),
  model: z.string(),
  defaultParams: z.object({
    temperature: z.number().min(0).max(1).optional(),
    maxTokens: z.number().positive().optional(),
    topP: z.number().min(0).max(1).optional(),
    topK: z.number().positive().optional(),
    presencePenalty: z.number().optional(),
    frequencyPenalty: z.number().optional(),
  }).optional(),
  timeout: z.number().positive().optional(),
  retries: z.number().nonnegative().optional(),
});

export type LLMConfig = z.infer<typeof LLMConfigSchema>;

/**
 * Interface cho các LLM providers
 */
export interface ILLMProvider {
  initialize(config: LLMConfig): Promise<void>;
  query(input: LLMInput): Promise<LLMOutput>;
  streamQuery(input: LLMInput, onChunk: (chunk: LLMStreamChunk) => void): Promise<void>;
  validateConfig(config: LLMConfig): boolean;
}

/**
 * Định dạng dữ liệu đặc thù cho nuôi trồng thủy sản
 */
export interface AquacultureData {
  environmentalData?: {
    waterQuality?: {
      temperature?: number;
      pH?: number;
      dissolvedOxygen?: number;
      salinity?: number;
      ammonia?: number;
      nitrite?: number;
      alkalinity?: number;
    };
    weather?: {
      temperature?: number;
      humidity?: number;
      rainfall?: number;
      windSpeed?: number;
    };
  };
  biologicalData?: {
    species: string;
    stage: string;
    age?: number;
    size?: number;
    density?: number;
    feedingRate?: number;
    survivalRate?: number;
    diseaseSymptoms?: string[];
  };
  productionData?: {
    stockingDate?: Date;
    harvestDate?: Date;
    feedUsed?: number;
    production?: number;
    fcr?: number;
    costs?: {
      feed?: number;
      electricity?: number;
      labor?: number;
      other?: number;
    };
  };
  metadata?: {
    farmId: string;
    pondId: string;
    timestamp: Date;
    source: string;
    confidenceLevel?: number;
  };
}

/**
 * Loại nhiệm vụ cho LLM
 */
export enum AquacultureTaskType {
  WATER_QUALITY_ANALYSIS = 'water_quality_analysis',
  DISEASE_DIAGNOSIS = 'disease_diagnosis',
  FEEDING_OPTIMIZATION = 'feeding_optimization',
  GROWTH_PREDICTION = 'growth_prediction',
  COST_ANALYSIS = 'cost_analysis',
  TECHNICAL_ADVICE = 'technical_advice',
  MARKET_ANALYSIS = 'market_analysis',
  ENVIRONMENTAL_IMPACT = 'environmental_impact',
} 