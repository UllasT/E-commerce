import { error } from "node:console";
import { DATABASE_TYPE } from "../config/db.js";
import pool from "../db/sql/index.js";




const CreateProduct = async (req: any, res: any) => {
    const{ name, description, price, category_id } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!description) return res.status(400).json({ message: "Description is required" });
    if (!price) return res.status(400).json({ message: "Price is required" });
    if (!category_id) return res.status(400).json({ message: "Category ID is required" });
    const userId = req.user?.id;    
        if (!userId) return res.status(401).json({ message: "Unauthorized", user: req.user ,error: "User ID not found in request" });
    if (DATABASE_TYPE === 'sql') {
        try {
            // convert the name to a slug format (lowercase, hyphens instead of spaces, and remove special characters)
            // and check if the slug already exists in the database to ensure uniqueness 
            const slugIsExist: any = await pool.execute('SELECT slug FROM products WHERE slug = ?', [name.toLowerCase().replace(/[^a-z0-9]+/g, '-')]);
            const rows = slugIsExist[0];
            let uniqname = name;
            // Check if a product with the same name already exists
            // If it does, add a suffix or generate a unique slug to ensure uniqueness and dont retrun baderror to the user
            if (rows && rows.length > 0) {
                // Generate a unique slug by appending a timestamp or a random string
                const uniqueSuffix = Date.now();
                uniqname = `${name}-${uniqueSuffix}`;
            }
            const [result]: any = await pool.execute(
                'INSERT INTO products (name, description, price, category_id, slug) VALUES (?, ?, ?, ?, ?)',
                [name, description, price, category_id, uniqname.toLowerCase().replace(/[^a-z0-9]+/g, '-')]
            );
            res.status(201).json({ message: "Product created", productId: result.insertId });
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ message: "Internal server error" });
        }
} else if (DATABASE_TYPE === 'mongodb') {
 try {
    
 } catch (error) {
    return res.status(500).json({ message: "Error creating product in MongoDB" });
 }
}
}

const UpdateProduct = async (req: any, res: any) => {}

const DeleteProduct = async (req: any, res: any) => {}

const GetUserProducts = async (req: any, res: any) => {}

const GetProducts = async (req: any, res: any) => {}
 




export  {CreateProduct}
