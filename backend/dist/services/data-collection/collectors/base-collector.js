// ============================================================================
// BASE COLLECTOR INTERFACE
// Abstract base class for all job collectors
// ============================================================================
export class BaseCollector {
    source;
    collectorType;
    config;
    requestCount = 0;
    lastRequestTime = 0;
    constructor(source, collectorType, config = {}) {
        this.source = source;
        this.collectorType = collectorType;
        this.config = {
            timeout: 30000,
            maxRetries: 3,
            rateLimitPerMinute: 60,
            ...config,
        };
    }
    /**
     * Rate limiting - ensure we don't exceed API limits
     */
    async respectRateLimit() {
        if (!this.config.rateLimitPerMinute)
            return;
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minDelay = (60 * 1000) / this.config.rateLimitPerMinute;
        if (timeSinceLastRequest < minDelay) {
            const waitTime = minDelay - timeSinceLastRequest;
            await this.sleep(waitTime);
        }
        this.lastRequestTime = Date.now();
        this.requestCount++;
    }
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * HTTP request with retry logic
     */
    async fetchWithRetry(url, options = {}, retries = this.config.maxRetries || 3) {
        await this.respectRateLimit();
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), this.config.timeout || 30000);
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                });
                clearTimeout(timeout);
                // Success
                if (response.ok) {
                    return response;
                }
                // Rate limit hit - wait and retry
                if (response.status === 429) {
                    const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
                    console.log(`Rate limited. Waiting ${retryAfter}s before retry...`);
                    await this.sleep(retryAfter * 1000);
                    continue;
                }
                // Server error - retry
                if (response.status >= 500 && attempt < retries - 1) {
                    await this.sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
                    continue;
                }
                // Client error - don't retry
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            catch (error) {
                if (attempt === retries - 1) {
                    throw error;
                }
                console.log(`Request failed (attempt ${attempt + 1}/${retries}):`, error.message);
                await this.sleep(Math.pow(2, attempt) * 1000);
            }
        }
        throw new Error('Max retries exceeded');
    }
    /**
     * Validate raw job data before returning
     */
    validateJobData(job) {
        return !!(job.title && job.source);
    }
    /**
     * Get collector metadata
     */
    getMetadata() {
        return {
            source: this.source,
            collectorType: this.collectorType,
            requestCount: this.requestCount,
            config: {
                rateLimitPerMinute: this.config.rateLimitPerMinute,
                timeout: this.config.timeout,
            },
        };
    }
}
//# sourceMappingURL=base-collector.js.map