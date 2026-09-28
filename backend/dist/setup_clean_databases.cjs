"use strict";

// backend/setup_clean_databases.ts
var import_module = require("module");
var import_meta = {};
var require2 = (0, import_module.createRequire)(import_meta.url);
var pg = require2("pg");
var bcrypt = require2("bcryptjs");
var { Pool } = pg;
function generateId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
var APPLICATION_DB_URL = "postgresql://neondb_owner:npg_GEL6hcOmqD7C@ep-morning-morning-b5yio789-pooler.c-7.us-east-2.aws.neon.tech/lacasa_application?sslmode=require";
var INTELLIGENCE_DB_URL = "postgresql://neondb_owner:npg_GEL6hcOmqD7C@ep-morning-morning-b5yio789-pooler.c-7.us-east-2.aws.neon.tech/lacasa_intelligence?sslmode=require";
async function setupApplicationDatabase() {
  console.log("=== Setting up lacasa_application database ===");
  const pool = new Pool({
    connectionString: APPLICATION_DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    console.log("[APP-DB] Creating clean schema...");
    await pool.query(`
      DROP TABLE IF EXISTS assessment_integrity_signals CASCADE;
      DROP TABLE IF EXISTS assessment_answers CASCADE;
      DROP TABLE IF EXISTS assessment_attempts CASCADE;
      DROP TABLE IF EXISTS assessment_questions CASCADE;
      DROP TABLE IF EXISTS assessments CASCADE;
      DROP TABLE IF EXISTS candidate_certifications CASCADE;
      DROP TABLE IF EXISTS candidate_education CASCADE;
      DROP TABLE IF EXISTS candidate_experience CASCADE;
      DROP TABLE IF EXISTS candidate_skills CASCADE;
      DROP TABLE IF EXISTS candidate_preferences CASCADE;
      DROP TABLE IF EXISTS target_roles CASCADE;
      DROP TABLE IF EXISTS saved_jobs CASCADE;
      DROP TABLE IF EXISTS job_matches CASCADE;
      DROP TABLE IF EXISTS job_interactions CASCADE;
      DROP TABLE IF EXISTS candidate_shortlists CASCADE;
      DROP TABLE IF EXISTS candidate_profiles CASCADE;
      DROP TABLE IF EXISTS organization_roles CASCADE;
      DROP TABLE IF EXISTS organization_users CASCADE;
      DROP TABLE IF EXISTS organizations CASCADE;
      DROP TABLE IF EXISTS career_scenarios CASCADE;
      DROP TABLE IF EXISTS learning_progress CASCADE;
      DROP TABLE IF EXISTS learning_resources CASCADE;
      DROP TABLE IF EXISTS learning_paths CASCADE;
      DROP TABLE IF EXISTS interview_reports CASCADE;
      DROP TABLE IF EXISTS interview_questions CASCADE;
      DROP TABLE IF EXISTS research_items CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS audit_log CASCADE;
      DROP TABLE IF EXISTS sessions CASCADE;
      DROP TABLE IF EXISTS talent_searches CASCADE;
      DROP TABLE IF EXISTS skill_gaps CASCADE;
      DROP TABLE IF EXISTS workforce_gaps CASCADE;
      DROP TABLE IF EXISTS workforce_plans CASCADE;
      DROP TABLE IF EXISTS workforce_profiles CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    await pool.query(`
      -- Users & Authentication
      CREATE TABLE users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'CANDIDATE',
        email_verified INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE sessions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Candidate Data
      CREATE TABLE candidate_profiles (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        headline VARCHAR(255),
        bio TEXT,
        location VARCHAR(255),
        phone VARCHAR(64),
        visibility VARCHAR(32) DEFAULT 'public',
        total_experience_years NUMERIC(4, 1) DEFAULT 0,
        target_roles TEXT DEFAULT '[]',
        preferred_locations TEXT DEFAULT '[]',
        employment_preferences TEXT DEFAULT '[]',
        portfolio_links TEXT DEFAULT '[]',
        resume_url VARCHAR(512),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE candidate_skills (
        id VARCHAR(64) PRIMARY KEY,
        candidate_id VARCHAR(64) NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        skill_id VARCHAR(64) NOT NULL,
        skill_name VARCHAR(255) NOT NULL,
        self_reported_score NUMERIC(3, 1) DEFAULT 5.0,
        assessment_score NUMERIC(3, 1),
        verified_score NUMERIC(3, 1),
        confidence NUMERIC(3, 2) DEFAULT 0.5,
        source VARCHAR(32) DEFAULT 'SELF_REPORTED',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE candidate_experience (
        id VARCHAR(64) PRIMARY KEY,
        candidate_id VARCHAR(64) NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        start_date VARCHAR(32),
        end_date VARCHAR(32),
        current INTEGER DEFAULT 0,
        description TEXT,
        skills TEXT DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE candidate_education (
        id VARCHAR(64) PRIMARY KEY,
        candidate_id VARCHAR(64) NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        degree VARCHAR(255) NOT NULL,
        institution VARCHAR(255) NOT NULL,
        field VARCHAR(255),
        start_date VARCHAR(32),
        end_date VARCHAR(32),
        grade VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE candidate_certifications (
        id VARCHAR(64) PRIMARY KEY,
        candidate_id VARCHAR(64) NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        issuer VARCHAR(255) NOT NULL,
        issued_at VARCHAR(32),
        expires_at VARCHAR(32),
        credential_id VARCHAR(255),
        credential_url VARCHAR(512),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE target_roles (
        id VARCHAR(64) PRIMARY KEY,
        candidate_id VARCHAR(64) NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        role_id VARCHAR(64) NOT NULL,
        target_date VARCHAR(32),
        readiness_score NUMERIC(4, 2) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE saved_jobs (
        id VARCHAR(64) PRIMARY KEY,
        candidate_id VARCHAR(64) NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        job_id VARCHAR(64) NOT NULL,
        notes TEXT,
        status VARCHAR(32) DEFAULT 'SAVED',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Employer & Organization Data
      CREATE TABLE organizations (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(255),
        size VARCHAR(64),
        location VARCHAR(255),
        website VARCHAR(255),
        description TEXT,
        logo_url VARCHAR(512),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE organization_users (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(32) NOT NULL DEFAULT 'RECRUITER',
        title VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE organization_roles (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        department VARCHAR(255),
        location VARCHAR(255),
        employment_type VARCHAR(32) DEFAULT 'FULL_TIME',
        status VARCHAR(32) DEFAULT 'ACTIVE',
        experience_min NUMERIC(3, 1),
        experience_max NUMERIC(3, 1),
        salary_min NUMERIC(12, 2),
        salary_max NUMERIC(12, 2),
        currency VARCHAR(8) DEFAULT 'INR',
        description TEXT,
        required_skills TEXT DEFAULT '[]',
        preferred_skills TEXT DEFAULT '[]',
        created_by VARCHAR(64) REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE candidate_shortlists (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        role_id VARCHAR(64) REFERENCES organization_roles(id) ON DELETE SET NULL,
        candidate_id VARCHAR(64) NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        status VARCHAR(32) DEFAULT 'REVIEWING',
        notes TEXT,
        rating NUMERIC(3, 1) DEFAULT 0,
        created_by VARCHAR(64) REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Career Simulation Data
      CREATE TABLE career_scenarios (
        id VARCHAR(64) PRIMARY KEY,
        candidate_id VARCHAR(64) REFERENCES candidate_profiles(id) ON DELETE SET NULL,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        target_role_id VARCHAR(64) NOT NULL,
        target_role_name VARCHAR(255) NOT NULL,
        current_role VARCHAR(255) NOT NULL,
        timeline_months INTEGER DEFAULT 6,
        investment_hours_per_week INTEGER DEFAULT 10,
        estimated_budget NUMERIC(10, 2) DEFAULT 0,
        projected_salary NUMERIC(12, 2) DEFAULT 0,
        projected_growth_pct NUMERIC(5, 2) DEFAULT 0,
        roi_multiple NUMERIC(4, 1) DEFAULT 1.0,
        bridge_skills TEXT DEFAULT '[]',
        difficulty VARCHAR(32) DEFAULT 'MODERATE',
        feasibility VARCHAR(32) DEFAULT 'HIGH',
        steps TEXT DEFAULT '[]',
        status VARCHAR(32) DEFAULT 'ACTIVE',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Assessments & Proctoring
      CREATE TABLE assessments (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target_role_id VARCHAR(64),
        skills TEXT DEFAULT '[]',
        difficulty VARCHAR(32) DEFAULT 'INTERMEDIATE',
        duration_minutes INTEGER DEFAULT 60,
        question_count INTEGER DEFAULT 10,
        rules TEXT DEFAULT '[]',
        created_by VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE assessment_questions (
        id VARCHAR(64) PRIMARY KEY,
        assessment_id VARCHAR(64) NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
        skill_id VARCHAR(64) NOT NULL,
        question_text TEXT NOT NULL,
        question_type VARCHAR(32) DEFAULT 'MULTIPLE_CHOICE',
        options TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        points INTEGER DEFAULT 10,
        difficulty VARCHAR(32) DEFAULT 'INTERMEDIATE'
      );

      CREATE TABLE assessment_attempts (
        id VARCHAR(64) PRIMARY KEY,
        assessment_id VARCHAR(64) NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
        candidate_id VARCHAR(64) NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        status VARCHAR(32) DEFAULT 'IN_PROGRESS',
        score NUMERIC(5, 2) DEFAULT 0,
        max_score NUMERIC(5, 2) DEFAULT 100,
        percentage NUMERIC(5, 2) DEFAULT 0,
        time_spent_seconds INTEGER DEFAULT 0,
        integrity_score NUMERIC(4, 2) DEFAULT 1.0,
        started_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      );

      CREATE TABLE assessment_answers (
        id VARCHAR(64) PRIMARY KEY,
        attempt_id VARCHAR(64) NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
        question_id VARCHAR(64) NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
        selected_option TEXT,
        is_correct INTEGER DEFAULT 0,
        points_awarded NUMERIC(5, 2) DEFAULT 0,
        time_spent_seconds INTEGER DEFAULT 0
      );

      CREATE TABLE assessment_integrity_signals (
        id VARCHAR(64) PRIMARY KEY,
        attempt_id VARCHAR(64) NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
        event_type VARCHAR(64) NOT NULL,
        payload TEXT,
        severity VARCHAR(32) DEFAULT 'LOW',
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );

      -- Learning & Roadmaps
      CREATE TABLE learning_paths (
        id VARCHAR(64) PRIMARY KEY,
        candidate_id VARCHAR(64) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        target_role_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(32) DEFAULT 'ACTIVE',
        estimated_weeks INTEGER DEFAULT 12,
        modules TEXT DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE learning_resources (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        provider VARCHAR(255),
        url VARCHAR(512),
        type VARCHAR(32) DEFAULT 'COURSE',
        duration_hours NUMERIC(5, 1) DEFAULT 0,
        cost NUMERIC(10, 2) DEFAULT 0,
        rating NUMERIC(3, 2) DEFAULT 4.5,
        skills TEXT DEFAULT '[]',
        difficulty VARCHAR(32) DEFAULT 'INTERMEDIATE'
      );

      CREATE TABLE learning_progress (
        id VARCHAR(64) PRIMARY KEY,
        candidate_id VARCHAR(64) NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        resource_id VARCHAR(64) NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
        status VARCHAR(32) DEFAULT 'IN_PROGRESS',
        progress_pct NUMERIC(5, 2) DEFAULT 0,
        completed_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Interview Intelligence & Research
      CREATE TABLE interview_questions (
        id VARCHAR(64) PRIMARY KEY,
        role_id VARCHAR(64) NOT NULL,
        skill_id VARCHAR(64),
        question TEXT NOT NULL,
        sample_answer TEXT,
        difficulty VARCHAR(32) DEFAULT 'INTERMEDIATE',
        key_points TEXT DEFAULT '[]',
        evaluation_criteria TEXT DEFAULT '[]'
      );

      CREATE TABLE interview_reports (
        id VARCHAR(64) PRIMARY KEY,
        candidate_id VARCHAR(64) NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
        role_id VARCHAR(64) NOT NULL,
        score NUMERIC(4, 1) DEFAULT 0,
        strengths TEXT DEFAULT '[]',
        growth_areas TEXT DEFAULT '[]',
        feedback TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE research_items (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(512) NOT NULL,
        authors TEXT DEFAULT '[]',
        abstract TEXT,
        publication_date VARCHAR(32),
        tags TEXT DEFAULT '[]',
        url VARCHAR(512),
        citations_count INTEGER DEFAULT 0,
        methodology TEXT,
        source VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Notifications & Auditing
      CREATE TABLE notifications (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        metadata TEXT DEFAULT '{}',
        link VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE audit_log (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(64) NOT NULL,
        entity_type VARCHAR(64) NOT NULL,
        entity_id VARCHAR(64),
        payload TEXT,
        ip_address VARCHAR(64),
        timestamp TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("[APP-DB] Tables created successfully. Seeding comprehensive application data...");
    const passwordHash = bcrypt.hashSync("password123", 10);
    const rahulUserId = generateId();
    const priyaUserId = generateId();
    const recruiterUserId = generateId();
    const hrUserId = generateId();
    const adminUserId = generateId();
    await pool.query(`
      INSERT INTO users (id, email, password_hash, name, role) VALUES
      ($1, 'rahul@example.com', $6, 'Rahul Sharma (Chief Architect)', 'CANDIDATE'),
      ($2, 'priya@example.com', $6, 'Priya Patel', 'CANDIDATE'),
      ($3, 'recruiter@techcorp.in', $6, 'Vikram Malhotra', 'RECRUITER'),
      ($4, 'hr@techcorp.in', $6, 'TechCorp HR Admin', 'EMPLOYER_ADMIN'),
      ($5, 'admin@rozgaar.in', $6, 'System Administrator', 'ADMIN');
    `, [rahulUserId, priyaUserId, recruiterUserId, hrUserId, adminUserId, passwordHash]);
    const rahulProfileId = generateId();
    const priyaProfileId = generateId();
    await pool.query(`
      INSERT INTO candidate_profiles (
        id, user_id, name, headline, bio, location, visibility, total_experience_years,
        target_roles, preferred_locations, employment_preferences, portfolio_links
      ) VALUES
      (
        $1, $2, 'Rahul Sharma (Chief Architect)', 'Principal AI & Full Stack Architect',
        'Lead Systems Architect specializing in real-time distributed microservices, React UI frameworks, and LLM-driven intelligence pipelines.',
        'Bangalore & San Francisco', 'public', 5.5,
        '["Principal Systems Architect", "Full Stack Lead", "AI Solutions Engineer"]',
        '["Bangalore", "Hyderabad", "Remote"]',
        '["FULL_TIME", "REMOTE"]',
        '["https://github.com/rahul", "https://rahul.dev"]'
      ),
      (
        $3, $4, 'Priya Patel', 'Lead AI/ML Specialist & Data Scientist',
        'Data science professional specializing in deep learning, transformer architectures, NLP models, and real-time labor market predictive modeling.',
        'Mumbai & Remote', 'public', 4.0,
        '["Lead Data Scientist", "Machine Learning Engineer", "AI Researcher"]',
        '["Mumbai", "Pune", "Remote"]',
        '["FULL_TIME", "REMOTE"]',
        '["https://github.com/priya", "https://priya.ai"]'
      );
    `, [rahulProfileId, rahulUserId, priyaProfileId, priyaUserId]);
    await pool.query(`
      INSERT INTO candidate_skills (id, candidate_id, skill_id, skill_name, self_reported_score, assessment_score, verified_score, confidence, source) VALUES
      ($1, $2, 'skill_react', 'React & Next.js', 9.5, 9.2, 9.2, 0.95, 'ASSESSMENT'),
      ($3, $2, 'skill_nodejs', 'Node.js & Express', 9.0, 8.8, 8.8, 0.92, 'ASSESSMENT'),
      ($4, $2, 'skill_typescript', 'TypeScript', 9.0, 9.0, 9.0, 0.94, 'ASSESSMENT'),
      ($5, $2, 'skill_sql', 'PostgreSQL & SQL', 8.5, 8.9, 8.9, 0.90, 'ASSESSMENT'),
      ($6, $2, 'skill_docker', 'Docker & Kubernetes', 8.0, 8.2, 8.2, 0.85, 'ASSESSMENT'),
      ($7, $2, 'skill_aws', 'AWS & Cloud Arch', 8.0, 7.8, 7.8, 0.82, 'ASSESSMENT'),
      ($8, $2, 'skill_ai_arch', 'LLM & AI Systems', 8.5, 8.7, 8.7, 0.88, 'ASSESSMENT'),
      ($9, $2, 'skill_sys_design', 'Distributed Systems', 9.0, 9.1, 9.1, 0.93, 'ASSESSMENT');
    `, [generateId(), rahulProfileId, generateId(), generateId(), generateId(), generateId(), generateId(), generateId(), generateId()]);
    await pool.query(`
      INSERT INTO candidate_skills (id, candidate_id, skill_id, skill_name, self_reported_score, assessment_score, verified_score, confidence, source) VALUES
      ($1, $2, 'skill_python', 'Python', 9.5, 9.4, 9.4, 0.96, 'ASSESSMENT'),
      ($3, $2, 'skill_ml', 'Machine Learning & PyTorch', 9.0, 8.9, 8.9, 0.92, 'ASSESSMENT'),
      ($4, $2, 'skill_nlp', 'NLP & Transformer Models', 8.8, 8.6, 8.6, 0.89, 'ASSESSMENT'),
      ($5, $2, 'skill_sql', 'SQL & Data Engineering', 8.2, 8.5, 8.5, 0.87, 'ASSESSMENT'),
      ($6, $2, 'skill_docker', 'MLOps & Docker', 7.8, 8.0, 8.0, 0.80, 'ASSESSMENT');
    `, [generateId(), priyaProfileId, generateId(), generateId(), generateId(), generateId()]);
    await pool.query(`
      INSERT INTO candidate_experience (id, candidate_id, title, company, location, start_date, end_date, current, description, skills) VALUES
      ($1, $2, 'Principal Full Stack Architect', 'TechCorp India / Global Labs', 'Bangalore', '2023-01', NULL, 1,
       'Leading the architecture and implementation of intelligent workforce analytics and high-throughput real-time APIs.',
       '["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"]'),
      ($3, $2, 'Senior Full Stack Engineer', 'HyperScale Systems', 'Hyderabad', '2021-06', '2022-12', 0,
       'Architected low-latency web applications and reactive frontend dashboards serving 2M+ active operatives.',
       '["JavaScript", "React", "Node.js", "Redis", "SQL"]');
    `, [generateId(), rahulProfileId, generateId()]);
    await pool.query(`
      INSERT INTO candidate_education (id, candidate_id, degree, institution, field, start_date, end_date, grade) VALUES
      ($1, $2, 'B.Tech in Computer Science & Engineering', 'Indian Institute of Technology (IIT)', 'Computer Science & AI', '2017', '2021', '9.4 CGPA');
    `, [generateId(), rahulProfileId]);
    await pool.query(`
      INSERT INTO candidate_certifications (id, candidate_id, name, issuer, issued_at, credential_id) VALUES
      ($1, $2, 'AWS Certified Solutions Architect \u2013 Professional', 'Amazon Web Services', '2023-08', 'AWS-SAP-882104'),
      ($3, $2, 'Certified Kubernetes Administrator (CKA)', 'Cloud Native Computing Foundation', '2024-02', 'CKA-99210');
    `, [generateId(), rahulProfileId, generateId()]);
    const orgId = generateId();
    await pool.query(`
      INSERT INTO organizations (id, name, industry, size, location, website, description) VALUES
      ($1, 'TechCorp India', 'Enterprise Software & Artificial Intelligence', '500-1000', 'Bangalore, India', 'https://techcorp.in',
       'Leading sovereign technology and enterprise AI platform engineering firm driving strategic workforce innovation across South Asia.');
    `, [orgId]);
    await pool.query(`
      INSERT INTO organization_users (id, organization_id, user_id, role, title) VALUES
      ($1, $2, $3, 'RECRUITER', 'Lead Technical Recruiter'),
      ($4, $2, $5, 'EMPLOYER_ADMIN', 'Chief People Officer & Talent Executive');
    `, [generateId(), orgId, recruiterUserId, generateId(), hrUserId]);
    const role1Id = generateId();
    const role2Id = generateId();
    const role3Id = generateId();
    const role4Id = generateId();
    await pool.query(`
      INSERT INTO organization_roles (
        id, organization_id, title, department, location, employment_type, status,
        experience_min, experience_max, salary_min, salary_max, currency, description,
        required_skills, preferred_skills, created_by
      ) VALUES
      (
        $1, $2, 'Principal Full Stack Architect', 'Core Engineering', 'Bangalore / Hybrid', 'FULL_TIME', 'ACTIVE',
        4.0, 9.0, 3800000, 4800000, 'INR',
        'Lead architectural strategy for next-generation intelligence web platforms. Requires deep React, Node.js, and system design expertise.',
        '["React", "Node.js", "TypeScript", "PostgreSQL", "Distributed Systems"]',
        '["Docker", "Kubernetes", "AWS"]', $3
      ),
      (
        $4, $2, 'Lead AI / MLOps Platform Engineer', 'Applied AI Systems', 'Bangalore / Remote', 'FULL_TIME', 'ACTIVE',
        3.5, 8.0, 4200000, 5500000, 'INR',
        'Design and maintain scalable ML inference pipelines, vector search clusters, and real-time fine-tuning pipelines.',
        '["Python", "PyTorch", "MLOps", "Docker", "PostgreSQL"]',
        '["Triton", "Ray", "vLLM"]', $3
      ),
      (
        $5, $2, 'Senior Distributed Systems Engineer', 'Infrastructure', 'Hyderabad', 'FULL_TIME', 'ACTIVE',
        3.0, 7.0, 3200000, 4200000, 'INR',
        'Scale microservice backends and event streams handling millions of high-concurrency requests daily.',
        '["Node.js", "Go", "Redis", "Kafka", "SQL"]',
        '["Kubernetes", "Terraform"]', $3
      ),
      (
        $6, $2, 'Cloud Solutions Architect', 'Cloud Strategy', 'Pune / Remote', 'FULL_TIME', 'ACTIVE',
        4.0, 8.0, 3500000, 4500000, 'INR',
        'Architect secure, fault-tolerant AWS cloud environments with multi-region replication and automated governance.',
        '["AWS", "Terraform", "Security", "Docker", "Networking"]',
        '["GCP", "Kubernetes"]', $3
      );
    `, [role1Id, orgId, recruiterUserId, role2Id, role3Id, role4Id]);
    await pool.query(`
      INSERT INTO candidate_shortlists (id, organization_id, role_id, candidate_id, status, notes, rating, created_by) VALUES
      ($1, $2, $3, $4, 'INTERVIEW_SCHEDULED', 'Exceptional match for Principal Architect role with 95% verified skill compatibility.', 4.9, $5),
      ($6, $2, $7, $8, 'UNDER_REVIEW', 'Strong ML and NLP background with high assessment integrity score.', 4.8, $5);
    `, [generateId(), orgId, role1Id, rahulProfileId, recruiterUserId, generateId(), role2Id, priyaProfileId]);
    await pool.query(`
      INSERT INTO career_scenarios (
        id, candidate_id, user_id, name, target_role_id, target_role_name, current_role,
        timeline_months, investment_hours_per_week, estimated_budget, projected_salary,
        projected_growth_pct, roi_multiple, bridge_skills, difficulty, feasibility, steps, status
      ) VALUES
      (
        $1, $2, $3, 'Operation Prometheus: Full Stack to Principal AI Architect',
        'role_ai_architect', 'Principal AI Systems Architect', 'Senior Full Stack Engineer',
        6, 12, 45000, 4800000, 42.5, 4.8,
        '["Distributed LLM Pipelines", "Vector Embeddings & RAG", "Model Optimization (ONNX/TensorRT)", "Kubernetes MLOps"]',
        'CHALLENGING', 'VERY_HIGH',
        '[{"phase": 1, "name": "LLM Inference Architecture", "durationWeeks": 6, "skills": ["LangChain", "Vector DBs", "FastAPI"]},
          {"phase": 2, "name": "Distributed Fine-Tuning & MLOps", "durationWeeks": 10, "skills": ["PyTorch", "Kubernetes", "Triton"]},
          {"phase": 3, "name": "Production Battle-Testing", "durationWeeks": 8, "skills": ["Benchmark Evaluation", "Security & Guardrails"]}]',
        'ACTIVE'
      ),
      (
        $4, $5, $6, 'Operation Minerva: Data Scientist to Chief MLOps Strategist',
        'role_mlops_lead', 'Chief MLOps Platform Strategist', 'Data Scientist',
        4, 10, 35000, 4200000, 36.0, 4.1,
        '["Kubernetes Cluster Orchestration", "CI/CD for Machine Learning", "Data Drift & Observability", "Multi-GPU Training"]',
        'MODERATE', 'HIGH',
        '[{"phase": 1, "name": "Cloud Native ML Infrastructure", "durationWeeks": 5, "skills": ["Kubeflow", "Docker", "Helm"]},
          {"phase": 2, "name": "Continuous Delivery Pipelines", "durationWeeks": 6, "skills": ["MLflow", "GitHub Actions", "Terraform"]},
          {"phase": 3, "name": "Enterprise Model Governance", "durationWeeks": 5, "skills": ["Model Registry", "Drift Detection"]}]',
        'ACTIVE'
      ),
      (
        $7, $2, $3, 'Operation Daedalus: Backend Engineer to Cloud Solutions Lead',
        'role_cloud_lead', 'Lead Cloud Infrastructure Architect', 'Backend Developer',
        5, 8, 25000, 3800000, 30.0, 3.6,
        '["Multi-Region AWS Architecture", "Infrastructure as Code (Terraform)", "Zero-Trust Security & Vault", "Site Reliability Engineering"]',
        'MODERATE', 'HIGH',
        '[{"phase": 1, "name": "IaC Mastery & Automation", "durationWeeks": 6, "skills": ["Terraform", "Ansible", "AWS CDK"]},
          {"phase": 2, "name": "High Availability & Disaster Recovery", "durationWeeks": 8, "skills": ["Multi-Region VPC", "DynamoDB Global", "Route53"]},
          {"phase": 3, "name": "Zero-Trust Enterprise Compliance", "durationWeeks": 6, "skills": ["AWS KMS", "HashiCorp Vault", "SOC2 Controls"]}]',
        'ACTIVE'
      );
    `, [generateId(), rahulProfileId, rahulUserId, generateId(), priyaProfileId, priyaUserId, generateId()]);
    const assessmentId = generateId();
    await pool.query(`
      INSERT INTO assessments (id, title, description, target_role_id, skills, difficulty, duration_minutes, question_count, rules, created_by) VALUES
      ($1, 'Full Stack Architecture & React Benchmark',
       'Anti-cheat proctored assessment for senior full stack engineers covering React state architectures, Node.js concurrency, and PostgreSQL indexing.',
       'role_fullstack', '["React", "Node.js", "TypeScript", "PostgreSQL", "System Design"]', 'INTERMEDIATE', 45, 4,
       '["No tab switching", "Biometric camera stream verification", "Linear progression", "Copy/paste prevention"]', $2);
    `, [assessmentId, adminUserId]);
    await pool.query(`
      INSERT INTO assessment_questions (id, assessment_id, skill_id, question_text, options, correct_answer, explanation, points, difficulty) VALUES
      ($1, $2, 'skill_react',
       'In React 18 Concurrent Mode, which hook should be utilized to defer re-rendering of a non-urgent part of the UI without blocking user input?',
       '["useDeferredValue", "useMemo", "useLayoutEffect", "useImperativeHandle"]',
       'useDeferredValue',
       'useDeferredValue lets you defer updating a part of the UI, allowing high-priority inputs (like typing) to remain responsive.',
       25, 'INTERMEDIATE'),
      ($3, $2, 'skill_nodejs',
       'Which Node.js libuv threadpool configuration parameter governs the count of background worker threads allocated for asynchronous I/O operations (such as crypto and fs)?',
       '["UV_THREADPOOL_SIZE", "NODE_WORKER_THREADS", "LIBUV_MAX_CONCURRENCY", "UV_ASYNC_POOL"]',
       'UV_THREADPOOL_SIZE',
       'UV_THREADPOOL_SIZE sets the number of threads used by libuv threadpool (default 4, max 1024).',
       25, 'INTERMEDIATE'),
      ($4, $2, 'skill_sql',
       'In PostgreSQL, which index type is most optimal for speeding up full-text search vector queries using tsvector and tsquery?',
       '["GIN (Generalized Inverted Index)", "B-Tree Index", "BRIN Index", "Hash Index"]',
       'GIN (Generalized Inverted Index)',
       'GIN indexes are ideal for full-text search (tsvector) and array containment queries because they index component elements.',
       25, 'ADVANCED'),
      ($5, $2, 'skill_sys_design',
       'Under the CAP theorem, which property pair does Amazon DynamoDB / Cassandra prioritize by default during a network partition event?',
       '["Availability & Partition Tolerance (AP)", "Consistency & Partition Tolerance (CP)", "Consistency & Availability (CA)", "Linearizability & Atomicity"]',
       'Availability & Partition Tolerance (AP)',
       'DynamoDB and Cassandra utilize decentralized replication and eventual consistency to ensure AP availability during network partitions.',
       25, 'ADVANCED');
    `, [generateId(), assessmentId, generateId(), generateId(), generateId()]);
    await pool.query(`
      INSERT INTO research_items (id, title, authors, abstract, publication_date, tags, url, citations_count, methodology, source) VALUES
      ($1, 'Quantifying the ROI of Skill-Based Workforce Mobility in Generative AI Paradigms',
       '["Prof. Sergio Marquina", "Dr. Vikram Malhotra", "La Casa Intelligence Lab"]',
       'An empirical study tracking 14,000 technology operatives over 3 years demonstrating a 4.2x ROI when transitioning traditional developers to AI platform architects via structured skill verification.',
       '2026-03', '["AI Economics", "Workforce Mobility", "Skill Gaps", "Human Capital"]',
       'https://lacasaderozgaar.com/research/roi-skill-mobility-2026.pdf', 342,
       'Longitudinal empirical cohort tracking and dynamic macroeconomic regression analysis.',
       'La Casa De Rozgaar Intelligence Unit'),
      ($2, 'Zero-Trust Proctoring and Biometric Verification in Remote Technical Assessments',
       '["Dr. Vikram Malhotra", "AI Ethics Council"]',
       'Analyzing the false-positive reduction rate of multi-signal MediaPipe face tracking and keystroke latency modeling in non-invasive online technical certifications.',
       '2026-01', '["Assessment Integrity", "Computer Vision", "Zero-Trust", "Proctoring"]',
       'https://lacasaderozgaar.com/research/zero-trust-proctoring.pdf', 189,
       'Controlled double-blind evaluation across 2,500 proctored technical evaluations.',
       'Journal of Applied Computing & Workforce Assessment');
    `, [generateId(), generateId()]);
    await pool.query(`
      INSERT INTO notifications (id, user_id, type, title, message, read, link) VALUES
      ($1, $2, 'SYSTEM', 'Welcome to La Casa De Rozgaar HQ', 'Your candidate clearance has been generated with verified Level 5 capability scores.', 0, '#/candidate-dossier'),
      ($3, $2, 'MATCH', 'High Match Alert: Principal Full Stack Architect', 'TechCorp India posted a role with 95% skill alignment to your verified radar.', 0, '#/job-finder'),
      ($4, $5, 'TALENT', 'New Candidate Shortlist Created', 'Rahul Sharma has been shortlisted for Principal Full Stack Architect requisition.', 0, '#/talent-vault');
    `, [generateId(), rahulUserId, generateId(), generateId(), recruiterUserId]);
    console.log("[APP-DB] lacasa_application database setup and seeding complete!");
  } catch (err) {
    console.error("[APP-DB] Setup error:", err);
    throw err;
  } finally {
    await pool.end();
  }
}
async function cleanIntelligenceDatabase() {
  console.log("=== Cleaning lacasa_intelligence database ===");
  const pool = new Pool({
    connectionString: INTELLIGENCE_DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await pool.query(`
      DROP TABLE IF EXISTS assessment_integrity_signals CASCADE;
      DROP TABLE IF EXISTS assessment_answers CASCADE;
      DROP TABLE IF EXISTS assessment_attempts CASCADE;
      DROP TABLE IF EXISTS assessment_questions CASCADE;
      DROP TABLE IF EXISTS assessments CASCADE;
      DROP TABLE IF EXISTS candidate_certifications CASCADE;
      DROP TABLE IF EXISTS candidate_education CASCADE;
      DROP TABLE IF EXISTS candidate_experience CASCADE;
      DROP TABLE IF EXISTS candidate_skills CASCADE;
      DROP TABLE IF EXISTS candidate_preferences CASCADE;
      DROP TABLE IF EXISTS target_roles CASCADE;
      DROP TABLE IF EXISTS saved_jobs CASCADE;
      DROP TABLE IF EXISTS job_matches CASCADE;
      DROP TABLE IF EXISTS job_interactions CASCADE;
      DROP TABLE IF EXISTS candidate_shortlists CASCADE;
      DROP TABLE IF EXISTS candidate_profiles CASCADE;
      DROP TABLE IF EXISTS organization_roles CASCADE;
      DROP TABLE IF EXISTS organization_users CASCADE;
      DROP TABLE IF EXISTS organizations CASCADE;
      DROP TABLE IF EXISTS career_scenarios CASCADE;
      DROP TABLE IF EXISTS learning_progress CASCADE;
      DROP TABLE IF EXISTS learning_resources CASCADE;
      DROP TABLE IF EXISTS learning_paths CASCADE;
      DROP TABLE IF EXISTS interview_reports CASCADE;
      DROP TABLE IF EXISTS interview_questions CASCADE;
      DROP TABLE IF EXISTS research_items CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS audit_log CASCADE;
      DROP TABLE IF EXISTS sessions CASCADE;
      DROP TABLE IF EXISTS talent_searches CASCADE;
      DROP TABLE IF EXISTS skill_gaps CASCADE;
      DROP TABLE IF EXISTS workforce_gaps CASCADE;
      DROP TABLE IF EXISTS workforce_plans CASCADE;
      DROP TABLE IF EXISTS workforce_profiles CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
    console.log("[INTEL-DB] Remaining pure intelligence tables in lacasa_intelligence (" + tables.rows.length + "):", tables.rows.map((r) => r.table_name));
  } catch (err) {
    console.error("[INTEL-DB] Cleanup error:", err);
    throw err;
  } finally {
    await pool.end();
  }
}
(async () => {
  try {
    await setupApplicationDatabase();
    await cleanIntelligenceDatabase();
    console.log("=== All Database Setup Completed Successfully! ===");
    process.exit(0);
  } catch (err) {
    console.error("Fatal error during DB setup:", err);
    process.exit(1);
  }
})();
