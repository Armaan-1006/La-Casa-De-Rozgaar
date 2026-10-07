// ============================================================================
// JOB DATA NORMALIZER
// Cleans, standardizes, and validates raw job data
// ============================================================================

import { RawJobData, JobPosting, NormalizerResult, EmploymentType, RemoteType } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

export class JobNormalizer {
  /**
   * Normalize raw job data into standardized format
   */
  normalize(raw: RawJobData): NormalizerResult {
    const issues: string[] = [];
    let dataQualityScore = 1.0;

    // Required fields
    if (!raw.title) {
      issues.push('Missing title');
      dataQualityScore -= 0.3;
    }
    if (!raw.source) {
      issues.push('Missing source');
      dataQualityScore -= 0.2;
    }

    // Normalize title
    const title = this.normalizeTitle(raw.title || '');

    // Normalize company
    const company = this.normalizeCompany(raw.company);

    // Normalize location
    const locationData = this.normalizeLocation(raw.location, raw.city, raw.state, raw.country);
    if (!locationData.country) {
      issues.push('Missing country');
      dataQualityScore -= 0.1;
    }

    // Normalize employment type
    const employmentType = this.normalizeEmploymentType(raw.employmentType);

    // Normalize remote type
    const remoteType = this.normalizeRemoteType(raw.remoteType, raw.location);

    // Normalize salary
    const salaryData = this.normalizeSalary(
      raw.salaryMin,
      raw.salaryMax,
      raw.salaryCurrency,
      raw.salaryPeriod
    );

    // Normalize experience
    const experienceData = this.normalizeExperience(raw.experienceMin, raw.experienceMax);

    // Normalize skills
    const skills = this.normalizeSkills(raw.skills || []);
    const requiredSkills = this.normalizeSkills(raw.requiredSkills || []);
    const preferredSkills = this.normalizeSkills(raw.preferredSkills || []);

    // Validate dates
    const postedAt = this.normalizeDate(raw.postedAt);
    const expiresAt = this.normalizeDate(raw.expiresAt);
    const collectedAt = new Date().toISOString();

    // Clean description
    const description = this.cleanText(raw.description);
    const requirements = this.cleanText(raw.requirements);
    const responsibilities = this.cleanText(raw.responsibilities);

    // Data quality adjustments
    if (!description || description.length < 50) {
      issues.push('Short or missing description');
      dataQualityScore -= 0.15;
    }
    if (!company) {
      issues.push('Missing company');
      dataQualityScore -= 0.1;
    }
    if (!salaryData.salaryMin && !salaryData.salaryMax) {
      dataQualityScore -= 0.05; // Not critical but good to have
    }

    // Ensure score is between 0 and 1
    dataQualityScore = Math.max(0, Math.min(1, dataQualityScore));

    const normalized: Partial<JobPosting> = {
      id: uuidv4(),
      source: raw.source,
      sourceId: raw.sourceId,
      sourceUrl: raw.sourceUrl,

      title,
      company,
      ...locationData,

      description,
      requirements,
      responsibilities,
      benefits: this.cleanText(raw.benefits),

      employmentType,
      remoteType,

      ...experienceData,
      educationLevel: raw.educationLevel,

      ...salaryData,

      skills,
      requiredSkills,
      preferredSkills,

      industry: raw.industry,
      category: raw.category,
      seniorityLevel: raw.seniorityLevel,
      applicationUrl: raw.applicationUrl,
      applicationEmail: raw.applicationEmail,

      postedAt,
      expiresAt,
      collectedAt,

      processed: false,
      normalized: true,
      skillsExtracted: false,
      dataQualityScore,

      rawData: raw.rawData,

      createdAt: collectedAt,
      updatedAt: collectedAt,
    };

    return {
      success: issues.length === 0 || dataQualityScore >= 0.5,
      normalized,
      issues,
      dataQualityScore,
    };
  }

  /**
   * Normalize job title
   */
  private normalizeTitle(title: string): string {
    return title
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-\/+#&(),.]/g, '')
      .slice(0, 255);
  }

