const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'blockchain_app',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('[SUCCESS] PostgreSQL database connected successfully');

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('[SUCCESS] Database models synchronized');
  } catch (error) {
    console.error('[ERROR] Unable to connect to database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
