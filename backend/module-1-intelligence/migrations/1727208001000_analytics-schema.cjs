/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // ============================================================================
  // SKILL RELATIONSHIPS
  // ============================================================================

  pgm.createTable('skill_relationships', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    skill_id_1: {
      type: 'uuid',
      notNull: true,
      references: 'skills(id)',
      onDelete: 'CASCADE',
    },
    skill_id_2: {
      type: 'uuid',
      notNull: true,
      references: 'skills(id)',
      onDelete: 'CASCADE',
    },
    relationship_type: {
      type: 'varchar(20)',
      notNull: true,
      check: "relationship_type IN ('related', 'prerequisite', 'alternative')",
    },
    cooccurrence_count: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    strength: {
      type: 'decimal(3,2)',
      notNull: true,
      default: 0.0,
      check: 'strength >= 0 AND strength <= 1',
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('skill_relationships', 'skill_id_1');
  pgm.createIndex('skill_relationships', 'skill_id_2');
  pgm.addConstraint('skill_relationships', 'unique_skill_pair', {
    unique: ['skill_id_1', 'skill_id_2'],
  });

  // ============================================================================
  // MARKET OBSERVATIONS
  // ============================================================================

  pgm.createTable('market_observations', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    metric_type: {
      type: 'varchar(50)',
      notNull: true,
      check: "metric_type IN ('skill_demand', 'role_demand', 'compensation', 'geographic_demand')",
    },
    entity_type: {
      type: 'varchar(20)',
      notNull: true,
      check: "entity_type IN ('skill', 'role', 'location', 'industry')",
    },
    entity_id: {
      type: 'varchar(255)',
      notNull: true,
    },
    value: {
      type: 'decimal(12,2)',
      notNull: true,
    },
    period: {
      type: 'date',
      notNull: true,
    },
    sample_size: {
      type: 'integer',
      notNull: true,
    },
    confidence: {
      type: 'decimal(3,2)',
      notNull: true,
      default: 1.0,
      check: 'confidence >= 0 AND confidence <= 1',
    },
    metadata: {
      type: 'jsonb',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('market_observations', ['metric_type', 'entity_type', 'entity_id']);
  pgm.createIndex('market_observations', 'period');
  pgm.createIndex('market_observations', ['entity_type', 'entity_id', 'period']);

  // ============================================================================
  // TREND ANALYSIS
  // ============================================================================

  pgm.createTable('trend_analysis', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    entity_type: {
      type: 'varchar(20)',
      notNull: true,
      check: "entity_type IN ('skill', 'role')",
    },
    entity_id: {
      type: 'uuid',
      notNull: true,
    },
    entity_name: {
      type: 'varchar(255)',
      notNull: true,
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      check: "status IN ('EMERGING', 'GROWING', 'STABLE', 'DECLINING', 'HIGH_DEMAND')",
    },
    current_value: {
      type: 'decimal(12,2)',
      notNull: true,
    },
    previous_value: {
      type: 'decimal(12,2)',
      notNull: true,
    },
    change_percent: {
      type: 'decimal(6,2)',
      notNull: true,
    },
    period: {
      type: 'varchar(50)',
      notNull: true,
    },
    sample_size: {
      type: 'integer',
      notNull: true,
    },
    confidence: {
      type: 'decimal(3,2)',
      notNull: true,
      check: 'confidence >= 0 AND confidence <= 1',
    },
    calculated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('trend_analysis', ['entity_type', 'entity_id']);
  pgm.createIndex('trend_analysis', 'status');
  pgm.createIndex('trend_analysis', 'calculated_at');

  // ============================================================================
  // EMERGING SIGNALS
  // ============================================================================

  pgm.createTable('emerging_signals', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    entity_type: {
      type: 'varchar(20)',
      notNull: true,
      check: "entity_type IN ('skill', 'role')",
    },
    entity_id: {
      type: 'uuid',
      notNull: true,
    },
    entity_name: {
      type: 'varchar(255)',
      notNull: true,
    },
    growth_rate: {
      type: 'decimal(6,2)',
      notNull: true,
    },
    current_demand: {
      type: 'integer',
      notNull: true,
    },
    signal_strength: {
      type: 'decimal(3,2)',
      notNull: true,
      check: 'signal_strength >= 0 AND signal_strength <= 1',
    },
    first_seen: {
      type: 'timestamp',
      notNull: true,
    },
    detected_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('emerging_signals', ['entity_type', 'entity_id']);
  pgm.createIndex('emerging_signals', 'signal_strength');
  pgm.createIndex('emerging_signals', 'detected_at');

  // ============================================================================
  // COMPENSATION OBSERVATIONS
  // ============================================================================

  pgm.createTable('compensation_observations', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    job_id: {
      type: 'uuid',
      references: 'jobs(id)',
      onDelete: 'SET NULL',
    },
    role_id: {
      type: 'uuid',
      references: 'roles(id)',
      onDelete: 'SET NULL',
    },
    skill_ids: {
      type: 'jsonb',
      comment: 'Array of skill IDs associated with this compensation',
    },
    salary_min: {
      type: 'decimal(12,2)',
      notNull: true,
    },
    salary_max: {
      type: 'decimal(12,2)',
      notNull: true,
    },
    currency: {
      type: 'varchar(3)',
      notNull: true,
      default: 'INR',
    },
    period: {
      type: 'varchar(20)',
      notNull: true,
      default: 'annual',
    },
    experience_years: {
      type: 'integer',
    },
    location: {
      type: 'varchar(255)',
    },
    country: {
      type: 'varchar(100)',
    },
    observed_at: {
      type: 'timestamp',
      notNull: true,
    },
    confidence: {
      type: 'decimal(3,2)',
      notNull: true,
      default: 1.0,
      check: 'confidence >= 0 AND confidence <= 1',
    },
    source: {
      type: 'varchar(100)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('compensation_observations', 'role_id');
  pgm.createIndex('compensation_observations', 'country');
  pgm.createIndex('compensation_observations', 'experience_years');
  pgm.createIndex('compensation_observations', 'observed_at');

  // ============================================================================
  // FORECASTS
  // ============================================================================

  pgm.createTable('forecasts', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    forecast_type: {
      type: 'varchar(50)',
      notNull: true,
      check: "forecast_type IN ('skill_demand', 'role_demand', 'geographic_demand')",
    },
    entity_type: {
      type: 'varchar(20)',
      notNull: true,
      check: "entity_type IN ('skill', 'role', 'location')",
    },
    entity_id: {
      type: 'uuid',
      notNull: true,
    },
    entity_name: {
      type: 'varchar(255)',
      notNull: true,
    },
    current_value: {
      type: 'decimal(12,2)',
      notNull: true,
    },
    forecasted_value: {
      type: 'decimal(12,2)',
      notNull: true,
    },
    horizon: {
      type: 'integer',
      notNull: true,
      comment: 'Forecast horizon in days',
    },
    forecast_date: {
      type: 'date',
      notNull: true,
    },
    model: {
      type: 'varchar(100)',
      notNull: true,
    },
    model_version: {
      type: 'varchar(50)',
      notNull: true,
    },
    training_period: {
      type: 'varchar(100)',
      notNull: true,
    },
    sample_size: {
      type: 'integer',
      notNull: true,
    },
    confidence: {
      type: 'decimal(3,2)',
      notNull: true,
      check: 'confidence >= 0 AND confidence <= 1',
    },
    uncertainty: {
      type: 'decimal(6,2)',
    },
    generated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('forecasts', ['entity_type', 'entity_id']);
  pgm.createIndex('forecasts', 'forecast_date');
  pgm.createIndex('forecasts', 'generated_at');

  // ============================================================================
  // DATA QUALITY RECORDS
  // ============================================================================

  pgm.createTable('data_quality_records', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    check_type: {
      type: 'varchar(50)',
      notNull: true,
      check: "check_type IN ('completeness', 'validity', 'consistency', 'freshness', 'accuracy')",
    },
    entity_type: {
      type: 'varchar(20)',
      notNull: true,
      check: "entity_type IN ('job', 'skill', 'role')",
    },
    passed: {
      type: 'boolean',
      notNull: true,
    },
    score: {
      type: 'decimal(3,2)',
      notNull: true,
      check: 'score >= 0 AND score <= 1',
    },
    issues: {
      type: 'jsonb',
    },
    metadata: {
      type: 'jsonb',
    },
    checked_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });

  pgm.createIndex('data_quality_records', ['entity_type', 'check_type']);
  pgm.createIndex('data_quality_records', 'checked_at');
  pgm.createIndex('data_quality_records', 'passed');

  // ============================================================================
  // INGESTION RUNS
  // ============================================================================

  pgm.createTable('ingestion_runs', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    source: {
      type: 'varchar(100)',
      notNull: true,
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'pending',
      check: "status IN ('pending', 'running', 'completed', 'failed')",
    },
    records_ingested: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    records_processed: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    records_failed: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    records_duplicate: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    started_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('NOW()'),
    },
    completed_at: {
      type: 'timestamp',
    },
    error_message: {
      type: 'text',
    },
    metadata: {
      type: 'jsonb',
    },
  });

  pgm.createIndex('ingestion_runs', 'source');
  pgm.createIndex('ingestion_runs', 'status');
  pgm.createIndex('ingestion_runs', 'started_at');

  // ============================================================================
  // CREATE UPDATED_AT TRIGGER FUNCTION
  // ============================================================================

  pgm.createFunction(
    'update_updated_at_column',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
      replace: true,
    },
    `
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    `
  );

  // Apply trigger to tables with updated_at
  const tablesWithUpdatedAt = [
    'skills',
    'roles',
    'jobs',
    'role_skill_requirements',
    'skill_relationships',
  ];

  tablesWithUpdatedAt.forEach((table) => {
    pgm.createTrigger(table, 'update_updated_at', {
      when: 'BEFORE',
      operation: 'UPDATE',
      function: 'update_updated_at_column',
      level: 'ROW',
    });
  });
};

exports.down = (pgm) => {
  // Drop triggers
  const tablesWithUpdatedAt = [
    'skills',
    'roles',
    'jobs',
    'role_skill_requirements',
    'skill_relationships',
  ];

  tablesWithUpdatedAt.forEach((table) => {
    pgm.dropTrigger(table, 'update_updated_at', { ifExists: true });
  });

  pgm.dropFunction('update_updated_at_column', [], { ifExists: true });

  // Drop tables
  pgm.dropTable('ingestion_runs');
  pgm.dropTable('data_quality_records');
  pgm.dropTable('forecasts');
  pgm.dropTable('compensation_observations');
  pgm.dropTable('emerging_signals');
  pgm.dropTable('trend_analysis');
  pgm.dropTable('market_observations');
  pgm.dropTable('skill_relationships');
};
