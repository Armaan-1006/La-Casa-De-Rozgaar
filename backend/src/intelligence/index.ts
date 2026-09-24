import { config } from '../config.js';
import type { IntelligenceProvider } from './provider.js';
import { MockIntelligenceProvider } from './mockProvider.js';
import { RemoteIntelligenceProvider } from './remoteProvider.js';

let provider: IntelligenceProvider | null = null;

export function getIntelligenceProvider(): IntelligenceProvider {
  if (!provider) {
    if (config.intelligenceProvider === 'remote') {
      console.log('[Intelligence] Using Remote Provider (Module 1 API)');
      provider = new RemoteIntelligenceProvider();
    } else {
      console.log('[Intelligence] Using Mock Provider');
      provider = new MockIntelligenceProvider();
    }
  }
  return provider;
}

export type { IntelligenceProvider } from './provider.js';
export { MockIntelligenceProvider } from './mockProvider.js';
export { RemoteIntelligenceProvider } from './remoteProvider.js';
