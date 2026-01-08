const { Sequelize } = require('sequelize');
const config = require('./config/database');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        logging: false
    }
);

async function fixMigrations() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        // Insert the migration that is failing because it's already done
        await sequelize.query("INSERT INTO SequelizeMeta (name) VALUES ('20231203000000-create-customer-and-cart-tables.js')");

        console.log('Fixed migration history.');
    } catch (error) {
        if (error.original && error.original.code === 'ER_DUP_ENTRY') {
            console.log('Migration already in history.');
        } else {
            console.error('Error:', error);
        }
    } finally {
        await sequelize.close();
    }
}

fixMigrations();
