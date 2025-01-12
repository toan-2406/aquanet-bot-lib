import { LLMConfig, LLMProviders, ILLMProvider } from '../types/llm';
import { DeepSeekProvider } from './providers/deepseek';

/**
 * Factory class để tạo và quản lý các LLM providers
 */
export class LLMFactory {
  private static providers: Map<string, ILLMProvider> = new Map();

  /**
   * Tạo mới hoặc lấy provider đã tồn tại
   */
  static async getProvider(config: LLMConfig): Promise<ILLMProvider> {
    const key = `${config.provider}-${config.model}`;
    
    if (!this.providers.has(key)) {
      const provider = this.createProvider(config.provider);
      await provider.initialize(config);
      this.providers.set(key, provider);
    }

    return this.providers.get(key)!;
  }

  /**
   * Tạo provider mới dựa trên loại
   */
  private static createProvider(provider: string): ILLMProvider {
    switch (provider) {
      case LLMProviders.DEEPSEEK:
        return new DeepSeekProvider();
      // Thêm các providers khác ở đây
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  /**
   * Xóa provider khỏi cache
   */
  static removeProvider(config: LLMConfig): void {
    const key = `${config.provider}-${config.model}`;
    this.providers.delete(key);
  }

  /**
   * Xóa tất cả providers
   */
  static clearProviders(): void {
    this.providers.clear();
  }

  /**
   * Kiểm tra provider có được hỗ trợ
   */
  static isProviderSupported(provider: string): boolean {
    return Object.values(LLMProviders).includes(provider as any);
  }
} 