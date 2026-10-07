// ============================================================================
// SKILL EXTRACTOR
// Extracts and normalizes skills from job descriptions using NLP
// ============================================================================
export class SkillExtractor {
    // Common tech skills dictionary (expandable)
    SKILL_KEYWORDS = new Set([
        // Languages
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby',
        'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Shell', 'Bash', 'PowerShell',
        // Frontend
        'React', 'Angular', 'Vue.js', 'Svelte', 'Next.js', 'Nuxt.js', 'HTML5', 'CSS3', 'SASS', 'LESS',
        'Tailwind CSS', 'Bootstrap', 'Material UI', 'Redux', 'MobX', 'Webpack', 'Vite', 'jQuery',
        // Backend
        'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET',
        'Ruby on Rails', 'Laravel', 'Symfony', 'Gin', 'Fiber', 'Actix',
        // Databases
        'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB',
        'Oracle', 'SQL Server', 'MariaDB', 'SQLite', 'Neo4j', 'CouchDB', 'Firebase',
        // Cloud & DevOps
        'AWS', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible',
        'Jenkins', 'GitLab CI', 'GitHub Actions', 'CircleCI', 'Travis CI', 'ArgoCD', 'Helm',
        // AI/ML
        'TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras', 'Pandas', 'NumPy', 'OpenCV', 'Hugging Face',
        'LangChain', 'LLM', 'GPT', 'BERT', 'Transformers', 'Computer Vision', 'NLP', 'Deep Learning',
        'Machine Learning', 'Data Science', 'Neural Networks',
        // Data Engineering
        'Apache Spark', 'Apache Kafka', 'Apache Airflow', 'Apache Flink', 'Hadoop', 'Hive',
        'Databricks', 'Snowflake', 'BigQuery', 'Redshift', 'ETL', 'Data Pipelines',
        // Mobile
        'React Native', 'Flutter', 'iOS', 'Android', 'Xcode', 'Android Studio', 'SwiftUI',
        // Tools & Platforms
        'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence', 'Slack', 'VS Code',
        'IntelliJ', 'Eclipse', 'Postman', 'Swagger', 'GraphQL', 'REST API', 'gRPC', 'WebSocket',
        // Testing
        'Jest', 'Mocha', 'Chai', 'Cypress', 'Selenium', 'Playwright', 'JUnit', 'PyTest',
        'TestNG', 'Cucumber', 'Postman', 'k6', 'JMeter',
        // Methodologies
        'Agile', 'Scrum', 'Kanban', 'CI/CD', 'TDD', 'BDD', 'Microservices', 'Serverless',
        'DevOps', 'SRE', 'System Design', 'Architecture',
        // Security
        'OAuth', 'JWT', 'SSL/TLS', 'Authentication', 'Authorization', 'Encryption', 'OWASP',
        'Penetration Testing', 'Security Auditing',
        // Other
        'Linux', 'Unix', 'Windows Server', 'Networking', 'DNS', 'Load Balancing', 'CDN',
        'Nginx', 'Apache', 'Message Queue', 'WebRTC', 'Blockchain', 'Web3', 'Smart Contracts',
    ]);
    // Patterns that indicate required vs preferred skills
    REQUIRED_PATTERNS = [
        /\brequired\b/i,
        /\bmust have\b/i,
        /\bessential\b/i,
        /\bmandatory\b/i,
        /\bnecessary\b/i,
        /\bminimum\b/i,
    ];
    PREFERRED_PATTERNS = [
        /\bpreferred\b/i,
        /\bnice to have\b/i,
        /\bbonus\b/i,
        /\bplus\b/i,
        /\bdesirable\b/i,
        /\badvantageous\b/i,
    ];
    /**
     * Extract skills from job description
     */
    extractSkills(description, requirements) {
        const combinedText = [description, requirements].filter(Boolean).join('\n\n');
        // Method 1: Keyword matching
        const keywordSkills = this.extractByKeywords(combinedText);
        // Method 2: Pattern matching for context
        const contextSkills = this.extractByContext(combinedText);
        // Combine and deduplicate
        const allSkills = [...new Set([...keywordSkills, ...contextSkills])];
        // Classify as required or preferred
        const { required, preferred } = this.classifySkills(allSkills, combinedText);
        // Calculate confidence
        const confidence = this.calculateConfidence(allSkills, combinedText);
        return {
            skills: allSkills,
            requiredSkills: required,
            preferredSkills: preferred,
            confidence,
            method: 'hybrid',
        };
    }
    /**
     * Extract skills by matching against known keywords
     */
    extractByKeywords(text) {
        const found = [];
        const lowerText = text.toLowerCase();
        for (const skill of this.SKILL_KEYWORDS) {
            const lowerSkill = skill.toLowerCase();
            // Check for exact word boundaries
            const regex = new RegExp(`\\b${this.escapeRegex(lowerSkill)}\\b`, 'i');
            if (regex.test(lowerText)) {
                found.push(skill);
            }
        }
        return found;
    }
    /**
     * Extract skills using contextual patterns
     */
    extractByContext(text) {
        const found = [];
        // Pattern: "experience with X, Y, and Z"
        const experiencePattern = /experience (?:with|in|using)\s+([^.!?\n]+)/gi;
        const matches = text.matchAll(experiencePattern);
        for (const match of matches) {
            const segment = match[1];
            const skills = this.parseSkillList(segment);
            found.push(...skills);
        }
        // Pattern: "proficient in X"
        const proficientPattern = /proficient (?:in|with)\s+([^.!?\n]+)/gi;
        const profMatches = text.matchAll(proficientPattern);
        for (const match of profMatches) {
            const segment = match[1];
            const skills = this.parseSkillList(segment);
            found.push(...skills);
        }
        // Pattern: "knowledge of X"
        const knowledgePattern = /knowledge of\s+([^.!?\n]+)/gi;
        const knowMatches = text.matchAll(knowledgePattern);
        for (const match of knowMatches) {
            const segment = match[1];
            const skills = this.parseSkillList(segment);
            found.push(...skills);
        }
        return [...new Set(found)];
    }
    /**
     * Parse comma/and separated skill list
     */
    parseSkillList(segment) {
        const skills = [];
        // Split by commas, 'and', 'or'
        const parts = segment.split(/[,]|(?:\s+and\s+)|(?:\s+or\s+)/i);
        for (const part of parts) {
            const cleaned = part.trim().replace(/[()[\]]/g, '');
            // Check if it matches a known skill
            for (const skill of this.SKILL_KEYWORDS) {
                if (cleaned.toLowerCase().includes(skill.toLowerCase())) {
                    skills.push(skill);
                    break;
                }
            }
        }
        return skills;
    }
    /**
     * Classify skills as required or preferred
     */
    classifySkills(skills, text) {
        const required = [];
        const preferred = [];
        // Split text into sections
        const sections = text.split(/\n{2,}/);
        for (const skill of skills) {
            let isRequired = false;
            let isPreferred = false;
            // Find which section mentions this skill
            for (const section of sections) {
                const lowerSection = section.toLowerCase();
                const lowerSkill = skill.toLowerCase();
                if (!lowerSection.includes(lowerSkill))
                    continue;
                // Check for required indicators
                for (const pattern of this.REQUIRED_PATTERNS) {
                    if (pattern.test(section)) {
                        isRequired = true;
                        break;
                    }
                }
                // Check for preferred indicators
                for (const pattern of this.PREFERRED_PATTERNS) {
                    if (pattern.test(section)) {
                        isPreferred = true;
                        break;
                    }
                }
            }
            if (isRequired) {
                required.push(skill);
            }
            else if (isPreferred) {
                preferred.push(skill);
            }
            else {
                // Default to required if context unclear
                required.push(skill);
            }
        }
        return { required, preferred };
    }
    /**
     * Calculate extraction confidence (0-1)
     */
    calculateConfidence(skills, text) {
        if (skills.length === 0)
            return 0;
        let confidence = 0.7; // Base confidence
        // Boost if we found many skills
        if (skills.length >= 5)
            confidence += 0.1;
        if (skills.length >= 10)
            confidence += 0.1;
        // Boost if text has clear structure
        if (text.includes('Requirements:') || text.includes('Qualifications:')) {
            confidence += 0.1;
        }
        return Math.min(1.0, confidence);
    }
    /**
     * Escape regex special characters
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    /**
     * Add custom skill to dictionary
     */
    addSkill(skill) {
        this.SKILL_KEYWORDS.add(skill);
    }
    /**
     * Get all known skills
     */
    getKnownSkills() {
        return Array.from(this.SKILL_KEYWORDS).sort();
    }
}
//# sourceMappingURL=skill-extractor.js.map