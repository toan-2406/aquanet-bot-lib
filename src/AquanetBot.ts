import axios, { AxiosInstance } from 'axios';
import { Config, ConfigSchema, Message, ChatResponse, StreamChunk, AquanetBotOptions } from './types';
import { AquacultureConfigSchema } from './validators/aquaculture';

export class AquanetBot {
  private config: Config;
  private client: AxiosInstance;
  private defaultSystemPrompt: string;

  constructor(options: AquanetBotOptions) {
    // Validate base config
    const validatedConfig = ConfigSchema.parse(options.config);
    
    // Validate aquaculture config if provided
    if (options.config.aquacultureConfig) {
      AquacultureConfigSchema.parse(options.config.aquacultureConfig);
    }

    this.config = validatedConfig;
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Build system prompt based on aquaculture config
    this.defaultSystemPrompt = this.buildSystemPrompt();
  }

  private buildSystemPrompt(): string {
    const aquaConfig = this.config.aquacultureConfig;
    if (!aquaConfig) {
      return this.config.defaultPrompt || 
        'You are an AI assistant specialized in aquaculture business.';
    }

    const prompts = [
      // Base role definition
      'You are an AI assistant specialized in aquaculture business.',

      // Knowledge domains
      `Your expertise covers: ${aquaConfig.knowledgeDomains.join(', ')}.`,

      // Expertise level and language
      `Provide ${aquaConfig.expertiseLevel}-level information in ${aquaConfig.language} language.`,

      // Industry terms usage
      aquaConfig.useIndustryTerms ? 
        'Use industry-specific terminology and technical language.' :
        'Use simplified language accessible to general audience.',

      // Source citation requirement
      aquaConfig.validation.requireSourceCitation ?
        'Include source citations for technical information and data.' : '',

      // Species-specific instructions
      aquaConfig.customization.speciesSpecific.length > 0 ?
        `Specialized in: ${aquaConfig.customization.speciesSpecific.join(', ')}.` : '',

      // Regional guidelines
      aquaConfig.customization.regionalGuidelines.length > 0 ?
        `Follow guidelines for: ${aquaConfig.customization.regionalGuidelines.join(', ')}.` : '',

      // Custom system prompt if provided
      this.config.defaultPrompt || '',
    ];

    return prompts.filter(Boolean).join('\n');
  }

  private async processStreamResponse(response: Response): Promise<string> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = '';

    if (!reader) throw new Error('Stream reader not available');

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
            const parsed = JSON.parse(line) as StreamChunk;
            const content = parsed.choices[0]?.delta?.content || '';
            if (content) {
              result += content;
              this.config.onStream?.(content);
            }
          } catch (e) {
            console.warn('Failed to parse stream chunk:', line);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return result;
  }

  async chat(messages: Message[], systemPrompt?: string): Promise<ChatResponse | string> {
    const isStreaming = this.config.responseFormat === 'stream';
    const requestBody = {
      model: "deepseek-chat",
      messages: [
        { role: 'system', content: systemPrompt || this.defaultSystemPrompt },
        ...messages,
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      stream: isStreaming
    };

    try {
      if (isStreaming) {
        const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await this.processStreamResponse(response);
      } else {
        const response = await this.client.post<ChatResponse>('/chat/completions', requestBody);
        return response.data;
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(`API request failed: ${error.response.data.error}`);
      }
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  async query(prompt: string): Promise<string> {
    const response = await this.chat([{ role: 'user', content: prompt }]);
    if (typeof response === 'string') {
      return response;
    }
    return response.choices[0]?.message?.content || '';
  }
} 