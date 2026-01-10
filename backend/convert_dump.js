// Script to convert MySQL dump to PostgreSQL for Supabase
// Handles: backticks, escapes, and boolean conversions

const fs = require('fs');
const readline = require('readline');

const inputFile = '/home/x/Projects/Nene-V2/Nene-official/awqtgibq_nene_db.sql';
const outputFile = '/home/x/Projects/Nene-V2/Nene-official/supabase_full_data.sql';

// Tables and their boolean column positions (0-indexed in VALUES)
// This is the safest approach - explicitly map which columns are boolean
const booleanColumns = {
    'admin_users': [5, 8], // is_active, two_factor_enabled
    'customers': [5], // is_active
    'products': [11, 14], // is_active, is_available
    'product_images': [3], // is_primary
    'product_variations': [5], // is_available
    'discount_codes': [8], // is_active
    'reviews': [9], // is_featured
    'blog_posts': [7], // is_published
    'faqs': [5], // is_active
    'shipping_config': [3], // is_active
    'contact_messages': [5], // is_read
    'social_media_links': [5], // is_active
    'telegram_config': [3, 4, 5], // is_enabled, notify_on_purchase, notify_on_review
};

async function convertDump() {
    const fileStream = fs.createReadStream(inputFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const outStream = fs.createWriteStream(outputFile);

    const sequences = [
        'admin_users', 'customers', 'products', 'product_images', 'product_variations',
        'carts', 'cart_items', 'discount_codes', 'orders', 'order_items', 'order_status_history',
        'reviews', 'blog_posts', 'faqs', 'shipping_config', 'contact_info', 'contact_messages',
        'social_media_links', 'telegram_config'
    ];

    outStream.write('-- Full Data Migration from MySQL to PostgreSQL\n');
    outStream.write('-- Converted with boolean fixes\n\n');
    outStream.write("SET session_replication_role = 'replica';\n\n");

    let insideInsert = false;
    let currentTable = '';
    let fullStatement = '';

    for await (const line of rl) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('INSERT INTO')) {
            insideInsert = true;
            // Extract table name
            const match = trimmedLine.match(/INSERT INTO `?(\w+)`?/);
            currentTable = match ? match[1] : '';

            let converted = trimmedLine.replace(/`/g, '');
            converted = converted.split("\\'").join("''");
            fullStatement = converted;

            if (trimmedLine.endsWith(';')) {
                // Convert booleans and write
                fullStatement = convertBooleans(fullStatement, currentTable);
                outStream.write(fullStatement + '\n');
                insideInsert = false;
                fullStatement = '';
            }
        }
        else if (insideInsert) {
            let converted = trimmedLine.replace(/`/g, '');
            converted = converted.split("\\'").join("''");
            fullStatement += '\n' + converted;

            if (trimmedLine.endsWith(';')) {
                fullStatement = convertBooleans(fullStatement, currentTable);
                outStream.write(fullStatement + '\n');
                insideInsert = false;
                fullStatement = '';
            }
        }
    }

    outStream.write("\nSET session_replication_role = 'origin';\n\n");
    outStream.write('-- Reset Sequences\n');
    sequences.forEach(table => {
        outStream.write(`SELECT setval('${table}_id_seq', COALESCE((SELECT MAX(id) FROM ${table}), 1));\n`);
    });

    outStream.end();
    console.log('Conversion complete: ' + outputFile);
}

function convertBooleans(statement, tableName) {
    // Skip SequelizeMeta - it's not needed for Supabase
    if (tableName === 'SequelizeMeta') {
        return '-- Skipping SequelizeMeta (not needed for Supabase)';
    }

    const boolCols = booleanColumns[tableName];
    if (!boolCols || boolCols.length === 0) {
        return statement;
    }

    // Parse VALUES and convert 1/0 to true/false at specific positions
    // This is complex because values can contain commas inside strings
    // Simpler approach: just do global replacement for standalone 1 and 0 
    // after the VALUES keyword, being careful about context

    // For simplicity and reliability, convert specific patterns:
    // ", 1," -> ", true," and ", 0," -> ", false,"
    // ", 1)" -> ", true)" and ", 0)" -> ", false)"
    // "(1," -> "(true," and "(0," -> "(false,"

    let result = statement;

    // Handle patterns: comma-number-comma, comma-number-paren, paren-number-comma
    result = result.replace(/, 1,/g, ', true,');
    result = result.replace(/, 0,/g, ', false,');
    result = result.replace(/, 1\)/g, ', true)');
    result = result.replace(/, 0\)/g, ', false)');
    result = result.replace(/\(1,/g, '(true,');
    result = result.replace(/\(0,/g, '(false,');

    return result;
}

convertDump();
