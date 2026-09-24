import { getDb } from './connection.js';
import { generateId } from './connection.js';
import { runMigrations } from './migrate.js';
import bcrypt from 'bcryptjs';

export function seedDatabase(): void {
  const db = getDb();
  runMigrations();

  // Check if already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    console.log('[SEED] Database already seeded, skipping');
    return;
  }

  console.log('[SEED] Seeding database...');

  const passwordHash = bcrypt.hashSync('password123', 10);

  // ---- Users ----
  const adminId = generateId();
  const candidateId = generateId();
  const candidate2Id = generateId();
  const recruiterId = generateId();
  const employerAdminId = generateId();
  const workforcePlannerId = generateId();

  const insertUser = db.prepare(`INSERT INTO users (id, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, 1)`);
  insertUser.run(adminId, 'admin@rozgaar.in', passwordHash, 'ADMIN');
  insertUser.run(candidateId, 'rahul@example.com', passwordHash, 'CANDIDATE');
  insertUser.run(candidate2Id, 'priya@example.com', passwordHash, 'CANDIDATE');
  insertUser.run(recruiterId, 'recruiter@techcorp.in', passwordHash, 'RECRUITER');
  insertUser.run(employerAdminId, 'hr@techcorp.in', passwordHash, 'EMPLOYER_ADMIN');
  insertUser.run(workforcePlannerId, 'planner@techcorp.in', passwordHash, 'WORKFORCE_PLANNER');

  // ---- Candidate Profiles ----
  const profileId = generateId();
  const profile2Id = generateId();
  const insertProfile = db.prepare(`
    INSERT INTO candidate_profiles (id, user_id, name, headline, bio, location, visibility, total_experience_years, target_roles, preferred_locations, employment_preferences, portfolio_links)
    VALUES (?, ?, ?, ?, ?, ?, 'public', ?, ?, ?, ?, ?)
  `);
  insertProfile.run(profileId, candidateId, 'Rahul Sharma', 'Full Stack Developer | React & Node.js',
    'Passionate developer with 4 years of experience building scalable web applications.',
    'Bangalore, India',
    4.0,
    JSON.stringify(['role_fullstack', 'role_frontend']),
    JSON.stringify(['Bangalore', 'Hyderabad', 'Remote']),
    JSON.stringify(['FULL_TIME', 'REMOTE']),
    JSON.stringify(['https://github.com/rahul', 'https://rahul.dev'])
  );
  insertProfile.run(profile2Id, candidate2Id, 'Priya Patel', 'Data Scientist | ML Engineer',
    'Data science professional with expertise in ML, Python, and deep learning.',
    'Mumbai, India',
    3.5,
    JSON.stringify(['role_datascientist', 'role_mleng']),
    JSON.stringify(['Mumbai', 'Pune', 'Remote']),
    JSON.stringify(['FULL_TIME']),
    JSON.stringify(['https://github.com/priya'])
  );

  // ---- Candidate Skills ----
  const insertSkill = db.prepare(`
    INSERT INTO candidate_skills (id, candidate_id, skill_id, skill_name, self_reported_score, assessment_score, verified_score, confidence, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  // Rahul's skills
  insertSkill.run(generateId(), profileId, 'skill_javascript', 'JavaScript', 8.0, 8.4, 8.4, 0.9, 'ASSESSMENT');
  insertSkill.run(generateId(), profileId, 'skill_react', 'React', 7.5, 7.8, 7.8, 0.85, 'ASSESSMENT');
  insertSkill.run(generateId(), profileId, 'skill_nodejs', 'Node.js', 7.0, 7.2, 7.2, 0.8, 'ASSESSMENT');
  insertSkill.run(generateId(), profileId, 'skill_typescript', 'TypeScript', 6.5, null, null, 0.5, 'SELF_REPORTED');
  insertSkill.run(generateId(), profileId, 'skill_sql', 'SQL', 7.0, 8.9, 8.9, 0.9, 'ASSESSMENT');
  insertSkill.run(generateId(), profileId, 'skill_docker', 'Docker', 4.0, 4.5, null, 0.4, 'SELF_REPORTED');
  insertSkill.run(generateId(), profileId, 'skill_aws', 'AWS', 3.5, null, null, 0.3, 'SELF_REPORTED');

  // Priya's skills
  insertSkill.run(generateId(), profile2Id, 'skill_python', 'Python', 9.0, 9.2, 9.2, 0.95, 'ASSESSMENT');
  insertSkill.run(generateId(), profile2Id, 'skill_ml', 'Machine Learning', 8.5, 8.1, 8.1, 0.9, 'ASSESSMENT');
  insertSkill.run(generateId(), profile2Id, 'skill_tensorflow', 'TensorFlow', 7.0, null, null, 0.6, 'SELF_REPORTED');
  insertSkill.run(generateId(), profile2Id, 'skill_sql', 'SQL', 7.5, 7.8, 7.8, 0.85, 'ASSESSMENT');

  // ---- Experience ----
  const insertExp = db.prepare(`
    INSERT INTO candidate_experience (id, candidate_id, title, company, location, start_date, end_date, current, description, skills)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertExp.run(generateId(), profileId, 'Senior Frontend Developer', 'TechStartup India', 'Bangalore',
    '2023-01', null, 1, 'Leading frontend development using React and TypeScript.',
    JSON.stringify(['JavaScript', 'React', 'TypeScript']));
  insertExp.run(generateId(), profileId, 'Full Stack Developer', 'WebSolutions Pvt Ltd', 'Bangalore',
    '2021-06', '2022-12', 0, 'Built and maintained web applications using Node.js and React.',
    JSON.stringify(['JavaScript', 'React', 'Node.js', 'SQL']));

  // ---- Education ----
  const insertEdu = db.prepare(`
    INSERT INTO candidate_education (id, candidate_id, degree, institution, field, start_date, end_date, grade)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertEdu.run(generateId(), profileId, 'B.Tech', 'Chandigarh University', 'Computer Science', '2017', '2021', '8.5 CGPA');

  // ---- Certifications ----
  const insertCert = db.prepare(`
    INSERT INTO candidate_certifications (id, candidate_id, name, issuer, issued_at, credential_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertCert.run(generateId(), profileId, 'AWS Cloud Practitioner', 'Amazon Web Services', '2023-06', 'AWS-CP-001');

  // ---- Assessments ----
  const assessmentId = generateId();
  const assessment2Id = generateId();
  db.prepare(`
    INSERT INTO assessments (id, title, description, target_role_id, skills, difficulty, duration_minutes, question_count, rules)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(assessmentId, 'Full Stack Developer Assessment',
    'Comprehensive assessment for Full Stack Developer role covering JavaScript, React, Node.js, SQL, and system design.',
    'role_fullstack',
    JSON.stringify(['skill_javascript', 'skill_react', 'skill_nodejs', 'skill_sql', 'skill_docker']),
    'INTERMEDIATE', 90, 10,
    JSON.stringify(['No tab switching', 'Fullscreen required', 'No external resources']));

  db.prepare(`
    INSERT INTO assessments (id, title, description, target_role_id, skills, difficulty, duration_minutes, question_count, rules)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(assessment2Id, 'Data Science Fundamentals',
    'Assessment covering Python, ML concepts, statistics, and data analysis.',
    'role_datascientist',
    JSON.stringify(['skill_python', 'skill_ml', 'skill_sql']),
    'INTERMEDIATE', 60, 8,
    JSON.stringify(['No tab switching', 'Fullscreen required']));

  // ---- Assessment Questions ----
  const insertQ = db.prepare(`
    INSERT INTO assessment_questions (id, assessment_id, type, text, options, correct_answers, skill_ids, difficulty, points, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Full Stack questions
  insertQ.run(generateId(), assessmentId, 'MCQ',
    'What is the output of: console.log(typeof null)?',
    JSON.stringify(['"null"', '"undefined"', '"object"', '"boolean"']),
    JSON.stringify(['"object"']),
    JSON.stringify(['skill_javascript']), 3, 1, 1);

  insertQ.run(generateId(), assessmentId, 'MCQ',
    'In React, what hook is used for side effects?',
    JSON.stringify(['useState', 'useEffect', 'useContext', 'useMemo']),
    JSON.stringify(['useEffect']),
    JSON.stringify(['skill_react']), 2, 1, 2);

  insertQ.run(generateId(), assessmentId, 'MULTIPLE_ANSWER',
    'Which of the following are valid HTTP methods?',
    JSON.stringify(['GET', 'POST', 'SEND', 'PATCH', 'REMOVE', 'DELETE']),
    JSON.stringify(['GET', 'POST', 'PATCH', 'DELETE']),
    JSON.stringify(['skill_nodejs']), 3, 1, 3);

  insertQ.run(generateId(), assessmentId, 'MCQ',
    'What SQL clause is used to filter groups?',
    JSON.stringify(['WHERE', 'HAVING', 'FILTER', 'GROUP_FILTER']),
    JSON.stringify(['HAVING']),
    JSON.stringify(['skill_sql']), 3, 1, 4);

  insertQ.run(generateId(), assessmentId, 'SCENARIO',
    'You need to deploy a Node.js application with a PostgreSQL database. Describe a Docker Compose setup that would support this architecture, including health checks and restart policies.',
    JSON.stringify([]),
    JSON.stringify([]),
    JSON.stringify(['skill_docker', 'skill_nodejs']), 7, 2, 5);

  insertQ.run(generateId(), assessmentId, 'MCQ',
    'What does the "use strict" directive do in JavaScript?',
    JSON.stringify(['Enables ES6 features', 'Enforces stricter parsing and error handling', 'Improves performance', 'Enables TypeScript mode']),
    JSON.stringify(['Enforces stricter parsing and error handling']),
    JSON.stringify(['skill_javascript']), 2, 1, 6);

  insertQ.run(generateId(), assessmentId, 'MCQ',
    'In React, what is the purpose of the key prop in lists?',
    JSON.stringify(['Styling', 'Security', 'Reconciliation performance', 'Data binding']),
    JSON.stringify(['Reconciliation performance']),
    JSON.stringify(['skill_react']), 3, 1, 7);

  insertQ.run(generateId(), assessmentId, 'MCQ',
    'Which Node.js module is used for file system operations?',
    JSON.stringify(['http', 'fs', 'path', 'os']),
    JSON.stringify(['fs']),
    JSON.stringify(['skill_nodejs']), 2, 1, 8);

  insertQ.run(generateId(), assessmentId, 'MCQ',
    'What is the difference between INNER JOIN and LEFT JOIN?',
    JSON.stringify(['No difference', 'LEFT JOIN includes unmatched rows from the left table', 'INNER JOIN includes all rows', 'LEFT JOIN is faster']),
    JSON.stringify(['LEFT JOIN includes unmatched rows from the left table']),
    JSON.stringify(['skill_sql']), 3, 1, 9);

  insertQ.run(generateId(), assessmentId, 'MCQ',
    'What Docker command is used to build an image from a Dockerfile?',
    JSON.stringify(['docker run', 'docker build', 'docker create', 'docker compile']),
    JSON.stringify(['docker build']),
    JSON.stringify(['skill_docker']), 2, 1, 10);

  // ---- Organizations ----
  const orgId = generateId();
  db.prepare(`INSERT INTO organizations (id, name, industry, size, location) VALUES (?, ?, ?, ?, ?)`).run(
    orgId, 'TechCorp India', 'Technology', '500-1000', 'Bangalore, India'
  );

  db.prepare(`INSERT INTO organization_users (id, organization_id, user_id, role) VALUES (?, ?, ?, ?)`).run(
    generateId(), orgId, recruiterId, 'RECRUITER');
  db.prepare(`INSERT INTO organization_users (id, organization_id, user_id, role) VALUES (?, ?, ?, ?)`).run(
    generateId(), orgId, employerAdminId, 'ADMIN');
  db.prepare(`INSERT INTO organization_users (id, organization_id, user_id, role) VALUES (?, ?, ?, ?)`).run(
    generateId(), orgId, workforcePlannerId, 'WORKFORCE_PLANNER');

  // ---- Learning Resources ----
  const insertResource = db.prepare(`
    INSERT INTO learning_resources (id, title, type, url, provider, skill_ids, role_ids, difficulty, estimated_duration_hours, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertResource.run(generateId(), 'Docker for Developers', 'COURSE', 'https://example.com/docker-course', 'Udemy',
    JSON.stringify(['skill_docker']), JSON.stringify(['role_fullstack', 'role_devops']), 'BEGINNER', 12, 'CURATED');
  insertResource.run(generateId(), 'AWS Solutions Architect', 'COURSE', 'https://example.com/aws-sa', 'AWS',
    JSON.stringify(['skill_aws']), JSON.stringify(['role_fullstack', 'role_devops']), 'INTERMEDIATE', 40, 'CURATED');
  insertResource.run(generateId(), 'Advanced TypeScript Patterns', 'TUTORIAL', 'https://example.com/ts-patterns', 'Frontend Masters',
    JSON.stringify(['skill_typescript']), JSON.stringify(['role_fullstack', 'role_frontend']), 'ADVANCED', 8, 'CURATED');
  insertResource.run(generateId(), 'React Performance Optimization', 'VIDEO', 'https://example.com/react-perf', 'YouTube',
    JSON.stringify(['skill_react']), JSON.stringify(['role_frontend', 'role_fullstack']), 'ADVANCED', 3, 'CURATED');
  insertResource.run(generateId(), 'Build a REST API with Node.js', 'PROJECT', 'https://example.com/node-api-project', 'freeCodeCamp',
    JSON.stringify(['skill_nodejs', 'skill_javascript']), JSON.stringify(['role_fullstack', 'role_backend']), 'INTERMEDIATE', 6, 'CURATED');
  insertResource.run(generateId(), 'Python for Data Science Masterclass', 'COURSE', 'https://example.com/python-ds', 'Coursera',
    JSON.stringify(['skill_python', 'skill_ml']), JSON.stringify(['role_datascientist']), 'INTERMEDIATE', 30, 'CURATED');
  insertResource.run(generateId(), 'TensorFlow Developer Certificate Prep', 'COURSE', 'https://example.com/tf-cert', 'Google',
    JSON.stringify(['skill_tensorflow', 'skill_ml']), JSON.stringify(['role_mleng']), 'ADVANCED', 25, 'CURATED');

  // ---- Interview Questions ----
  const insertIQ = db.prepare(`
    INSERT INTO interview_questions (id, company, role_id, question, topic, difficulty, type, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertIQ.run(generateId(), 'Google', 'role_fullstack', 'Design a URL shortening service like bit.ly', 'System Design', 'HARD', 'SYSTEM_DESIGN', 'REPORTED');
  insertIQ.run(generateId(), 'Amazon', 'role_fullstack', 'Implement a function to find the longest palindromic substring', 'Algorithms', 'MEDIUM', 'CODING', 'REPORTED');
  insertIQ.run(generateId(), 'Microsoft', 'role_fullstack', 'What is the event loop in Node.js? Explain its phases.', 'Node.js', 'MEDIUM', 'TECHNICAL', 'REPORTED');
  insertIQ.run(generateId(), 'Flipkart', 'role_fullstack', 'Tell me about a time you handled a production incident', 'Leadership', 'MEDIUM', 'BEHAVIORAL', 'REPORTED');
  insertIQ.run(generateId(), 'Google', 'role_datascientist', 'Explain the bias-variance tradeoff', 'Machine Learning', 'MEDIUM', 'TECHNICAL', 'REPORTED');

  // ---- Research Items ----
  const insertResearch = db.prepare(`
    INSERT INTO research_items (id, title, authors, abstract, summary, published_at, source, original_url, topics, skill_ids, role_ids, type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertResearch.run(generateId(), 'Attention Is All You Need',
    JSON.stringify(['Vaswani et al.']),
    'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.',
    'Introduced the Transformer architecture which revolutionized NLP and led to models like BERT and GPT.',
    '2017-06-12', 'arXiv', 'https://arxiv.org/abs/1706.03762',
    JSON.stringify(['NLP', 'Deep Learning', 'Transformers']),
    JSON.stringify(['skill_ml', 'skill_tensorflow']),
    JSON.stringify(['role_datascientist', 'role_mleng']),
    'ORIGINAL_PAPER');
  insertResearch.run(generateId(), 'The State of JavaScript 2025',
    JSON.stringify(['Survey Contributors']),
    'Annual survey of JavaScript ecosystem trends, frameworks, and developer preferences.',
    'React continues to lead frameworks; TypeScript adoption at 85%; Bun gaining traction.',
    '2025-12-01', 'stateofjs.com', 'https://stateofjs.com/2025',
    JSON.stringify(['JavaScript', 'Web Development', 'Frameworks']),
    JSON.stringify(['skill_javascript', 'skill_react', 'skill_typescript']),
    JSON.stringify(['role_fullstack', 'role_frontend']),
    'INDUSTRY_ARTICLE');

  // ---- Workforce Profiles ----
  const insertWP = db.prepare(`
    INSERT OR REPLACE INTO workforce_profiles (id, organization_id, department, role_id, employee_count, current_skills, target_skills, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertWP.run(
    'wf_eng_fullstack',
    orgId,
    'Engineering',
    'role_fullstack',
    25,
    JSON.stringify([
      { skillId: 'skill_javascript', averageScore: 7.2, coverage: 0.9 },
      { skillId: 'skill_react', averageScore: 6.5, coverage: 0.8 },
      { skillId: 'skill_nodejs', averageScore: 5.8, coverage: 0.6 },
      { skillId: 'skill_typescript', averageScore: 4.2, coverage: 0.4 },
      { skillId: 'skill_docker', averageScore: 3.5, coverage: 0.3 },
      { skillId: 'skill_aws', averageScore: 3.0, coverage: 0.25 },
    ]),
    JSON.stringify([
      { skillId: 'skill_javascript', targetScore: 8.0 },
      { skillId: 'skill_react', targetScore: 8.0 },
      { skillId: 'skill_nodejs', targetScore: 7.5 },
      { skillId: 'skill_typescript', targetScore: 7.5 },
      { skillId: 'skill_docker', targetScore: 7.0 },
      { skillId: 'skill_aws', targetScore: 7.0 },
    ]),
    employerAdminId
  );

  console.log('[SEED] Database seeded successfully');
  console.log('[SEED] Test accounts:');
  console.log('  admin@rozgaar.in / password123 (ADMIN)');
  console.log('  rahul@example.com / password123 (CANDIDATE)');
  console.log('  priya@example.com / password123 (CANDIDATE)');
  console.log('  recruiter@techcorp.in / password123 (RECRUITER)');
  console.log('  hr@techcorp.in / password123 (EMPLOYER_ADMIN)');
  console.log('  planner@techcorp.in / password123 (WORKFORCE_PLANNER)');
}

// CLI entry point
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  try {
    seedDatabase();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
