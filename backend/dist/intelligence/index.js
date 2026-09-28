import { config } from '../config.js';
import { MockIntelligenceProvider } from './mockProvider.js';
import { RemoteIntelligenceProvider } from './remoteProvider.js';
let provider = null;
export function getIntelligenceProvider() {
    if (!provider) {
        if (config.intelligenceProvider === 'remote') {
            console.log('[Intelligence] Using Remote Provider (Module 1 API)');
            provider = new RemoteIntelligenceProvider();
        }
        else {
            console.log('[Intelligence] Using Mock Provider');
            provider = new MockIntelligenceProvider();
        }
    }
    return provider;
}
export { MockIntelligenceProvider } from './mockProvider.js';
export { RemoteIntelligenceProvider } from './remoteProvider.js';
//# sourceMappingURL=index.js.map