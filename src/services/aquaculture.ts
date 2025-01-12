import { LLMFactory } from '../llm/factory';
import { 
  LLMConfig, 
  LLMInput, 
  AquacultureData, 
  AquacultureTaskType 
} from '../types/llm';

/**
 * Service xử lý các tác vụ nuôi trồng thủy sản
 */
export class AquacultureService {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  /**
   * Phân tích chất lượng nước
   */
  async analyzeWaterQuality(data: AquacultureData): Promise<string> {
    const provider = await LLMFactory.getProvider(this.config);
    
    const prompt = this.buildPrompt(AquacultureTaskType.WATER_QUALITY_ANALYSIS, data);
    const systemPrompt = this.buildSystemPrompt(AquacultureTaskType.WATER_QUALITY_ANALYSIS);

    const response = await provider.query({
      prompt,
      systemPrompt,
      temperature: 0.3, // Cần độ chính xác cao
    });

    return response.content;
  }

  /**
   * Chẩn đoán bệnh
   */
  async diagnoseDiseases(data: AquacultureData): Promise<string> {
    const provider = await LLMFactory.getProvider(this.config);
    
    const prompt = this.buildPrompt(AquacultureTaskType.DISEASE_DIAGNOSIS, data);
    const systemPrompt = this.buildSystemPrompt(AquacultureTaskType.DISEASE_DIAGNOSIS);

    const response = await provider.query({
      prompt,
      systemPrompt,
      temperature: 0.3,
    });

    return response.content;
  }

  /**
   * Tối ưu hóa cho ăn
   */
  async optimizeFeeding(data: AquacultureData): Promise<string> {
    const provider = await LLMFactory.getProvider(this.config);
    
    const prompt = this.buildPrompt(AquacultureTaskType.FEEDING_OPTIMIZATION, data);
    const systemPrompt = this.buildSystemPrompt(AquacultureTaskType.FEEDING_OPTIMIZATION);

    const response = await provider.query({
      prompt,
      systemPrompt,
      temperature: 0.5,
    });

    return response.content;
  }

  /**
   * Dự đoán tăng trưởng
   */
  async predictGrowth(data: AquacultureData): Promise<string> {
    const provider = await LLMFactory.getProvider(this.config);
    
    const prompt = this.buildPrompt(AquacultureTaskType.GROWTH_PREDICTION, data);
    const systemPrompt = this.buildSystemPrompt(AquacultureTaskType.GROWTH_PREDICTION);

    const response = await provider.query({
      prompt,
      systemPrompt,
      temperature: 0.5,
    });

    return response.content;
  }

  /**
   * Phân tích chi phí
   */
  async analyzeCosts(data: AquacultureData): Promise<string> {
    const provider = await LLMFactory.getProvider(this.config);
    
    const prompt = this.buildPrompt(AquacultureTaskType.COST_ANALYSIS, data);
    const systemPrompt = this.buildSystemPrompt(AquacultureTaskType.COST_ANALYSIS);

    const response = await provider.query({
      prompt,
      systemPrompt,
      temperature: 0.3,
    });

    return response.content;
  }

  /**
   * Tư vấn kỹ thuật
   */
  async getTechnicalAdvice(data: AquacultureData): Promise<string> {
    const provider = await LLMFactory.getProvider(this.config);
    
    const prompt = this.buildPrompt(AquacultureTaskType.TECHNICAL_ADVICE, data);
    const systemPrompt = this.buildSystemPrompt(AquacultureTaskType.TECHNICAL_ADVICE);

    const response = await provider.query({
      prompt,
      systemPrompt,
      temperature: 0.7,
    });

    return response.content;
  }

  /**
   * Phân tích thị trường
   */
  async analyzeMarket(data: AquacultureData): Promise<string> {
    const provider = await LLMFactory.getProvider(this.config);
    
    const prompt = this.buildPrompt(AquacultureTaskType.MARKET_ANALYSIS, data);
    const systemPrompt = this.buildSystemPrompt(AquacultureTaskType.MARKET_ANALYSIS);

    const response = await provider.query({
      prompt,
      systemPrompt,
      temperature: 0.7,
    });

    return response.content;
  }

  /**
   * Đánh giá tác động môi trường
   */
  async assessEnvironmentalImpact(data: AquacultureData): Promise<string> {
    const provider = await LLMFactory.getProvider(this.config);
    
    const prompt = this.buildPrompt(AquacultureTaskType.ENVIRONMENTAL_IMPACT, data);
    const systemPrompt = this.buildSystemPrompt(AquacultureTaskType.ENVIRONMENTAL_IMPACT);

    const response = await provider.query({
      prompt,
      systemPrompt,
      temperature: 0.5,
    });

    return response.content;
  }

