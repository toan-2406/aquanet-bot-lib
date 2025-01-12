import { ILLMProvider, LLMConfig, LLMInput, LLMOutput, LLMStreamChunk } from '../types/llm';

/**
 * Abstract class cơ sở cho các LLM providers
 */
export abstract class BaseLLMProvider implements ILLMProvider {
  protected config!: LLMConfig;
  protected initialized: boolean = false;

  constructor() {
    this.initialized = false;
  }

  /**
   * Khởi tạo provider với config
   */
  async initialize(config: LLMConfig): Promise<void> {
    if (this.validateConfig(config)) {
      this.config = config;
      this.initialized = true;
    } else {
      throw new Error('Invalid configuration');
    }
  }

  /**
   * Kiểm tra trạng thái khởi tạo
   */
  protected checkInitialized(): void {
    if (!this.initialized) {
      throw new Error('Provider not initialized');
    }
  }

  /**
   * Xử lý lỗi chung
   */
  protected handleError(error: any): never {
    if (error.response?.data?.error) {
      throw new Error(`API request failed: ${error.response.data.error}`);
    }
    throw new Error(`Request failed: ${error.message}`);
  }

  /**
   * Các phương thức abstract cần được implement bởi các provider cụ thể
   */
  abstract validateConfig(config: LLMConfig): boolean;
  abstract query(input: LLMInput): Promise<LLMOutput>;
  abstract streamQuery(input: LLMInput, onChunk: (chunk: LLMStreamChunk) => void): Promise<void>;

  /**
   * Các phương thức utility chung
   */
  protected buildHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  protected validateInput(input: LLMInput): void {
    if (!input.prompt) {
      throw new Error('Prompt is required');
    }
  }

  protected buildRequestBody(input: LLMInput): any {
    return {
      ...this.config.defaultParams,
      temperature: input.temperature ?? this.config.defaultParams?.temperature ?? 0.7,
      max_tokens: input.maxTokens ?? this.config.defaultParams?.maxTokens ?? 1000,
      stream: input.stream ?? false,
      ...input.extraParams,
    };
  }
} 