// ============================================================================
// JOB DEDUPLICATOR
// Detects and merges duplicate job postings
// ============================================================================

import { JobPosting } from '../types.js';
import { getDb } from '../../../database/connection.js';

export class JobDeduplicator {
  /**
   * Find potential duplicate of a job
   */
  async findDuplicate(job: Partial<JobPosting>): Promise<string | null> {
    const db = getDb();

    // Strategy 1: Exact source ID match
    if (job.sourceId && job.source) {
      const exactMatch = await db
        .prepare('SELECT id FROM job_postings WHERE source = ? AND source_id = ? LIMIT 1')
        .get(job.source, job.sourceId) as { id: string } | undefined;

      if (exactMatch) {
        return exactMatch.id;
      }
    }

    // Strategy 2: Similar title + company + location match
    if (job.company && job.title) {
      const similar = await db
        .prepare(
          `SELECT id, title, company, location 
           FROM job_postings 
           WHERE company = ? 
           LIMIT 10`
        )
        .all(job.company) as Array<{ id: string; title: string; company: string; location: string }>;

      if (similar && similar.length > 0) {
        // Calculate similarity scores
        for (const candidate of similar) {
          const score = this.calculateSimilarity(job, candidate);
          if (score >= 0.85) {
            return candidate.id;
          }
        }
      }
    }

    return null;
  }

  /**
   * Calculate similarity between two jobs (0-1 score)
   */
  calculateSimilarity(job1: Partial<JobPosting>, job2: Partial<JobPosting>): number {
    let score = 0;
    let weights = 0;

    // Title similarity (weight: 0.4)
    if (job1.title && job2.title) {
      const titleSim = this.stringSimilarity(job1.title, job2.title);
      score += titleSim * 0.4;
      weights += 0.4;
    }

    // Company match (weight: 0.3)
    if (job1.company && job2.company) {
      const companySim = job1.company.toLowerCase() === job2.company.toLowerCase() ? 1 : 0;
      score += companySim * 0.3;
      weights += 0.3;
    }

    // Location similarity (weight: 0.2)
    if (job1.city && job2.city) {
      const locationSim = job1.city.toLowerCase() === job2.city.toLowerCase() ? 1 : 0;
      score += locationSim * 0.2;
      weights += 0.2;
    }

    // Description similarity (weight: 0.1)
    if (job1.description && job2.description) {
      const descSim = this.stringSimilarity(
        job1.description.slice(0, 500),
        job2.description.slice(0, 500)
      );
      score += descSim * 0.1;
      weights += 0.1;
    }

    return weights > 0 ? score / weights : 0;
  }

  /**
   * Simple string similarity using Jaccard index
   */
  private stringSimilarity(str1: string, str2: string): number {
    const words1 = new Set(this.extractKeywords(str1));
    const words2 = new Set(this.extractKeywords(str2));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Extract meaningful keywords from text
   */
  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'should', 'could', 'may', 'might', 'must', 'can',
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 50);
  }

  /**
   * Merge duplicate jobs (keep newer/better quality one)
   */
  async mergeDuplicates(existingId: string, newJob: Partial<JobPosting>): Promise<void> {
    const db = getDb();

    // Get existing job
    const existing = await db
      .prepare('SELECT * FROM job_postings WHERE id = ?')
      .get(existingId) as JobPosting | undefined;

    if (!existing) return;

    // Decide which data to keep (prefer newer, higher quality)
    const useNewData = (newJob.dataQualityScore || 0) >= (existing.dataQualityScore || 0);

    const merged = {
      // Keep better quality data
      description: useNewData && newJob.description ? newJob.description : existing.description,
      requirements: useNewData && newJob.requirements ? newJob.requirements : existing.requirements,
      
      // Update salary if new data has it
      salary_min: newJob.salaryMin || (existing as any).salary_min,
      salary_max: newJob.salaryMax || (existing as any).salary_max,
      
      // Merge skills
      skills: JSON.stringify([
        ...new Set([
          ...(existing.skills ? (typeof existing.skills === 'string' ? JSON.parse(existing.skills) : existing.skills) : []),
          ...(newJob.skills || []),
        ]),
      ]),
      
      // Update timestamps
      updated_at: new Date().toISOString(),
      
      // Keep higher quality score
      data_quality_score: Math.max(
        (existing as any).data_quality_score || (existing as any).dataQualityScore || 0,
        newJob.dataQualityScore || 0
      ),
    };

    await db.prepare(
      `UPDATE job_postings 
       SET description = ?,
           requirements = ?,
           salary_min = ?,
           salary_max = ?,
           skills = ?,
           data_quality_score = ?,
           updated_at = ?
       WHERE id = ?`
    ).run(
      merged.description,
      merged.requirements,
      merged.salary_min,
      merged.salary_max,
      merged.skills,
      merged.data_quality_score,
      merged.updated_at,
      existingId
    );
  }
}
