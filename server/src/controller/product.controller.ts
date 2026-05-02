
import { DATABASE_TYPE } from "../config/db.js";
import mongoose from 'mongoose';
import pool from "../db/sql/index.js";
import productSchema from "../models/product.schema.js";
import categorySchema from "../models/category.schema.js";




const CreateProduct = async (req: any, res: any) => {
    const{ name, description, price, category_id,stock,image_url } = req.body;
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
                'INSERT INTO products (name, description, price, category_id, slug,userid, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [name, description, price, category_id, uniqname.toLowerCase().replace(/[^a-z0-9]+/g, '-'), userId, stock, image_url || '']
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
        stock,
        image_url: image_url || ''
    });
    res.status(201).json({ message: "Product created", productId: newProduct._id });

 } catch (error) {
    return res.status(500).json({ message: "Error creating product in MongoDB",error });
 }
}
}

const UpdateProduct = async (req: any, res: any) => {
    const { id } = req.params;
    const { name, description, price, category_id, stock, image_url } = req.body;
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
                'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, stock = ?, image_url = ? WHERE id = ?',
                [name || rows[0].name, description || rows[0].description, price || rows[0].price, category_id || rows[0].category_id, stock || rows[0].stock, image_url || rows[0].image_url, id]
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
            product.image_url = image_url || product.image_url;
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

const GetProductBySlug = async (req: any, res: any) => {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ message: "Product slug is required" });
    if (DATABASE_TYPE === 'sql') {
        try {
            const [rows]: any = await pool.execute('SELECT * FROM products WHERE slug = ? LIMIT 1', [slug]);
            if (!rows || rows.length === 0) return res.status(404).json({ message: "Product not found" });
            return res.status(200).json(rows[0]);
        } catch (error) {
            console.error('Error fetching product by slug (SQL):', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    } else if (DATABASE_TYPE === 'mongodb') {
        try {
            const product = await productSchema.findOne({ slug }).lean();
            if (!product) return res.status(404).json({ message: "Product not found" });
            return res.status(200).json(product);
        } catch (error) {
            console.error('Error fetching product by slug (MongoDB):', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}
const SearchProducts = async (req: any, res: any) => {
    try {
        const {
            q,
            category_id,
            min_price,
            max_price,
            in_stock,
            page = '1',
            limit = '20',
            sort = 'newest',
        } = req.query;

        const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
        const limitNum = Math.max(1, parseInt(String(limit), 10) || 20);
        const offset = (pageNum - 1) * limitNum;

        if (DATABASE_TYPE === 'sql') {
            const where: string[] = [];
            const params: any[] = [];

            if (q) {
                where.push('(name LIKE ? OR description LIKE ? OR slug LIKE ?)');
                const like = `%${String(q).trim().replace(/%/g, '\\%')}%`;
                params.push(like, like, like);
            }

            if (category_id) {
                const categoryValue = String(category_id).trim();
                const [catRows]: any = await pool.execute(
                    'SELECT id FROM categories WHERE id = ? OR slug = ? LIMIT 1',
                    [categoryValue, categoryValue]
                );

                if (catRows && catRows.length > 0) {
                    where.push('category_id = ?');
                    params.push(catRows[0].id);
                } else {
                    // Explicit category filter provided but not found: return no products.
                    where.push('1 = 0');
                }
            }

            if (min_price) {
                where.push('price >= ?');
                params.push(Number(min_price));
            }

            if (max_price) {
                where.push('price <= ?');
                params.push(Number(max_price));
            }

            if (in_stock === 'true' || in_stock === '1') {
                where.push('stock > 0');
            }

            const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

            let orderBy = 'ORDER BY id DESC';
            if (sort === 'price_asc') orderBy = 'ORDER BY price ASC';
            else if (sort === 'price_desc') orderBy = 'ORDER BY price DESC';

            const dataQuery = `SELECT * FROM products ${whereClause} ${orderBy} LIMIT ${limitNum} OFFSET ${offset}`;
            const [rows]: any = await pool.execute(dataQuery, params);

            const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
            const [countRows]: any = await pool.execute(countQuery, params);
            const total = countRows[0]?.total ?? 0;

            return res.status(200).json({ items: rows, total, page: pageNum, limit: limitNum });
        } else if (DATABASE_TYPE === 'mongodb') {
            const filter: any = {};
            if (q) {
                const regex = new RegExp(String(q).trim(), 'i');
                filter.$or = [{ name: regex }, { description: regex }, { slug: regex }];
            }

            let resolvedCategoryId = category_id;
            if (category_id) {
                const categoryValue = String(category_id).trim();
                if (mongoose.Types.ObjectId.isValid(categoryValue)) {
                    resolvedCategoryId = categoryValue;
                } else {
                    const cat: any = await categorySchema.findOne({ slug: categoryValue }).lean();
                    if (cat) {
                        resolvedCategoryId = String(cat._id || cat.id);
                    } else {
                        resolvedCategoryId = null;
                    }
                }
            }

            if (resolvedCategoryId) filter.category_id = resolvedCategoryId;
            if (min_price || max_price) {
                filter.price = {};
                if (min_price) filter.price.$gte = Number(min_price);
                if (max_price) filter.price.$lte = Number(max_price);
            }
            if (in_stock === 'true' || in_stock === '1') filter.stock = { $gt: 0 };

            let sortObj: any = { _id: -1 };
            if (sort === 'price_asc') sortObj = { price: 1 };
            else if (sort === 'price_desc') sortObj = { price: -1 };

            const items = await productSchema.find(filter).sort(sortObj).skip(offset).limit(limitNum).lean();
            const total = await productSchema.countDocuments(filter);
            return res.status(200).json({ items, total, page: pageNum, limit: limitNum });
        }

        return res.status(500).json({ message: 'Unknown DATABASE_TYPE' });
    } catch (error) {
        console.error('SearchProducts error:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}

export { GetProductBySlug,CreateProduct, GetProductsById, GetUserProducts, DeleteProduct, UpdateProduct, SearchProducts };
