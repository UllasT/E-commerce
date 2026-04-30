import { DATABASE_TYPE } from "../config/db.js";
import pool from "../db/sql/index.js";
import jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";



const CreateUser = async (req: any, res: any) => {
    const { name, email, phone, password } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!phone) return res.status(400).json({ message: 'Phone is required' });
    if (!password) return res.status(400).json({ message: 'Password is required' });
    if (DATABASE_TYPE === 'sql') {
    try {
        // create a sql query to insert the user into the database
        const query = 'INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)';
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        if (!passwordHash) {
          return res.status(500).json({ message: 'Error hashing password' });
        }
        const values = [name, email, phone, passwordHash];
    await pool.execute(query, values);
       const result =  await pool.execute("select * from users where email = ?", [email]);
       const fullResult:any = result[0];
      const userId = fullResult[0].id;
      
      const token = jwt.sign({ userId, email }, process.env.JWT_SECRET!, { expiresIn: '99h' });
      if (!token){ console.log("Error generating JWT token:", token);
        return res.status(500).json({ message: 'Error generating JWT token' });
      } 
    if (result) res.status(201).json({ message: 'User created successfully', token });
    } catch (error:any) {
        res.status(500).json({ message: 'Error creating user', error });
    }
        } else if (DATABASE_TYPE === 'mongodb') {
            // Handle MongoDB-specific logic here
            try {
                
            } catch (error) {
                
            }
        } 


};

export  {
    CreateUser
};












