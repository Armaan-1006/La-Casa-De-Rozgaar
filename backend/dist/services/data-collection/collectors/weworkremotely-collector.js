// ============================================================================
// WEWORKREMOTELY COLLECTOR
// High-grade global remote programming & DevOps jobs via XML/RSS feed
// ============================================================================
import { BaseCollector } from './base-collector.js';
export class WeWorkRemotelyCollector extends BaseCollector {
    FEED_URL = 'https://weworkremotely.com/categories/remote-programming-jobs.rss';
    constructor(config = {}) {
        super('custom', 'api', config);
    }
    async collect(params = {}) {
        try {
            const { limit = 50 } = params;
            const response = await this.fetchWithRetry(this.FEED_URL);
            const xml = await response.text();
            const items = this.parseRss(xml);
            const jobs = [];
            for (const item of items.slice(0, limit)) {
                const normalized = this.normalizeWwrJob(item);
                if (this.validateJobData(normalized)) {
                    jobs.push(normalized);
                }
            }
            return {
                success: true,
                source: 'custom',
                jobs,
                totalCount: jobs.length,
                metadata: { provider: 'weworkremotely' },
            };
        }
        catch (error) {
            console.error('WeWorkRemotely collection error:', error);
            return {
                success: false,
                source: 'custom',
                jobs: [],
                totalCount: 0,
                errorMessage: error.message,
            };
        }
    }
    parseRss(xml) {
        const items = [];
        const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
        for (const raw of itemMatches) {
            const titleMatch = raw.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || raw.match(/<title>(.*?)<\/title>/);
            const linkMatch = raw.match(/<link>(.*?)<\/link>/);
            const descMatch = raw.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s) || raw.match(/<description>(.*?)<\/description>/s);
            const pubDateMatch = raw.match(/<pubDate>(.*?)<\/pubDate>/);
            const guidMatch = raw.match(/<guid[^>]*>(.*?)<\/guid>/);
            if (titleMatch && linkMatch) {
                items.push({
                    title: titleMatch[1]?.trim() || '',
                    link: linkMatch[1]?.trim() || '',
                    description: descMatch ? descMatch[1]?.trim() : '',
                    pubDate: pubDateMatch ? pubDateMatch[1]?.trim() : new Date().toISOString(),
                    guid: guidMatch ? guidMatch[1]?.trim() : linkMatch[1]?.trim() || Math.random().toString(),
                });
            }
        }
        return items;
    }
    normalizeWwrJob(item) {
        // WWR titles are usually "Company Name: Job Title"
        let company = 'Remote Tech Co';
        let title = item.title;
        if (item.title.includes(':')) {
            const parts = item.title.split(':');
            company = parts[0].trim();
            title = parts.slice(1).join(':').trim();
        }
        return {
            source: 'custom',
            sourceId: `wwr-${item.guid.replace(/[^a-zA-Z0-9_-]/g, '')}`,
            sourceUrl: item.link,
            title,
            company,
            location: 'Anywhere (Remote)',
            country: 'Worldwide',
            description: item.description.replace(/<[^>]+>/g, ' '),
            skills: [],
            employmentType: 'FULL_TIME',
            remoteType: 'REMOTE',
            applicationUrl: item.link,
            postedAt: new Date(item.pubDate).toISOString(),
            rawData: item,
        };
    }
    async testConnection() {
        try {
            const res = await this.collect({ limit: 1 });
            return res.success && res.jobs.length > 0;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=weworkremotely-collector.js.map