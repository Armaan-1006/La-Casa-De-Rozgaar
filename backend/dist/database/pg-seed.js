import pg from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '../config.js';
import { runPgMigrations } from './pg-migrate.js';
const { Pool } = pg;
function generateId() {
    return crypto.randomUUID();
}
export async function seedPgDatabase(connectionString) {
    const dbUrl = connectionString || config.database.url || process.env.DATABASE_URL;
    if (!dbUrl) {
        throw new Error('DATABASE_URL is not set for PostgreSQL seeding.');
    }
    // Ensure migrations are run first
    await runPgMigrations(dbUrl);
    const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });
    const client = await pool.connect();
    try {
        const userRes = await client.query('SELECT COUNT(*)::int as count FROM users');
        if (userRes.rows[0].count > 0) {
            console.log('[PG-SEED] Database already has users in Neon PostgreSQL, skipping user seed.');
            return;
        }
        console.log('[PG-SEED] Seeding demo accounts and candidate profiles into Neon PostgreSQL...');
        const passwordHash = bcrypt.hashSync('password123', 10);
        // ---- Users ----
        const adminId = generateId();
        const candidateId = generateId();
        const candidate2Id = generateId();
        const recruiterId = generateId();
        const employerAdminId = generateId();
        const workforcePlannerId = generateId();
        const insertUserSql = `INSERT INTO users (id, email, password_hash, role, email_verified) VALUES ($1, $2, $3, $4, 1)`;
        await client.query(insertUserSql, [adminId, 'admin@rozgaar.in', passwordHash, 'ADMIN']);
        await client.query(insertUserSql, [candidateId, 'rahul@example.com', passwordHash, 'CANDIDATE']);
        await client.query(insertUserSql, [candidate2Id, 'priya@example.com', passwordHash, 'CANDIDATE']);
        await client.query(insertUserSql, [recruiterId, 'recruiter@techcorp.in', passwordHash, 'RECRUITER']);
        await client.query(insertUserSql, [employerAdminId, 'hr@techcorp.in', passwordHash, 'EMPLOYER_ADMIN']);
        await client.query(insertUserSql, [workforcePlannerId, 'planner@techcorp.in', passwordHash, 'WORKFORCE_PLANNER']);
        // ---- Candidate Profiles ----
        const profileId = generateId();
        const profile2Id = generateId();
        const insertProfileSql = `
      INSERT INTO candidate_profiles (id, user_id, name, headline, bio, location, visibility, total_experience_years, target_roles, preferred_locations, employment_preferences, portfolio_links)
      VALUES ($1, $2, $3, $4, $5, $6, 'public', $7, $8, $9, $10, $11)
    `;
        await client.query(insertProfileSql, [
            profileId,
            candidateId,
            'Rahul Sharma',
            'Lead Full Stack Architect & Tech Lead',
            'Passionate developer with 4 years of experience building scalable web applications with React, TypeScript, Node.js, and SQL.',
            'Bangalore, India',
            4.0,
            JSON.stringify(['role_fullstack', 'role_frontend']),
            JSON.stringify(['Bangalore', 'Hyderabad', 'Remote']),
            JSON.stringify(['FULL_TIME', 'REMOTE']),
            JSON.stringify(['https://github.com/rahul', 'https://rahul.dev'])
        ]);
        await client.query(insertProfileSql, [
            profile2Id,
            candidate2Id,
            'Priya Patel',
            'Data Scientist | ML Engineer',
            'Data science professional with expertise in ML, Python, TensorFlow, and deep learning.',
            'Mumbai, India',
            3.5,
            JSON.stringify(['role_datascientist', 'role_mleng']),
            JSON.stringify(['Mumbai', 'Pune', 'Remote']),
            JSON.stringify(['FULL_TIME']),
            JSON.stringify(['https://github.com/priya'])
        ]);
        // ---- Candidate Skills ----
        const insertSkillSql = `
      INSERT INTO candidate_skills (id, candidate_id, skill_id, skill_name, self_reported_score, assessment_score, verified_score, confidence, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
        // Rahul's skills
        await client.query(insertSkillSql, [generateId(), profileId, 'skill_javascript', 'JavaScript', 8.0, 8.4, 8.4, 0.9, 'ASSESSMENT']);
        await client.query(insertSkillSql, [generateId(), profileId, 'skill_react', 'React', 7.5, 7.8, 7.8, 0.85, 'ASSESSMENT']);
        await client.query(insertSkillSql, [generateId(), profileId, 'skill_nodejs', 'Node.js', 7.0, 7.2, 7.2, 0.8, 'ASSESSMENT']);
        await client.query(insertSkillSql, [generateId(), profileId, 'skill_typescript', 'TypeScript', 6.5, null, null, 0.5, 'SELF_REPORTED']);
        await client.query(insertSkillSql, [generateId(), profileId, 'skill_sql', 'SQL', 7.0, 8.9, 8.9, 0.9, 'ASSESSMENT']);
        await client.query(insertSkillSql, [generateId(), profileId, 'skill_docker', 'Docker', 4.0, 4.5, null, 0.4, 'SELF_REPORTED']);
        await client.query(insertSkillSql, [generateId(), profileId, 'skill_aws', 'AWS', 3.5, null, null, 0.3, 'SELF_REPORTED']);
        await client.query(insertSkillSql, [generateId(), profileId, 'skill_rust', 'Rust', 7.5, null, null, 0.5, 'SELF_REPORTED']);
        // Priya's skills
        await client.query(insertSkillSql, [generateId(), profile2Id, 'skill_python', 'Python', 9.0, 9.2, 9.2, 0.95, 'ASSESSMENT']);
        await client.query(insertSkillSql, [generateId(), profile2Id, 'skill_ml', 'Machine Learning', 8.5, 8.1, 8.1, 0.9, 'ASSESSMENT']);
        await client.query(insertSkillSql, [generateId(), profile2Id, 'skill_tensorflow', 'TensorFlow', 7.0, null, null, 0.6, 'SELF_REPORTED']);
        await client.query(insertSkillSql, [generateId(), profile2Id, 'skill_sql', 'SQL', 7.5, 7.8, 7.8, 0.85, 'ASSESSMENT']);
        // ---- Experience ----
        const insertExpSql = `
      INSERT INTO candidate_experience (id, candidate_id, title, company, location, start_date, end_date, current, description, skills)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
        await client.query(insertExpSql, [
            generateId(), profileId, 'Senior Frontend Developer', 'TechStartup India', 'Bangalore',
            '2023-01', null, 1, 'Leading frontend development using React and TypeScript.',
            JSON.stringify(['JavaScript', 'React', 'TypeScript'])
        ]);
        await client.query(insertExpSql, [
            generateId(), profileId, 'Full Stack Developer', 'WebSolutions Pvt Ltd', 'Bangalore',
            '2021-06', '2022-12', 0, 'Built and maintained web applications using Node.js and React.',
            JSON.stringify(['JavaScript', 'React', 'Node.js', 'SQL'])
        ]);
        // ---- Education ----
        const insertEduSql = `
      INSERT INTO candidate_education (id, candidate_id, degree, institution, field, start_date, end_date, grade)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
        await client.query(insertEduSql, [
            generateId(), profileId, 'B.Tech', 'Chandigarh University', 'Computer Science', '2017', '2021', '8.5 CGPA'
        ]);
        // ---- Organizations ----
        const orgId = generateId();
        await client.query(`
      INSERT INTO organizations (id, name, industry, size, location, website, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [orgId, 'TechCorp India', 'Technology', '500-1000', 'Bangalore, India', 'https://techcorp.in', 'Leading technology solutions provider in India.']);
        await client.query(`
      INSERT INTO organization_users (id, organization_id, user_id, role)
      VALUES ($1, $2, $3, $4)
    `, [generateId(), orgId, recruiterId, 'RECRUITER']);
        await client.query(`
      INSERT INTO organization_users (id, organization_id, user_id, role)
      VALUES ($1, $2, $3, $4)
    `, [generateId(), orgId, employerAdminId, 'ADMIN']);
        await client.query(`
      INSERT INTO organization_users (id, organization_id, user_id, role)
      VALUES ($1, $2, $3, $4)
    `, [generateId(), orgId, workforcePlannerId, 'PLANNER']);
        // ---- Assessments ----
        const assessId = generateId();
        await client.query(`
      INSERT INTO assessments (id, title, description, target_role_id, skills, difficulty, duration_minutes, question_count, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
            assessId,
            'Full Stack Architecture & React Benchmark',
            'Comprehensive assessment for full stack engineers covering React, Node.js, and System Design.',
            'role_fullstack',
            JSON.stringify(['JavaScript', 'React', 'Node.js', 'SQL']),
            'INTERMEDIATE',
            45,
            3,
            adminId
        ]);
        console.log('[PG-SEED] Successfully seeded Neon PostgreSQL database!');
    }
    finally {
        client.release();
        await pool.end();
    }
}
if (process.argv[1]?.endsWith('pg-seed.ts') || process.argv[1]?.endsWith('pg-seed.js')) {
    seedPgDatabase().catch(err => {
        console.error('[PG-SEED] Seeding error:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=pg-seed.js.map