import express from 'express'
import cors from 'cors' 
import 'dotenv/config'
import DbConnectionSql from './db/index.js'
import { ConnectionMongoDB } from './db/mdb/index.js'




const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



// // Import routes
// import productRoutes from './routes/productRoutes'
// import categoryRoutes from './routes/categoryRoutes'
// import userRoutes from './routes/userRoutes'
// import orderRoutes from './routes/orderRoutes'


if (process.env.DATA_BASE_TYPE === 'sql') {
    console.log('Using SQL database');
    // Use SQL database connection and routes

try {
    DbConnectionSql().then(connection => {
        // Use the connection for queries or pass it to route handlers
        app.listen(5000, () => {
            console.log('Server is running on port 5000');
        });
    }).catch(error => {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    });
} catch (error) {
    console.error('Unexpected error during database connection:', error);
}
} else if (process.env.DATA_BASE_TYPE === 'mongodb') {
    console.log('Using MongoDB database');
    // Use MongoDB connection and routes
    try {
        ConnectionMongoDB().then(() => {
            app.listen(5000, () => {
                console.log('Server is running on port 5000');
            });
        }).catch(error => {
            console.error('Failed to connect to MongoDB:', error);
            process.exit(1);
        });
    } catch (error) {
        console.error('Unexpected error during MongoDB connection:', error);
        process.exit(1);
    }
} else {
    console.error('Invalid DATA_BASE_TYPE specified in environment variables. Please set it to either "sql" or "mongodb".');
    process.exit(1);
}
    