import { z } from 'zod';

/**
 *�ịnh nghĩa phạm vi kiến thức cho chatbot
 */
export const KnowledgeDomains = {
  FARMING_TECHNIQUES: 'farming_techniques',
  WATER_QUALITY: 'water_quality',
  DISEASE_MANAGEMENT: 'disease_management',
  BREEDING: 'breeding',
  FEED_MANAGEMENT: 'feed_management',
  PRODUCTION: 'production',
  MARKET_ANALYSIS: 'market_analysis',
  REGULATIONS: 'regulations',
} as const;

/**
 * Cấu hình cho AquanetBot
 * @property {string} apiKey - API key của DeepSeek, bắt buộc để xác thực
 * @property {string} baseUrl - URL cơ sở của DeepSeek API, mặc định là 'https://api.deepseek.com/v1'
 * @property {string} defaultPrompt - System prompt mặc định cho bot, định hướng cách bot trả lời
 * @property {number} temperature - Độ sáng tạo của câu trả lời (0-1)
 * @property {number} maxTokens - Số token tối đa cho mỗi câu trả lời
 * @property {'json' | 'stream'} responseFormat - Định dạng phản hồi
 * @property {function} onStream - Callback xử lý stream
 * 
 * Cấu hình chuyên biệt cho aquaculture:
 * @property {object} aquacultureConfig - Cấu hình đặc thù cho nuôi trồng thủy sản
 *   @property {string[]} knowledgeDomains - Các lĩnh vực chuyên môn (farming_techniques, water_quality, etc.)
 *   @property {string[]} dataSources - Nguồn dữ liệu tham khảo (research_papers, industry_standards, etc.)
 *   @property {'basic' | 'intermediate' | 'advanced'} expertiseLevel - Mức độ chuyên sâu của thông tin
 *   @property {string} language - Ngôn ngữ chính (vi, en)
 *   @property {boolean} useIndustryTerms - Sử dụng thuật ngữ chuyên ngành
 *   @property {object} tools - Công cụ tích hợp (máy tính thông số nước, lịch nuôi, etc.)
 *   @property {object} validation - Cấu hình kiểm tra độ chính xác
 *   @property {object} customization - Tùy chỉnh theo nhu cầu cụ thể
 */
export const ConfigSchema = z.object({
  apiKey: z.string(),
  baseUrl: z.string().default('https://api.deepseek.com/v1'),
  defaultPrompt: z.string().optional(),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(1000),
  responseFormat: z.enum(['json', 'stream']).default('json'),
  onStream: z.function()
    .args(z.string())
    .returns(z.void())
    .optional(),
  
  // Cấu hình chuyên biệt cho aquaculture
  aquacultureConfig: z.object({
    knowledgeDomains: z.array(z.enum([
      KnowledgeDomains.FARMING_TECHNIQUES,
      KnowledgeDomains.WATER_QUALITY,
      KnowledgeDomains.DISEASE_MANAGEMENT,
      KnowledgeDomains.BREEDING,
      KnowledgeDomains.FEED_MANAGEMENT,
      KnowledgeDomains.PRODUCTION,
      KnowledgeDomains.MARKET_ANALYSIS,
      KnowledgeDomains.REGULATIONS,
    ])).default([KnowledgeDomains.FARMING_TECHNIQUES]),

    dataSources: z.array(z.enum([
      'research_papers',
      'industry_standards',
      'technical_guidelines',
      'expert_knowledge',
      'case_studies',
      'market_reports',
    ])).default(['industry_standards']),

    expertiseLevel: z.enum(['basic', 'intermediate', 'advanced'])
      .default('intermediate'),

    language: z.enum(['vi', 'en']).default('vi'),
    useIndustryTerms: z.boolean().default(true),

    tools: z.object({
      waterCalculator: z.boolean().default(false),
      farmingCalendar: z.boolean().default(false),
      alertSystem: z.boolean().default(false),
      diseaseIdentifier: z.boolean().default(false),
      feedOptimizer: z.boolean().default(false),
    }).default({}),

    validation: z.object({
      requireSourceCitation: z.boolean().default(true),
      confidenceScoring: z.boolean().default(true),
      expertReviewThreshold: z.number().min(0).max(1).default(0.8),
      factCheckSources: z.array(z.string()).default([]),
    }).default({}),

    customization: z.object({
      speciesSpecific: z.array(z.string()).default([]),
      farmingMethods: z.array(z.string()).default([]),
      regionalGuidelines: z.array(z.string()).default([]),
      customPrompts: z.record(z.string()).default({}),
    }).default({}),
  }).default({}),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Định dạng tin nhắn trao đổi với API
 * @property {'system' | 'user' | 'assistant'} role - Vai trò của tin nhắn
 * @property {string} content - Nội dung tin nhắn
 */
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Định dạng phản hồi từ API khi không sử dụng stream
 */
export interface ChatResponse {
  id: string;
  choices: Array<{
    message: Message;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Định dạng của từng phần dữ liệu trong stream response
 */
export interface StreamChunk {
  id: string;
  choices: Array<{
    delta: Partial<Message>;
    finish_reason: string | null;
  }>;
}

/**
 * Tùy chọn khởi tạo cho AquanetBot
 * @property {Config} config - Cấu hình cho bot
 * @property {'react' | 'nextjs'} framework - Framework đang sử dụng
 */
export interface AquanetBotOptions {
  config: Config;
  framework?: 'react' | 'nextjs';
} 