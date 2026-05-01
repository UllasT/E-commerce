import { DATABASE_TYPE } from "../config/db.js";
import pool from "../db/sql/index.js";
import categorySchema from "../models/category.schema.js";




const GetCategories = async (req: any, res: any) => {
    if (DATABASE_TYPE === "sql") {
        try {
            const result = await pool.execute("SELECT * FROM categories");
            const categories: any = result[0];
            res.status(200).json({ categories });
        } catch (error) {
            res.status(500).json({ message: "Error fetching categories", error });
        }
    } else if (DATABASE_TYPE === "mongodb") {
        try {
            const catagories = await categorySchema.find().lean();
            res.status(200).json({ catagories });
        } catch (error) {
            res.status(500).json({ message: "Error fetching categories", error });
        }
    }
}



export { GetCategories }



