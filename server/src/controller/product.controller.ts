
import { DATABASE_TYPE } from "../config/db.js";
import pool from "../db/sql/index.js";
import productSchema from "../models/product.schema.js";




const CreateProduct = async (req: any, res: any) => {
    const{ name, description, price, category_id,stock } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!description) return res.status(400).json({ message: "Description is required" });
    if (!price) return res.status(400).json({ message: "Price is required" });
    if (!category_id) return res.status(400).json({ message: "Category ID is required" });
    if (!stock) return res.status(400).json({ message: "Stock is required" });
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
                'INSERT INTO products (name, description, price, category_id, slug,userid, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [name, description, price, category_id, uniqname.toLowerCase().replace(/[^a-z0-9]+/g, '-'), userId, stock]
            );
            res.status(201).json({ message: "Product created", productId: result.insertId });
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ message: "Internal server error" });
        }
} else if (DATABASE_TYPE === 'mongodb') {
 try {
    const isSlugExist = await productSchema.findOne({ slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
   let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (isSlugExist) {
        const uniqueSuffix = Date.now();
       
        slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + uniqueSuffix;
    }
    const newProduct =  await productSchema.create({
        name,
        description,
        price,
        category_id,
        slug,
        userid: userId,
        stock
    });
    res.status(201).json({ message: "Product created", productId: newProduct._id });

 } catch (error) {
    return res.status(500).json({ message: "Error creating product in MongoDB",error });
 }
}
}

const UpdateProduct = async (req: any, res: any) => {
    const { id } = req.params;
    const { name, description, price, category_id, stock } = req.body;
    if (!id) return res.status(400).json({ message: "Product ID is required" });
    if (DATABASE_TYPE === 'sql') {
        try {
            // Check if the product exists
            const [rows]: any = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
            if (rows.length === 0) return res.status(404).json({ message: "Product not found" });
            // Update the product
            console.log('====================================');
            console.log(rows);
            console.log('====================================');
            await pool.execute(
                'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, stock = ? WHERE id = ?',
                [name || rows[0].name, description || rows[0].description, price || rows[0].price, category_id || rows[0].category_id, stock || rows[0].stock,   id]
            );
            res.status(200).json({ message: "Product updated" });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else if (DATABASE_TYPE === 'mongodb') {
        try {
            const product = await productSchema.findById(id);
            if (!product) return res.status(404).json({ message: "Product not found" });
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.category_id = category_id || product.category_id;
            product.stock = stock || product.stock; 
            await product.save();
            res.status(200).json({ message: "Product updated" });
        } catch (error) {
            console.error('Error updating product in MongoDB:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

const DeleteProduct = async (req: any, res: any) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Product ID is required" });
    if (DATABASE_TYPE === 'sql') {
        try {
            const [result]: any = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
            if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
            res.status(200).json({ message: "Product deleted" });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else if (DATABASE_TYPE === 'mongodb') {
        try {
            const result = await productSchema.findByIdAndDelete(id);
            if (!result) return res.status(404).json({ message: "Product not found" });
            res.status(200).json({ message: "Product deleted" });
        } catch (error) {
            console.error('Error deleting product from MongoDB:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

const GetUserProducts = async (req: any, res: any) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized", user: req.user ,error: "User ID not found in request" });
    if (DATABASE_TYPE === 'sql') {
        try {
            const [rows]: any = await pool.execute('SELECT * FROM products WHERE userid = ?', [userId]);
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error fetching user products:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else if (DATABASE_TYPE === 'mongodb') {
        try {
            const products = await productSchema.find({ userid: userId });
            res.status(200).json(products);
        } catch (error) {
            console.error('Error fetching user products from MongoDB:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

const GetProductsById = async (req: any, res: any) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Product ID is required" });
    if (DATABASE_TYPE === 'sql') {
        try {
            const [rows]: any = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
            if (rows.length === 0) return res.status(404).json({ message: "Product not found" });
            res.status(200).json(rows[0]);
        } catch (error) {
            console.error('Error fetching product:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else if (DATABASE_TYPE === 'mongodb') {
        try {
            const product = await productSchema.findById(id);
            if (!product) return res.status(404).json({ message: "Product not found" });
            res.status(200).json(product);
        } catch (error) {
            console.error('Error fetching product from MongoDB:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
 




export  {CreateProduct, GetProductsById, GetUserProducts,DeleteProduct, UpdateProduct}
