// ============================================================================
// JOB INGESTION SERVICE
// Orchestrates the complete ingestion pipeline
// ============================================================================

import { getDb } from '../../database/connection.js';
import { RawJobData, JobPosting, IngestionLog, CollectorResult } from './types.js';
import { JobNormalizer } from './processors/job-normalizer.js';
import { JobDeduplicator } from './processors/job-deduplicator.js';
import { SkillExtractor } from './processors/skill-extractor.js';
import { v4 as uuidv4 } from 'uuid';

export class JobIngestionService {
  private normalizer: JobNormalizer;
  private deduplicator: JobDeduplicator;
  private skillExtractor: SkillExtractor;

  constructor() {
    this.normalizer = new JobNormalizer();
    this.deduplicator = new JobDeduplicator();
    this.skillExtractor = new SkillExtractor();
  }

  /**
   * Ingest job postings from collector result
   */
  async ingestJobs(result: CollectorResult): Promise<IngestionLog> {
    const logId = uuidv4();
    const startedAt = new Date().toISOString();
    const db = getDb();

    // Create ingestion log
    await db.prepare(
      `INSERT INTO ingestion_logs (
        id, source, collector_type, total_jobs, status, started_at
      ) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(logId, result.source, 'api', result.jobs.length, 'IN_PROGRESS', startedAt);

    let newJobs = 0;
    let updatedJobs = 0;
    let duplicateJobs = 0;
    let failedJobs = 0;

    for (const rawJob of result.jobs) {
      try {
        // Step 1: Normalize
        const normalized = this.normalizer.normalize(rawJob);
        
        if (!normalized.success || normalized.dataQualityScore < 0.5) {
          console.warn(`Low quality job skipped: ${rawJob.title}`, normalized.issues);
          failedJobs++;
          continue;
        }

        const job = normalized.normalized as JobPosting;

        // Step 2: Check for duplicates
        const duplicateId = await this.deduplicator.findDuplicate(job);
        
        if (duplicateId) {
          // Update existing job
          await this.deduplicator.mergeDuplicates(duplicateId, job);
          duplicateJobs++;
          updatedJobs++;
          continue;
        }

        // Step 3: Extract skills if description available
        if (job.description) {
          const extracted = this.skillExtractor.extractSkills(job.description, job.requirements);
          
          // Merge with existing skills
          job.skills = [...new Set([...job.skills, ...extracted.skills])];
          job.requiredSkills = [...new Set([...job.requiredSkills, ...extracted.requiredSkills])];
          job.preferredSkills = [...new Set([...job.preferredSkills, ...extracted.preferredSkills])];
          job.skillsExtracted = true;
        }

        // Step 4: Insert new job
        await this.insertJobPosting(job);
        newJobs++;

      } catch (error: any) {
        console.error(`Failed to ingest job:`, error);
        failedJobs++;
      }
    }

    // Update ingestion log
    const completedAt = new Date().toISOString();
    const durationSeconds = (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000;

    await db.prepare(
      `UPDATE ingestion_logs 
       SET status = ?,
           new_jobs = ?,
           updated_jobs = ?,
           duplicate_jobs = ?,
           failed_jobs = ?,
           completed_at = ?,
           duration_seconds = ?
       WHERE id = ?`
    ).run(
      'COMPLETED',
      newJobs,
      updatedJobs,
      duplicateJobs,
      failedJobs,
      completedAt,
      durationSeconds,
      logId
    );

    return {
      id: logId,
      source: result.source,
      collectorType: 'api',
      totalJobs: result.jobs.length,
      newJobs,
      updatedJobs,
      duplicateJobs,
      failedJobs,
      status: 'COMPLETED',
      startedAt,
      completedAt,
      durationSeconds,
      createdAt: startedAt,
    };
  }

  /**
   * Insert job posting into database
   */
  private async insertJobPosting(job: JobPosting): Promise<void> {
    const db = getDb();

    await db.prepare(
      `INSERT INTO job_postings (
        id, source, source_id, source_url,
        title, company, company_id, location, city, state, country,
        description, requirements, responsibilities, benefits,
        employment_type, remote_type,
        experience_min, experience_max, education_level,
        salary_min, salary_max, salary_currency, salary_period,
        skills, required_skills, preferred_skills,
        industry, category, seniority_level,
        application_url, application_email,
        posted_at, expires_at, collected_at,
        processed, normalized, skills_extracted, data_quality_score,
        raw_data, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?
      )`
    ).run(
      job.id,
      job.source,
      job.sourceId,
      job.sourceUrl,
      job.title,
      job.company,
      job.companyId,
      job.location,
      job.city,
      job.state,
      job.country,
      job.description,
      job.requirements,
      job.responsibilities,
      job.benefits,
      job.employmentType,
      job.remoteType,
      job.experienceMin,
      job.experienceMax,
      job.educationLevel,
      job.salaryMin,
      job.salaryMax,
      job.salaryCurrency,
      job.salaryPeriod,
      JSON.stringify(job.skills || []),
      JSON.stringify(job.requiredSkills || []),
      JSON.stringify(job.preferredSkills || []),
      job.industry,
      job.category,
      job.seniorityLevel,
      job.applicationUrl,
      job.applicationEmail,
      job.postedAt,
      job.expiresAt,
      job.collectedAt,
      job.processed ? 1 : 0,
      job.normalized ? 1 : 0,
      job.skillsExtracted ? 1 : 0,
      job.dataQualityScore,
      job.rawData ? JSON.stringify(job.rawData) : null,
      job.createdAt,
      job.updatedAt
    );
  }

  /**
   * Get ingestion statistics
   */
  async getIngestionStats(source?: string, days: number = 7): Promise<any> {
    const db = getDb();

    const query = source
      ? `SELECT 
           COUNT(*) as total_ingestions,
           SUM(new_jobs) as total_new_jobs,
           SUM(duplicate_jobs) as total_duplicates,
           SUM(failed_jobs) as total_failures,
           AVG(duration_seconds) as avg_duration
         FROM ingestion_logs
         WHERE source = ?
         AND started_at >= datetime('now', '-' || ? || ' days')`
      : `SELECT 
           COUNT(*) as total_ingestions,
           SUM(new_jobs) as total_new_jobs,
           SUM(duplicate_jobs) as total_duplicates,
           SUM(failed_jobs) as total_failures,
           AVG(duration_seconds) as avg_duration
         FROM ingestion_logs
         WHERE started_at >= datetime('now', '-' || ? || ' days')`;

    const params = source ? [source, days] : [days];
    const stats = db.prepare(query).get(...params);

    return stats;
  }

  /**
   * Get recent ingestion logs
   */
  async getRecentLogs(limit: number = 10): Promise<IngestionLog[]> {
    const db = getDb();

    const logs = db
      .prepare(
        `SELECT * FROM ingestion_logs
         ORDER BY started_at DESC
         LIMIT ?`
      )
      .all(limit) as any[];

    return logs.map(log => ({
      id: log.id,
      source: log.source,
      collectorType: log.collector_type,
      batchId: log.batch_id,
      totalJobs: log.total_jobs,
      newJobs: log.new_jobs,
      updatedJobs: log.updated_jobs,
      duplicateJobs: log.duplicate_jobs,
      failedJobs: log.failed_jobs,
      status: log.status,
      errorMessage: log.error_message,
      metadata: log.metadata ? JSON.parse(log.metadata) : undefined,
      startedAt: log.started_at,
      completedAt: log.completed_at,
      durationSeconds: log.duration_seconds,
      createdAt: log.created_at,
    }));
  }
}
