import pg from 'pg';
import { config } from '../config.js';
const { Pool } = pg;
export async function runPgMigrations(connectionString) {
    const dbUrl = connectionString || config.database.url || process.env.DATABASE_URL;
    if (!dbUrl) {
        throw new Error('DATABASE_URL is not set for PostgreSQL migration.');
    }
    const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });
    const client = await pool.connect();
    try {
        console.log('[PG-MIGRATE] Running Module 2 migrations on Neon PostgreSQL...');
        await client.query(`
      -- ============================================================
      -- USERS & AUTH
      -- ============================================================
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'CANDIDATE',
        email_verified INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        refresh_token TEXT UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        revoked INTEGER NOT NULL DEFAULT 0
      );

      -- ============================================================
      -- CANDIDATE PROFILES
      -- ============================================================
      CREATE TABLE IF NOT EXISTS candidate_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        headline TEXT,
        bio TEXT,
        location TEXT,
        phone TEXT,
        visibility TEXT NOT NULL DEFAULT 'public',
        total_experience_years REAL NOT NULL DEFAULT 0,
        target_roles TEXT NOT NULL DEFAULT '[]',
        preferred_locations TEXT NOT NULL DEFAULT '[]',
        employment_preferences TEXT NOT NULL DEFAULT '[]',
        portfolio_links TEXT NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS candidate_skills (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        skill_id TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        self_reported_score REAL,
        assessment_score REAL,
        verified_score REAL,
        confidence REAL NOT NULL DEFAULT 0,
        last_assessed_at TIMESTAMPTZ,
        source TEXT NOT NULL DEFAULT 'SELF_REPORTED',
        UNIQUE(candidate_id, skill_id)
      );

      CREATE TABLE IF NOT EXISTS candidate_experience (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT,
        current INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        skills TEXT NOT NULL DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS candidate_education (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        degree TEXT NOT NULL,
        institution TEXT NOT NULL,
        field TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        current INTEGER NOT NULL DEFAULT 0,
        grade TEXT
      );

      CREATE TABLE IF NOT EXISTS candidate_certifications (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        issuer TEXT NOT NULL,
        issued_at TEXT NOT NULL,
        expires_at TEXT,
        credential_id TEXT,
        url TEXT
      );

      CREATE TABLE IF NOT EXISTS candidate_preferences (
        id TEXT PRIMARY KEY,
        candidate_id TEXT UNIQUE NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        remote_preference TEXT DEFAULT 'ANY',
        salary_expectation_min REAL,
        salary_expectation_max REAL,
        salary_currency TEXT DEFAULT 'INR',
        notice_period_days INTEGER,
        willing_to_relocate INTEGER DEFAULT 1,
        preferred_company_sizes TEXT NOT NULL DEFAULT '[]',
        preferred_industries TEXT NOT NULL DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS target_roles (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        role_id TEXT NOT NULL,
        role_name TEXT NOT NULL,
        priority INTEGER NOT NULL DEFAULT 1,
        added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- ============================================================
      -- ASSESSMENTS
      -- ============================================================
      CREATE TABLE IF NOT EXISTS assessments (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        target_role_id TEXT,
        skills TEXT NOT NULL DEFAULT '[]',
        difficulty TEXT NOT NULL DEFAULT 'INTERMEDIATE',
        duration_minutes INTEGER NOT NULL DEFAULT 60,
        question_count INTEGER NOT NULL DEFAULT 0,
        rules TEXT NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_by TEXT REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS assessment_questions (
        id TEXT PRIMARY KEY,
        assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
        type TEXT NOT NULL DEFAULT 'MCQ',
        text TEXT NOT NULL,
        options TEXT NOT NULL DEFAULT '[]',
        correct_answers TEXT NOT NULL DEFAULT '[]',
        skill_ids TEXT NOT NULL DEFAULT '[]',
        difficulty REAL NOT NULL DEFAULT 5,
        points REAL NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS assessment_attempts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        submitted_at TIMESTAMPTZ,
        status TEXT NOT NULL DEFAULT 'CREATED',
        score REAL,
        skill_scores TEXT,
        integrity_summary TEXT
      );

      CREATE TABLE IF NOT EXISTS assessment_answers (
        id TEXT PRIMARY KEY,
        attempt_id TEXT NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
        question_id TEXT NOT NULL REFERENCES assessment_questions(id),
        answer TEXT NOT NULL,
        is_correct INTEGER,
        score REAL,
        answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS assessment_integrity_signals (
        id TEXT PRIMARY KEY,
        attempt_id TEXT NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata TEXT,
        severity TEXT NOT NULL DEFAULT 'LOW',
        source TEXT NOT NULL DEFAULT 'CLIENT'
      );

      -- ============================================================
      -- SKILL GAPS & MATCHING
      -- ============================================================
      CREATE TABLE IF NOT EXISTS skill_gaps (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        role_id TEXT NOT NULL,
        skill_id TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        current_score REAL NOT NULL,
        required_score REAL NOT NULL,
        gap REAL NOT NULL,
        priority TEXT NOT NULL DEFAULT 'MEDIUM',
        market_demand REAL NOT NULL DEFAULT 0,
        reason TEXT,
        calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS job_matches (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        job_id TEXT NOT NULL,
        overall_match REAL NOT NULL,
        skill_match REAL NOT NULL,
        experience_match REAL NOT NULL,
        role_match REAL NOT NULL,
        location_match REAL NOT NULL,
        matched_skills TEXT NOT NULL DEFAULT '[]',
        missing_skills TEXT NOT NULL DEFAULT '[]',
        explanation TEXT,
        calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS saved_jobs (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        job_id TEXT NOT NULL,
        saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        notes TEXT,
        UNIQUE(candidate_id, job_id)
      );

      CREATE TABLE IF NOT EXISTS job_interactions (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        job_id TEXT NOT NULL,
        interaction_type TEXT NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata TEXT
      );

      -- ============================================================
      -- CAREER SCENARIOS / SIMULATION
      -- ============================================================
      CREATE TABLE IF NOT EXISTS career_scenarios (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        target_role_id TEXT NOT NULL,
        skill_changes TEXT NOT NULL DEFAULT '[]',
        result TEXT NOT NULL DEFAULT '{}',
        model_version TEXT NOT NULL DEFAULT '1.0',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- ============================================================
      -- LEARNING
      -- ============================================================
      CREATE TABLE IF NOT EXISTS learning_resources (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'COURSE',
        url TEXT NOT NULL,
        provider TEXT NOT NULL,
        skill_ids TEXT NOT NULL DEFAULT '[]',
        role_ids TEXT NOT NULL DEFAULT '[]',
        difficulty TEXT NOT NULL DEFAULT 'INTERMEDIATE',
        estimated_duration_hours REAL NOT NULL DEFAULT 1,
        source TEXT NOT NULL DEFAULT 'CURATED',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS learning_paths (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        target_role_id TEXT NOT NULL,
        resources TEXT NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS learning_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        resource_id TEXT NOT NULL REFERENCES learning_resources(id),
        status TEXT NOT NULL DEFAULT 'NOT_STARTED',
        progress REAL NOT NULL DEFAULT 0,
        time_spent_minutes INTEGER NOT NULL DEFAULT 0,
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        UNIQUE(user_id, resource_id)
      );

      -- ============================================================
      -- INTERVIEW INTELLIGENCE
      -- ============================================================
      CREATE TABLE IF NOT EXISTS interview_questions (
        id TEXT PRIMARY KEY,
        company TEXT NOT NULL,
        role_id TEXT NOT NULL,
        question TEXT NOT NULL,
        topic TEXT NOT NULL,
        difficulty TEXT NOT NULL DEFAULT 'MEDIUM',
        type TEXT NOT NULL DEFAULT 'TECHNICAL',
        reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        source TEXT NOT NULL DEFAULT 'REPORTED',
        reported_by TEXT REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS interview_reports (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company TEXT NOT NULL,
        role_id TEXT NOT NULL,
        experience_summary TEXT,
        difficulty TEXT,
        topics TEXT NOT NULL DEFAULT '[]',
        outcome TEXT,
        reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- ============================================================
      -- RESEARCH INTELLIGENCE
      -- ============================================================
      CREATE TABLE IF NOT EXISTS research_items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        authors TEXT NOT NULL DEFAULT '[]',
        abstract TEXT,
        summary TEXT,
        published_at TEXT,
        source TEXT NOT NULL,
        original_url TEXT,
        topics TEXT NOT NULL DEFAULT '[]',
        skill_ids TEXT NOT NULL DEFAULT '[]',
        role_ids TEXT NOT NULL DEFAULT '[]',
        type TEXT NOT NULL DEFAULT 'INDUSTRY_ARTICLE',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- ============================================================
      -- ORGANIZATIONS / EMPLOYER
      -- ============================================================
      CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        industry TEXT,
        size TEXT,
        location TEXT,
        website TEXT,
        description TEXT,
        logo_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS organization_users (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'VIEWER',
        added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(organization_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS organization_roles (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        role_id TEXT NOT NULL,
        role_name TEXT NOT NULL,
        requirements TEXT NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS talent_searches (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        searched_by TEXT NOT NULL REFERENCES users(id),
        query TEXT NOT NULL DEFAULT '{}',
        result_count INTEGER NOT NULL DEFAULT 0,
        searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS candidate_shortlists (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        candidate_id TEXT NOT NULL REFERENCES candidate_profiles(id),
        status TEXT NOT NULL DEFAULT 'DISCOVERED',
        notes TEXT,
        recruiter_id TEXT REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(organization_id, candidate_id)
      );

      -- ============================================================
      -- WORKFORCE
      -- ============================================================
      CREATE TABLE IF NOT EXISTS workforce_profiles (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        department TEXT NOT NULL,
        role_id TEXT NOT NULL,
        employee_count INTEGER NOT NULL DEFAULT 1,
        current_skills TEXT NOT NULL DEFAULT '[]',
        target_skills TEXT NOT NULL DEFAULT '[]',
        employee_ref TEXT,
        skills TEXT DEFAULT '[]',
        role TEXT,
        experience_years REAL DEFAULT 0,
        location TEXT,
        metadata TEXT NOT NULL DEFAULT '{}',
        created_by TEXT REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS workforce_gaps (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
        skill_id TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        current_avg REAL NOT NULL DEFAULT 0,
        target_score REAL NOT NULL DEFAULT 0,
        gap REAL NOT NULL DEFAULT 0,
        coverage REAL NOT NULL DEFAULT 0,
        impacted_employees INTEGER NOT NULL DEFAULT 0,
        priority TEXT NOT NULL,
        analysis_data TEXT NOT NULL DEFAULT '{}',
        calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS workforce_plans (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        target_roles TEXT NOT NULL DEFAULT '[]',
        future_skills TEXT NOT NULL DEFAULT '[]',
        demand_horizon TEXT NOT NULL DEFAULT '12m',
        current_capability TEXT NOT NULL DEFAULT '{}',
        gaps TEXT NOT NULL DEFAULT '{}',
        hiring_requirements TEXT NOT NULL DEFAULT '[]',
        development_requirements TEXT NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_by TEXT REFERENCES users(id)
      );

      -- ============================================================
      -- NOTIFICATIONS & AUDIT
      -- ============================================================
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        read INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        metadata TEXT,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ip_address TEXT
      );

      -- ============================================================
      -- INDEXES
      -- ============================================================
      CREATE INDEX IF NOT EXISTS idx_m2_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_m2_sessions_user ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_m2_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_m2_candidate_profiles_user ON candidate_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_m2_candidate_skills_candidate ON candidate_skills(candidate_id);
      CREATE INDEX IF NOT EXISTS idx_m2_assessment_attempts_user ON assessment_attempts(user_id);
      CREATE INDEX IF NOT EXISTS idx_m2_assessment_attempts_assessment ON assessment_attempts(assessment_id);
      CREATE INDEX IF NOT EXISTS idx_m2_skill_gaps_candidate ON skill_gaps(candidate_id);
    `);
        console.log('[PG-MIGRATE] Migrations successfully executed on Neon PostgreSQL!');
    }
    finally {
        client.release();
        await pool.end();
    }
}
if (process.argv[1]?.endsWith('pg-migrate.ts') || process.argv[1]?.endsWith('pg-migrate.js')) {
    runPgMigrations().catch(err => {
        console.error('[PG-MIGRATE] Migration error:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=pg-migrate.js.map