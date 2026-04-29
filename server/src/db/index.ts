import pool from "./sql/index.js";



const DbConnectionSql = async () => {
  try {
    const connection = await pool.getConnection();  
    console.log("Database connection established successfully.");
    return connection;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error; // Rethrow the error after logging it
  }
};

export default DbConnectionSql;



