// Script to execute schema migration on Supabase
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.iypzdhfpirlskyjhrtxg:5atAAVysNHh0q4B2@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

async function runMigration() {
    const client = new Client({ connectionString });

    try {
        console.log('Connecting to Supabase...');
        await client.connect();
        console.log('Connected!');

        // Read the schema file
        const schemaPath = path.join(__dirname, '..', 'supabase_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema...');
        await client.query(schema);
        console.log('Schema executed successfully!');

        // Verify tables were created
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);

        console.log('\nTables created:');
        result.rows.forEach(row => console.log('  -', row.table_name));
        console.log(`\nTotal: ${result.rows.length} tables`);

    } catch (error) {
        console.error('Error:', error.message);
        if (error.position) {
            console.error('Position:', error.position);
        }
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
