import axios, { AxiosInstance } from 'axios';
import { BaseLLMProvider } from '../base';
import { LLMConfig, LLMInput, LLMOutput, LLMStreamChunk, LLMProviders } from '../../types/llm';

export class DeepSeekProvider extends BaseLLMProvider {
  private client!: AxiosInstance;

  async initialize(config: LLMConfig): Promise<void> {
    await super.initialize(config);
    this.client = axios.create({
      baseURL: this.config.baseUrl || 'https://api.deepseek.com/v1',
      headers: this.buildHeaders(),
      timeout: this.config.timeout || 30000,
    });
  }

  validateConfig(config: LLMConfig): boolean {
    return (
      config.provider === LLMProviders.DEEPSEEK &&
      !!config.apiKey &&
      !!config.model
    );
  }

  async query(input: LLMInput): Promise<LLMOutput> {
    this.checkInitialized();
    this.validateInput(input);

    try {
      const response = await this.client.post('/chat/completions', {
        model: this.config.model,
        messages: [
          { role: 'system', content: input.systemPrompt || '' },
          { role: 'user', content: input.prompt }
        ],
        ...this.buildRequestBody(input),
      });

      return {
        content: response.data.choices[0]?.message?.content || '',
        metadata: {
          provider: LLMProviders.DEEPSEEK,
          model: this.config.model,
          usage: {
            promptTokens: response.data.usage?.prompt_tokens || 0,
            completionTokens: response.data.usage?.completion_tokens || 0,
            totalTokens: response.data.usage?.total_tokens || 0,
          },
        },
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async streamQuery(input: LLMInput, onChunk: (chunk: LLMStreamChunk) => void): Promise<void> {
    this.checkInitialized();
    this.validateInput(input);

    try {
      const response = await fetch(`${this.config.baseUrl || 'https://api.deepseek.com/v1'}/chat/completions`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: input.systemPrompt || '' },
            { role: 'user', content: input.prompt }
          ],
          ...this.buildRequestBody({ ...input, stream: true }),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Stream reader not available');
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk
            .split('\n')
            .filter(line => line.trim().startsWith('data: '))
            .map(line => line.replace('data: ', '').trim())
            .filter(line => line !== '[DONE]' && line);

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                onChunk({
                  content,
                  done: false,
                  metadata: {
                    provider: LLMProviders.DEEPSEEK,
                    model: this.config.model,
                  },
                });
              }
            } catch (e) {
              console.warn('Failed to parse stream chunk:', line);
            }
          }
        }

        onChunk({
          content: '',
          done: true,
          metadata: {
            provider: LLMProviders.DEEPSEEK,
            model: this.config.model,
          },
        });
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }
} 