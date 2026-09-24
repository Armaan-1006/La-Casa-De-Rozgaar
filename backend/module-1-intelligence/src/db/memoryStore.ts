import { query, pool } from '../db/index.js';
import type {
  Job,
  Skill,
  SkillAlias,
  Role,
  RoleSkillRequirement,
  MarketObservation,
  TrendAnalysis,
  EmergingSignal,
  CompensationObservation,
  Forecast,
  DataQualityRecord,
  IngestionRun,
  SkillRelationship,
} from '../types/index.js';

/**
 * In-Memory Data Store
 * Provides instant, zero-dependency storage that synchronizes with PostgreSQL when connected,
 * ensuring Module 1 is 100% independently runnable and testable out of the box.
 */
class MemoryDataStore {
  public jobs: Map<string, Job> = new Map();
  public rawJobs: Map<string, any> = new Map();
  public skills: Map<string, Skill> = new Map();
  public skillAliases: Map<string, SkillAlias> = new Map();
  public roles: Map<string, Role> = new Map();
  public jobSkills: Map<string, { jobId: string; skillId: string; isRequired: boolean; confidence: number; source: 'extraction' | 'manual' | 'inferred' }[]> = new Map();
  public roleSkillRequirements: Map<string, RoleSkillRequirement[]> = new Map();
  public skillRelationships: Map<string, SkillRelationship> = new Map();
  public marketObservations: MarketObservation[] = [];
  public trendAnalysis: TrendAnalysis[] = [];
  public emergingSignals: EmergingSignal[] = [];
  public compensationObservations: CompensationObservation[] = [];
  public forecasts: Forecast[] = [];
  public dataQualityRecords: DataQualityRecord[] = [];
  public ingestionRuns: Map<string, IngestionRun> = new Map();

  private isSeeded = false;

  public getIsSeeded(): boolean {
    return this.isSeeded;
  }

  public setIsSeeded(val: boolean): void {
    this.isSeeded = val;
  }

  public clear(): void {
    this.jobs.clear();
    this.rawJobs.clear();
    this.skills.clear();
    this.skillAliases.clear();
    this.roles.clear();
    this.jobSkills.clear();
    this.roleSkillRequirements.clear();
    this.skillRelationships.clear();
    this.marketObservations = [];
    this.trendAnalysis = [];
    this.emergingSignals = [];
    this.compensationObservations = [];
    this.forecasts = [];
    this.dataQualityRecords = [];
    this.ingestionRuns.clear();
    this.isSeeded = false;
  }
}

export const memoryStore = new MemoryDataStore();
