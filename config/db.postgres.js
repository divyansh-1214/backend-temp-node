const { Sequelize } = require('sequelize');
const config = require('./env');

const sequelize = new Sequelize(
  config.pg.database,
  config.pg.user,
  config.pg.password,
  {
    host: config.pg.host,
    port: config.pg.port,
    dialect: 'postgres',
    logging: config.nodeEnv === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');

    // Sync models in development only
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ PostgreSQL models synced (alter: true)');
    }
  } catch (error) {
    console.error(`❌ PostgreSQL connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectPostgres };
