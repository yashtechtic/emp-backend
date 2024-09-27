export default () => ({
  SERVICE_NAME: 'notification',
  ERROR_LOG_PATH: process.env.ERROR_LOG_PATH,
  DEBUG_LOG_PATH: process.env.DEBUG_LOG_PATH,

  REDIS: {
    HOST: process.env.REDIS_HOST,
    PORT: process.env.REDIS_PORT,
    USER: process.env.REDIS_USER,
    PASS: process.env.REDIS_PASSWORD,
  },
  MYSQL_DB: {
    HOST: process.env.DB_HOST,
    PORT: process.env.DB_PORT,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASS,
    DBNAME: process.env.DB_NAME,
  },
});
