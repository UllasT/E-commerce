import { DATABASE_TYPE } from "../config/db.js";
import pool from "../db/sql/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import usersSchema from "../models/users.schema.js";

const CreateUser = async (req: any, res: any) => {
  const { name, email, phone, password } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!phone) return res.status(400).json({ message: "Phone is required" });
  if (!password)
    return res.status(400).json({ message: "Password is required" });
  if (DATABASE_TYPE === "sql") {
    try {
      // create a sql query to insert the user into the database
      const u = await pool.execute("select * from users where email = ?", [
        email,
      ]);
      const user: any = u[0];
      if (user.length > 0) {
        if (user[0].phone === phone) {
          return res.status(400).json({ message: "Phone already exists" });
        }
        if (user[0].email === email) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }
      const query =
        "INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)";
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      if (!passwordHash) {
        return res.status(500).json({ message: "Error hashing password" });
      }
      const values = [name, email, phone, passwordHash];
      await pool.execute(query, values);
      const result = await pool.execute("select * from users where email = ?", [
        email,
      ]);
      const fullResult: any = result[0];
      const userId = fullResult[0].id;
      if (fullResult.length === 0) {
        return res.status(400).json({ message: "Error creating user" });
      }
        res.status(201).json({ message: "User created successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating user", error });
    }
  } else if (DATABASE_TYPE === "mongodb") {
    // Handle MongoDB-specific logic here
    const isEmailExist = await usersSchema.findOne({ email });
    if (isEmailExist) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const isPhoneExist = await usersSchema.findOne({ phone });
    if (isPhoneExist) {
      return res.status(400).json({ message: "Phone already exists" });
    }
   const password_hash = await bcrypt.hash(password, 10);
    const user = await usersSchema.create({
      full_name: name,
      email,
      phone,
      password_hash
    });
      if (!user) {
        return res.status(400).json({ message: "Error creating user" });
      }
      res.status(201).json({ message: "User created successfully" });

    try {
    } catch (error) {
        res.status(500).json({ message: "Error creating user MongoDB", error });
    }
  }
};




const LoginUser = async (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  if (!password)    return res.status(400).json({ message: "Password is required" });
  if (DATABASE_TYPE === "sql") {
    try {
      const result = await pool.execute("select * from users where email = ?", [
        email,
      ]);
      const fullResult: any = result[0];  
      if (fullResult.length === 0) {
        return res.status(400).json({ message: "Invalid email or password" });
      } 
      const user = fullResult[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const token = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET!, {
        expiresIn: "99h",
      }); 
      if (!token) {
        console.log("Error generating JWT token:", token);
        return res.status(500).json({ message: "Error generating JWT token" });
      } 
      await pool.execute("UPDATE users SET refresh_token = ? WHERE id = ?", [token, user.id]);
      res.status(200).json({ message: "Login successful", token });
    } catch (error: any) {
      res.status(500).json({ message: "Error logging in", error });
    }
  } else if (DATABASE_TYPE === "mongodb") {

    try {
      const user = await usersSchema.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const token = jwt.sign({ userId: user._id, email }, process.env.JWT_SECRET!, {
        expiresIn: "99h",
      });
      if (!token) {
        console.log("Error generating JWT token:", token);
        return res.status(500).json({ message: "Error generating JWT token" });
      }
      user.refresh_token = token;
      await user.save();
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in MongoDB", error });
    }
  }
}; 



const GetUser = async (req: any, res: any) => {
  const userId = req.user?.id;
  if (!userId) return res.status(400).json({ message: "User ID is required" });
  if (DATABASE_TYPE === "sql") {
    try {
      const result = await pool.execute("select id, full_name, email, phone from users where id = ?", [
        userId,
      ]);
      const fullResult: any = result[0];
      if (fullResult.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      const user = fullResult[0];
      res.status(200).json({ user });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching user", error });
    }
  } else if (DATABASE_TYPE === "mongodb") {
    // Handle MongoDB-specific logic here

    try {
      const user = await usersSchema.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user MongoDB", error });
    }
  }
};







export { CreateUser, LoginUser, GetUser };
