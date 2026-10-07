// ============================================================================
// data-collection-init.ts
// Run this script to ensure all data collection tables exist and to seed
// minimal configuration entries (collection_schedule, ingestion_logs).
// ============================================================================
import { getDb } from '../database/connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function loadSchema(fileName) {
    const schemaPath = path.resolve(__dirname, '../database', fileName);
    return fs.readFileSync(schemaPath, 'utf-8');
}
async function run() {
    const db = getDb();
    console.log('Initializing data-collection tables...');
    const schemaFiles = [
        'job-collection-schema.sql', // the schema file we added earlier
    ];
    for (const file of schemaFiles) {
        const sql = loadSchema(file);
        const statements = sql.split(';').filter(Boolean);
        for (const stmt of statements) {
            const trimmed = stmt.trim();
            if (!trimmed)
                continue;
            try {
                db.exec(trimmed + ';');
                console.log(`Executed: ${file} - ${trimmed.slice(0, 30)}...`);
            }
            catch (err) {
                console.error(`Error executing statement in ${file}:`, err);
            }
        }
    }
    // Seed collection_schedule entries for known sources (if not present)
    const sources = [
        { source: 'indeed', collectorType: 'api', frequencyMinutes: 60 },
        { source: 'remoteok', collectorType: 'api', frequencyMinutes: 120 },
        { source: 'github', collectorType: 'api', frequencyMinutes: 180 },
    ];
    for (const src of sources) {
        const exists = db
            .prepare('SELECT 1 FROM collection_schedule WHERE source = ?')
            .get(src.source);
        if (!exists) {
            db.prepare(`INSERT INTO collection_schedule (source, collector_type, frequency_minutes, enabled, created_at, updated_at)
         VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))`).run(src.source, src.collectorType, src.frequencyMinutes);
            console.log(`Added schedule entry for ${src.source}`);
        }
    }
    console.log('Data collection initialization complete.');
}
run().catch(err => {
    console.error('Fatal error during init:', err);
    process.exit(1);
});
//# sourceMappingURL=data-collection-init.js.map