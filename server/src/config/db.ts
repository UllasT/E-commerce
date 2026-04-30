import 'dotenv/config';


export const MYSQL_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export const DATABASE_TYPE = process.env.DATA_BASE_TYPE;
export const JWT_SECRET = process.env.JWT_SECRET;
export const MONGODB_CONFIG = {
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce',
};













