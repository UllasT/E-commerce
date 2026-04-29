import mysql from 'mysql2/promise'; // You can import the promise version directly
import { MYSQL_CONFIG } from '../../config/db.js';


// Create the pool directly using the promise-enabled version
const pool = mysql.createPool({
  host: MYSQL_CONFIG.host,
  user: MYSQL_CONFIG.user,
  password: MYSQL_CONFIG.password,
  database: MYSQL_CONFIG.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
