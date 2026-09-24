/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Enable extensions
  pgm.createExtension('uuid-ossp', { ifNotExists: true });
  pgm.createExtension('pg_trgm', { ifNotExists: true });

  // ============================================================================
  // SKILLS
  // ============================================================================

  pgm.createTable('skills', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    canonical_name: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    category: {
      type: 'varchar(100)',
      comment: 'programming-language, framework, tool, domain, soft-skill',
    },
    parent_skill_id: {
      type: 'uuid',
      references: 'skills(id)',
      onDelete: 'SET NULL',
    },
    description: {
      type: 'text',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('skills', 'canonical_name');
  pgm.createIndex('skills', 'category');
  pgm.createIndex('skills', 'parent_skill_id');
  pgm.createIndex('skills', 'canonical_name', { method: 'gin', opclass: 'gin_trgm_ops' });

  // ============================================================================
  // SKILL ALIASES
  // ============================================================================

  pgm.createTable('skill_aliases', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    skill_id: {
      type: 'uuid',
      notNull: true,
      references: 'skills(id)',
      onDelete: 'CASCADE',
    },
    alias: {
      type: 'varchar(255)',
      notNull: true,
    },
    confidence: {
      type: 'decimal(3,2)',
      notNull: true,
      default: 1.0,
      check: 'confidence >= 0 AND confidence <= 1',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('skill_aliases', 'skill_id');
  pgm.createIndex('skill_aliases', 'alias');
  pgm.createIndex('skill_aliases', 'alias', { method: 'gin', opclass: 'gin_trgm_ops' });
  pgm.addConstraint('skill_aliases', 'unique_skill_alias', {
    unique: ['skill_id', 'alias'],
  });

  // ============================================================================
  // ROLES
  // ============================================================================

  pgm.createTable('roles', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    canonical_name: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    role_family: {
      type: 'varchar(100)',
      comment: 'engineering, data, design, product, etc.',
    },
    seniority_level: {
      type: 'varchar(50)',
      comment: 'entry, mid, senior, lead, principal',
    },
    description: {
      type: 'text',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('roles', 'canonical_name');
  pgm.createIndex('roles', 'role_family');
  pgm.createIndex('roles', 'seniority_level');
  pgm.createIndex('roles', 'canonical_name', { method: 'gin', opclass: 'gin_trgm_ops' });

  // ============================================================================
  // JOBS
  // ============================================================================

  pgm.createTable('jobs', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    source: {
      type: 'varchar(100)',
      notNull: true,
    },
    external_id: {
      type: 'varchar(255)',
    },
    canonical_job_id: {
      type: 'uuid',
      references: 'jobs(id)',
      onDelete: 'SET NULL',
      comment: 'Link to canonical record if duplicate',
    },

    // Basic info
    title: {
      type: 'varchar(500)',
      notNull: true,
    },
    normalized_role: {
      type: 'varchar(255)',
    },
    role_id: {
      type: 'uuid',
      references: 'roles(id)',
      onDelete: 'SET NULL',
    },
    description: {
      type: 'text',
    },

    // Company
    company_name: {
      type: 'varchar(255)',
    },
    industry: {
      type: 'varchar(100)',
    },

    // Location
    location: {
      type: 'varchar(255)',
    },
    country: {
      type: 'varchar(100)',
    },
    state: {
      type: 'varchar(100)',
    },
    city: {
      type: 'varchar(100)',
    },
    is_remote: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    is_hybrid: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    is_onsite: {
      type: 'boolean',
      notNull: true,
      default: false,
    },

    // Employment
    employment_type: {
      type: 'varchar(50)',
    },

    // Compensation
    salary_min: {
      type: 'decimal(12,2)',
    },
    salary_max: {
      type: 'decimal(12,2)',
    },
    salary_currency: {
      type: 'varchar(3)',
      notNull: true,
      default: 'INR',
    },
    salary_period: {
      type: 'varchar(20)',
    },

    // Requirements
    experience_min: {
      type: 'integer',
    },
    experience_max: {
      type: 'integer',
    },
    seniority_level: {
      type: 'varchar(50)',
    },
    education: {
      type: 'jsonb',
    },

    // Metadata
    posted_at: {
      type: 'timestamp',
    },
    expires_at: {
      type: 'timestamp',
    },
    source_url: {
      type: 'text',
    },

    // Processing
    processing_status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'pending',
      check: "processing_status IN ('pending', 'processed', 'failed')",
    },
    extraction_confidence: {
      type: 'decimal(3,2)',
      check: 'extraction_confidence >= 0 AND extraction_confidence <= 1',
    },
    is_duplicate: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    duplicate_of: {
      type: 'uuid',
      references: 'jobs(id)',
      onDelete: 'SET NULL',
    },

    // Timestamps
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('jobs', 'source');
  pgm.createIndex('jobs', ['source', 'external_id'], { unique: true });
  pgm.createIndex('jobs', 'role_id');
  pgm.createIndex('jobs', 'processing_status');
  pgm.createIndex('jobs', 'is_duplicate');
  pgm.createIndex('jobs', 'posted_at');
  pgm.createIndex('jobs', 'location');
  pgm.createIndex('jobs', 'country');
  pgm.createIndex('jobs', 'is_remote');
  pgm.createIndex('jobs', 'employment_type');
  pgm.createIndex('jobs', 'title', { method: 'gin', opclass: 'gin_trgm_ops' });
  pgm.createIndex('jobs', 'company_name');
  pgm.createIndex('jobs', 'created_at');

  // ============================================================================
  // RAW JOBS (Original ingested data)
  // ============================================================================

  pgm.createTable('raw_jobs', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    job_id: {
      type: 'uuid',
      references: 'jobs(id)',
      onDelete: 'CASCADE',
    },
    raw_payload: {
      type: 'jsonb',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('raw_jobs', 'job_id');

  // ============================================================================
  // JOB SKILLS (Many-to-many)
  // ============================================================================

  pgm.createTable('job_skills', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    job_id: {
      type: 'uuid',
      notNull: true,
      references: 'jobs(id)',
      onDelete: 'CASCADE',
    },
    skill_id: {
      type: 'uuid',
      notNull: true,
      references: 'skills(id)',
      onDelete: 'CASCADE',
    },
    is_required: {
      type: 'boolean',
      notNull: true,
      default: true,
    },
    confidence: {
      type: 'decimal(3,2)',
      notNull: true,
      default: 1.0,
      check: 'confidence >= 0 AND confidence <= 1',
    },
    source: {
      type: 'varchar(20)',
      notNull: true,
      default: 'extraction',
      check: "source IN ('extraction', 'manual', 'inferred')",
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('job_skills', 'job_id');
  pgm.createIndex('job_skills', 'skill_id');
  pgm.addConstraint('job_skills', 'unique_job_skill', {
    unique: ['job_id', 'skill_id'],
  });

  // ============================================================================
  // ROLE SKILL REQUIREMENTS
  // ============================================================================

  pgm.createTable('role_skill_requirements', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    role_id: {
      type: 'uuid',
      notNull: true,
      references: 'roles(id)',
      onDelete: 'CASCADE',
    },
    skill_id: {
      type: 'uuid',
      notNull: true,
      references: 'skills(id)',
      onDelete: 'CASCADE',
    },
    importance: {
      type: 'varchar(20)',
      notNull: true,
      check: "importance IN ('required', 'preferred', 'optional')",
    },
    average_requirement: {
      type: 'decimal(4,2)',
      comment: 'Average proficiency level 0-10',
    },
    frequency: {
      type: 'integer',
      notNull: true,
      default: 0,
      comment: 'How often this skill appears for this role',
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('role_skill_requirements', 'role_id');
  pgm.createIndex('role_skill_requirements', 'skill_id');
  pgm.addConstraint('role_skill_requirements', 'unique_role_skill', {
    unique: ['role_id', 'skill_id'],
  });

  // ============================================================================
  // Continue in next migration file...
  // ============================================================================
};

exports.down = (pgm) => {
  pgm.dropTable('role_skill_requirements');
  pgm.dropTable('job_skills');
  pgm.dropTable('raw_jobs');
  pgm.dropTable('jobs');
  pgm.dropTable('roles');
  pgm.dropTable('skill_aliases');
  pgm.dropTable('skills');
  pgm.dropExtension('pg_trgm');
  pgm.dropExtension('uuid-ossp');
};
