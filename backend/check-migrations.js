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

async function checkMigrations() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');
        const [results] = await sequelize.query('SELECT * FROM SequelizeMeta');
        console.log('Executed migrations:', results.map(r => r.name));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkMigrations();
