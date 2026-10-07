// ============================================================================
// BASE COLLECTOR INTERFACE
// Abstract base class for all job collectors
// ============================================================================

import { RawJobData, JobSource, CollectorResult, CollectorType } from '../types.js';

export interface CollectorConfig {
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  rateLimitPerMinute?: number;
  rateLimitPerDay?: number;
  timeout?: number;
  maxRetries?: number;
  [key: string]: any;
}

export abstract class BaseCollector {
  protected source: JobSource;
  protected collectorType: CollectorType;
  protected config: CollectorConfig;
  protected requestCount: number = 0;
  protected lastRequestTime: number = 0;

  constructor(source: JobSource, collectorType: CollectorType, config: CollectorConfig = {}) {
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
   * Main collection method - must be implemented by subclasses
   */
  abstract collect(params?: any): Promise<CollectorResult>;

  /**
   * Test connection/API key validity
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Rate limiting - ensure we don't exceed API limits
   */
  protected async respectRateLimit(): Promise<void> {
    if (!this.config.rateLimitPerMinute) return;

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
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * HTTP request with retry logic
   */
  protected async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retries: number = this.config.maxRetries || 3
  ): Promise<Response> {
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
      } catch (error: any) {
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
  protected validateJobData(job: Partial<RawJobData>): job is RawJobData {
    return !!(job.title && job.source);
  }

  /**
   * Get collector metadata
   */
  public getMetadata() {
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
