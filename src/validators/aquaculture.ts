import { z } from 'zod';
import { KnowledgeDomains } from '../types';

/**
 * Validator cho nguồn dữ liệu
 * - Phải là một trong các nguồn được định nghĩa
 * - Không được trùng lặp
 */
export const DataSourceSchema = z.array(z.enum([
  'research_papers',
  'industry_standards',
  'technical_guidelines',
  'expert_knowledge',
  'case_studies',
  'market_reports',
]))
.refine(sources => new Set(sources).size === sources.length, {
  message: 'Nguồn dữ liệu không được trùng lặp',
});

/**
 * Validator cho công cụ tích hợp
 * - Các công cụ phải được bật/tắt rõ ràng
 * - Nếu bật alertSystem thì phải có ít nhất một nguồn dữ liệu
 */
export const ToolsSchema = z.object({
  waterCalculator: z.boolean(),
  farmingCalendar: z.boolean(),
  alertSystem: z.boolean(),
  diseaseIdentifier: z.boolean(),
  feedOptimizer: z.boolean(),
}).refine(tools => {
  if (tools.alertSystem) {
    return tools.waterCalculator || tools.diseaseIdentifier;
  }
  return true;
}, {
  message: 'Alert system yêu cầu ít nhất một công cụ monitoring',
});

/**
 * Validator cho kiểm tra độ chính xác
 * - Ngưỡng đánh giá phải hợp lý (0.5-1.0)
 * - Nếu yêu cầu trích dẫn thì phải có nguồn kiểm tra
 */
export const ValidationSchema = z.object({
  requireSourceCitation: z.boolean(),
  confidenceScoring: z.boolean(),
  expertReviewThreshold: z.number().min(0.5).max(1),
  factCheckSources: z.array(z.string()),
}).refine(validation => {
  if (validation.requireSourceCitation) {
    return validation.factCheckSources.length > 0;
  }
  return true;
}, {
  message: 'Yêu cầu ít nhất một nguồn kiểm tra khi bật tính năng trích dẫn',
});

/**
 * Validator cho tùy chỉnh
 * - Các loài phải được định nghĩa rõ ràng
 * - Phương pháp nuôi phải phù hợp với loài
 * - Hướng dẫn vùng miền phải hợp lệ
 */
export const CustomizationSchema = z.object({
  speciesSpecific: z.array(z.string()).min(1),
  farmingMethods: z.array(z.string()).min(1),
  regionalGuidelines: z.array(z.string()),
  customPrompts: z.record(z.string()),
}).refine(custom => {
  // Kiểm tra tính hợp lệ của phương pháp nuôi với loài
  const validMethods = {
    shrimp: ['intensive', 'semi-intensive', 'extensive'],
    tilapia: ['cage', 'pond', 'recirculating'],
    pangasius: ['intensive', 'semi-intensive'],
  };
  
  return custom.speciesSpecific.every(species => 
    custom.farmingMethods.some(method => 
      validMethods[species as keyof typeof validMethods]?.includes(method)
    )
  );
}, {
  message: 'Phương pháp nuôi không phù hợp với loài được chọn',
});

/**
 * Validator chính cho aquaculture config
 * - Kiểm tra tính hợp lệ và phụ thuộc giữa các thuộc tính
 * - Đảm bảo tính nhất quán của cấu hình
 */
export const AquacultureConfigSchema = z.object({
  knowledgeDomains: z.array(z.enum([
    KnowledgeDomains.FARMING_TECHNIQUES,
    KnowledgeDomains.WATER_QUALITY,
    KnowledgeDomains.DISEASE_MANAGEMENT,
    KnowledgeDomains.BREEDING,
    KnowledgeDomains.FEED_MANAGEMENT,
    KnowledgeDomains.PRODUCTION,
    KnowledgeDomains.MARKET_ANALYSIS,
    KnowledgeDomains.REGULATIONS,
  ])).min(1),
  
  dataSources: DataSourceSchema,
  expertiseLevel: z.enum(['basic', 'intermediate', 'advanced']),
  language: z.enum(['vi', 'en']),
  useIndustryTerms: z.boolean(),
  tools: ToolsSchema,
  validation: ValidationSchema,
  customization: CustomizationSchema,
}).refine(config => {
  // Kiểm tra sự phù hợp giữa mức độ chuyên môn và nguồn dữ liệu
  if (config.expertiseLevel === 'advanced') {
    return config.dataSources.includes('research_papers');
  }
  return true;
}, {
  message: 'Mức độ chuyên môn cao yêu cầu nguồn dữ liệu từ nghiên cứu khoa học',
}); 