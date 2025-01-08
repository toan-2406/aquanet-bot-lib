# Aquanet Bot Library

A DeepSeek API integration library for aquaculture-related business queries.

## Installation

```bash
npm install aquanet-bot-lib
# or
pnpm add aquanet-bot-lib
```

## Features

- 🤖 Easy integration with DeepSeek API
- 🌊 Specialized in aquaculture domain
- 🔍 Advanced validation and configuration
- 🎯 Streaming responses support
- 📝 TypeScript support
- ⚛️ React hooks included

## Usage

### Basic Usage

```typescript
import { useAquanetBot } from 'aquanet-bot-lib';

function App() {
  const { loading, error, query } = useAquanetBot({
    config: {
      apiKey: 'YOUR_API_KEY',
      baseUrl: 'https://api.deepseek.com/v1',
      temperature: 0.7,
      maxTokens: 1000,
      responseFormat: 'stream',
      onStream: (chunk) => console.log(chunk),
      aquacultureConfig: {
        knowledgeDomains: [
          'farming_techniques',
          'water_quality',
          'disease_management'
        ],
        expertiseLevel: 'intermediate',
        language: 'vi',
        useIndustryTerms: true
      }
    }
  });

  const handleQuery = async () => {
    try {
      const response = await query('Các yếu tố quan trọng trong quản lý chất lượng nước ao nuôi tôm?');
      console.log(response);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      <button onClick={handleQuery}>Ask Question</button>
    </div>
  );
}
```

### Configuration Options

```typescript
interface AquacultureConfig {
  knowledgeDomains: Array<
    | 'farming_techniques'
    | 'water_quality'
    | 'disease_management'
    | 'feed_management'
    | 'market_analysis'
  >;
  dataSources: Array<
    'research_papers' | 
    'industry_standards' | 
    'technical_guidelines'
  >;
  expertiseLevel: 'basic' | 'intermediate' | 'advanced';
  language: 'en' | 'vi';
  useIndustryTerms: boolean;
  tools: {
    waterCalculator: boolean;
    farmingCalendar: boolean;
    alertSystem: boolean;
    diseaseIdentifier: boolean;
    feedOptimizer: boolean;
  };
  validation: {
    requireSourceCitation: boolean;
    confidenceScoring: boolean;
    expertReviewThreshold: number;
    factCheckSources: string[];
  };
  customization: {
    speciesSpecific: string[];
    farmingMethods: string[];
    regionalGuidelines: string[];
    customPrompts: Record<string, string>;
  };
}
```

## License

MIT 