  /**
   * Normalize company name
   */
  private normalizeCompany(company?: string): string | undefined {
    if (!company) return undefined;
    return company
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^(at\s+)/i, '')
      .slice(0, 255);
  }

  /**
   * Normalize location data
   */
  private normalizeLocation(
    location?: string,
    city?: string,
    state?: string,
    country?: string
  ): {
    location?: string;
    city?: string;
    state?: string;
    country: string;
  } {
    // Try to parse location string if city/state not provided
    if (location && !city && !state) {
      const parts = location.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        city = parts[0];
        state = parts[1];
        if (parts.length >= 3) {
          country = parts[parts.length - 1];
        }
      }
    }

    // Default to India if not specified
    const normalizedCountry = country || 'India';

    return {
      location: location?.trim(),
      city: city?.trim(),
      state: state?.trim(),
      country: normalizedCountry,
    };
  }

  /**
   * Normalize employment type
   */
  private normalizeEmploymentType(type?: string): EmploymentType | undefined {
    if (!type) return undefined;

    const normalized = type.toLowerCase().replace(/[\s\-_]/g, '');
    
    if (normalized.includes('fulltime') || normalized.includes('full')) return 'FULL_TIME';
    if (normalized.includes('parttime') || normalized.includes('part')) return 'PART_TIME';
    if (normalized.includes('contract') || normalized.includes('temporary')) return 'CONTRACT';
    if (normalized.includes('intern')) return 'INTERNSHIP';
    if (normalized.includes('freelance')) return 'FREELANCE';

    return undefined;
  }

  /**
   * Normalize remote type
   */
  private normalizeRemoteType(type?: string, location?: string): RemoteType | undefined {
    const text = ((type || '') + ' ' + (location || '')).toLowerCase();

    if (text.includes('remote') || text.includes('work from home')) return 'REMOTE';
    if (text.includes('hybrid')) return 'HYBRID';
    if (text.includes('flexible')) return 'FLEXIBLE';
    if (text.includes('onsite') || text.includes('on-site') || text.includes('office')) return 'ONSITE';

    return undefined;
  }

  /**
   * Normalize salary data
   */
  private normalizeSalary(
    min?: number,
    max?: number,
    currency?: string,
    period?: string
  ): {
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency: string;
    salaryPeriod?: 'YEARLY' | 'MONTHLY' | 'HOURLY';
  } {
    let normalizedPeriod: 'YEARLY' | 'MONTHLY' | 'HOURLY' = 'YEARLY';
    if (period) {
      const p = period.toUpperCase();
      if (p === 'MONTHLY' || p === 'MONTH') normalizedPeriod = 'MONTHLY';
      else if (p === 'HOURLY' || p === 'HOUR') normalizedPeriod = 'HOURLY';
    }

    return {
      salaryMin: min && min > 0 ? Math.floor(min) : undefined,
      salaryMax: max && max > 0 ? Math.floor(max) : undefined,
      salaryCurrency: currency || 'INR',
      salaryPeriod: normalizedPeriod,
    };
  }

  /**
   * Normalize experience requirements
   */
  private normalizeExperience(
    min?: number,
    max?: number
  ): {
    experienceMin?: number;
    experienceMax?: number;
  } {
    return {
      experienceMin: min !== undefined && min >= 0 ? Math.floor(min) : undefined,
      experienceMax: max !== undefined && max >= 0 ? Math.floor(max) : undefined,
    };
  }

  /**
   * Normalize skill names
   */
  private normalizeSkills(skills: string[]): string[] {
    const normalized = new Set<string>();

    for (const skill of skills) {
      const clean = this.normalizeSkillName(skill);
      if (clean) {
        normalized.add(clean);
      }
    }

    return Array.from(normalized).slice(0, 50); // Limit to 50 skills
  }

  /**
   * Normalize individual skill name
   */
  private normalizeSkillName(skill: string): string {
    // Skill name mappings for common variations
    const mappings: Record<string, string> = {
      'javascript': 'JavaScript',
      'js': 'JavaScript',
      'typescript': 'TypeScript',
      'ts': 'TypeScript',
      'reactjs': 'React',
      'react.js': 'React',
      'nodejs': 'Node.js',
      'node.js': 'Node.js',
      'node': 'Node.js',
      'python': 'Python',
      'java': 'Java',
      'golang': 'Go',
      'aws': 'AWS',
      'amazon web services': 'AWS',
      'gcp': 'Google Cloud',
      'google cloud platform': 'Google Cloud',
      'azure': 'Microsoft Azure',
      'kubernetes': 'Kubernetes',
      'k8s': 'Kubernetes',
      'docker': 'Docker',
      'postgresql': 'PostgreSQL',
      'postgres': 'PostgreSQL',
      'mongodb': 'MongoDB',
      'mongo': 'MongoDB',
      'mysql': 'MySQL',
      'sql': 'SQL',
      'html5': 'HTML5',
      'css3': 'CSS3',
      'git': 'Git',
      'github': 'GitHub',
      'gitlab': 'GitLab',
      'ci/cd': 'CI/CD',
      'cicd': 'CI/CD',
      'restapi': 'REST API',
      'rest': 'REST API',
      'graphql': 'GraphQL',
      'redis': 'Redis',
      'kafka': 'Apache Kafka',
      'apache kafka': 'Apache Kafka',
    };

    const normalized = skill
      .toLowerCase()
      .trim()
      .replace(/[^\w\s.+#-]/g, '');

    return mappings[normalized] || this.capitalizeSkill(skill.trim());
  }

  /**
   * Capitalize skill name properly
   */
  private capitalizeSkill(skill: string): string {
    // Keep common acronyms uppercase
    const acronyms = ['API', 'AWS', 'SQL', 'HTML', 'CSS', 'CI', 'CD', 'UI', 'UX', 'ML', 'AI'];
    const upper = skill.toUpperCase();
    if (acronyms.includes(upper)) return upper;

    // Capitalize first letter of each word
    return skill
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Clean text content
   */
  private cleanText(text?: string): string | undefined {
    if (!text) return undefined;

    return text
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s{2,}/g, ' ')
      .slice(0, 10000); // Limit length
  }

  /**
   * Normalize date string
   */
  private normalizeDate(date?: string): string | undefined {
    if (!date) return undefined;

    try {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) return undefined;
      return parsed.toISOString();
    } catch {
      return undefined;
    }
  }
}