  /**
   * Xây dựng prompt cho từng loại tác vụ
   */
  private buildPrompt(taskType: AquacultureTaskType, data: AquacultureData): string {
    const dataStr = JSON.stringify(data, null, 2);
    
    switch (taskType) {
      case AquacultureTaskType.WATER_QUALITY_ANALYSIS:
        return `Phân tích các thông số chất lượng nước sau và đưa ra đánh giá, khuyến nghị:\n${dataStr}`;
      
      case AquacultureTaskType.DISEASE_DIAGNOSIS:
        return `Dựa trên các triệu chứng và thông số môi trường sau, hãy chẩn đoán bệnh và đề xuất phương pháp điều trị:\n${dataStr}`;
      
      case AquacultureTaskType.FEEDING_OPTIMIZATION:
        return `Dựa trên dữ liệu sau, hãy đề xuất phương án tối ưu hóa cho ăn:\n${dataStr}`;
      
      case AquacultureTaskType.GROWTH_PREDICTION:
        return `Dựa trên dữ liệu lịch sử sau, hãy dự đoán tăng trưởng và năng suất:\n${dataStr}`;
      
      case AquacultureTaskType.COST_ANALYSIS:
        return `Phân tích chi phí sản xuất và đề xuất giải pháp tối ưu dựa trên dữ liệu sau:\n${dataStr}`;
      
      case AquacultureTaskType.TECHNICAL_ADVICE:
        return `Dựa trên thông tin sau, hãy đưa ra tư vấn kỹ thuật chi tiết:\n${dataStr}`;
      
      case AquacultureTaskType.MARKET_ANALYSIS:
        return `Phân tích thị trường và đề xuất chiến lược kinh doanh dựa trên dữ liệu sau:\n${dataStr}`;
      
      case AquacultureTaskType.ENVIRONMENTAL_IMPACT:
        return `Đánh giá tác động môi trường và đề xuất giải pháp bền vững dựa trên dữ liệu sau:\n${dataStr}`;
      
      default:
        throw new Error(`Unsupported task type: ${taskType}`);
    }
  }

  /**
   * Xây dựng system prompt cho từng loại tác vụ
   */
  private buildSystemPrompt(taskType: AquacultureTaskType): string {
    const basePrompt = 'Bạn là một chuyên gia tư vấn trong lĩnh vực nuôi trồng thủy sản. ';
    
    switch (taskType) {
      case AquacultureTaskType.WATER_QUALITY_ANALYSIS:
        return basePrompt + 'Hãy phân tích chi tiết các thông số chất lượng nước, đánh giá mức độ phù hợp, và đưa ra các khuyến nghị cụ thể để cải thiện. Tập trung vào các thông số quan trọng như DO, pH, độ kiềm, và các chỉ số nitrogen.';
      
      case AquacultureTaskType.DISEASE_DIAGNOSIS:
        return basePrompt + 'Hãy phân tích các triệu chứng bệnh, điều kiện môi trường, và đưa ra chẩn đoán chính xác. Đề xuất các biện pháp điều trị và phòng ngừa phù hợp. Ưu tiên các giải pháp thân thiện với môi trường.';
      
      case AquacultureTaskType.FEEDING_OPTIMIZATION:
        return basePrompt + 'Hãy phân tích và đề xuất phương án cho ăn tối ưu, bao gồm: loại thức ăn, kích cỡ, tần suất, và khẩu phần. Cân nhắc các yếu tố như giai đoạn phát triển, điều kiện môi trường, và hiệu quả kinh tế.';
      
      case AquacultureTaskType.GROWTH_PREDICTION:
        return basePrompt + 'Hãy dự đoán tăng trưởng và năng suất dựa trên dữ liệu lịch sử. Phân tích các yếu tố ảnh hưởng và đề xuất giải pháp cải thiện. Cung cấp các chỉ số dự báo cụ thể và độ tin cậy.';
      
      case AquacultureTaskType.COST_ANALYSIS:
        return basePrompt + 'Hãy phân tích chi tiết cơ cấu chi phí, xác định các điểm không hiệu quả, và đề xuất giải pháp tối ưu hóa. Tính toán các chỉ số ROI và đề xuất chiến lược giảm chi phí.';
      
      case AquacultureTaskType.TECHNICAL_ADVICE:
        return basePrompt + 'Hãy đưa ra tư vấn kỹ thuật toàn diện về quy trình nuôi trồng, bao gồm: chuẩn bị ao, quản lý môi trường, phòng bệnh, và thu hoạch. Đảm bảo các khuyến nghị phù hợp với điều kiện thực tế.';
      
      case AquacultureTaskType.MARKET_ANALYSIS:
        return basePrompt + 'Hãy phân tích xu hướng thị trường, cung cầu, giá cả, và đối thủ cạnh tranh. Đề xuất chiến lược kinh doanh phù hợp và các cơ hội phát triển mới.';
      
      case AquacultureTaskType.ENVIRONMENTAL_IMPACT:
        return basePrompt + 'Hãy đánh giá tác động môi trường của hoạt động nuôi trồng, bao gồm: chất thải, sử dụng tài nguyên, và đa dạng sinh học. Đề xuất các giải pháp bền vững và thân thiện với môi trường.';
      
      default:
        throw new Error(`Unsupported task type: ${taskType}`);
    }
  }
} 