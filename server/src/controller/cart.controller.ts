import { DATABASE_TYPE } from "../config/db.js";
import pool from "../db/sql/index.js";
import cartitemSchema from "../models/cartitem.schema.js";


const AddToCart = async (req: any, res: any) => {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized", user: req.user ,error: "User ID not found in request" });
    if (!productId) return res.status(400).json({ message: "Product ID is required" }); 
    if (!quantity || quantity <= 0) return res.status(400).json({ message: "Quantity must be a positive number" });
    if (DATABASE_TYPE === 'sql') {
        try {
            // check if the product is already in the cart if so update the quantity i the product qty is 0 remove the product from the cart and the if the qty id greater than the stock in the product table return an  out of stock error
            const [productData]: any = await pool.execute('SELECT stock FROM products WHERE id = ?', [productId]);
            if (productData.length === 0) return res.status(404).json({ message: "Product not found" });
            const availableStock = productData[0].stock;
            
            const [existing]: any = await pool.execute('SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
            if (existing.length > 0) {
                if (quantity === 0) {
                    await pool.execute('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
                } else {
                    const newQuantity = existing[0].quantity + quantity;
                    if (newQuantity > availableStock) return res.status(400).json({ message: "Out of stock", available: availableStock });
                    await pool.execute('UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?', [quantity, userId, productId]);
                }
                return res.status(200).json({ message: "Cart updated" });
            }
            if (quantity > availableStock) return res.status(400).json({ message: "Out of stock", available: availableStock });
            await pool.execute('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, productId, quantity]);
            res.status(201).json({ message: "Product added to cart" });
        } catch (error) {
            console.error('Error adding to cart:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else if (DATABASE_TYPE === 'mongodb') {
        // MongoDB implementation would go here, similar to the wishlist controller
            try {
                // check if the product is already in the cart if so update the quantity
                const existing = await cartitemSchema.findOne({ user_id: userId, product_id: productId });
                if (existing) {
                    existing.quantity += quantity;
                    await existing.save();
                    return res.status(200).json({ message: "Cart updated" });
                }
                const newCartItem = new cartitemSchema({ user_id: userId, product_id: productId, quantity });
                await newCartItem.save();
                res.status(201).json({ message: "Product added to cart" });
            } catch (error) {
                console.error('Error adding to cart:', error);
                res.status(500).json({ message: "Internal server error" });
            }
    }
}

const GetCart = async (req: any, res: any) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized", user: req.user ,error: "User ID not found in request" });
    if (DATABASE_TYPE === 'sql') {
        try {
            const [rows]: any = await pool.execute(
                `SELECT
                    c.id AS cart_item_id,
                    c.user_id AS cart_user_id,
                    c.product_id AS cart_product_id,
                    c.quantity AS cart_quantity,
                    c.created_at AS cart_created_at,
                    p.id AS product_id,
                    p.name,
                    p.slug,
                    p.description,
                    p.price,
                    p.compare_price,
                    p.image_url,
                    p.category_id,
                    p.rating,
                    p.review_count,
                    p.stock,
                    p.featured,
                    p.created_at AS product_created_at
                 FROM cart_items c 
                 JOIN products p ON c.product_id = p.id 
                 WHERE c.user_id = ?`,
                [userId]
            );
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error fetching user cart:', error);
            res.status(500).json({ message: "Internal server error" });
        }   
    } else if (DATABASE_TYPE === 'mongodb') {
        try {
            const cartItems = await cartitemSchema.find({ user_id: userId }).populate('product_id').select('-__v -createdAt -updatedAt -user_id');
            res.status(200).json(cartItems);
        } catch (error) {
            console.error('Error fetching user cart from MongoDB:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

const RemoveFromCart = async (req: any, res: any) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "Unauthorized", user: req.user ,error: "User ID not found in request" });
    if (!id) return res.status(400).json({ message: "Cart item ID is required" });
    if (DATABASE_TYPE === 'sql') {
        try {
            const [result]: any = await pool.execute('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, userId]);
            if (result.affectedRows === 0) return res.status(404).json({ message: "Cart item not found" });
            res.status(200).json({ message: "Product removed from cart" });
        } catch (error) {
            console.error('Error removing from cart:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else if (DATABASE_TYPE === 'mongodb') {
        try {
            const result = await cartitemSchema.findOneAndDelete({ _id: id, user_id: userId });
            if (!result) return res.status(404).json({ message: "Cart item not found" });
            res.status(200).json({ message: "Product removed from cart" });
        } catch (error) {
            console.error('Error removing from cart in MongoDB:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

const UpdateCartItem = async (req: any, res: any) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const { quantity } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized", user: req.user ,error: "User ID not found in request" });
    if (!id) return res.status(400).json({ message: "Cart item ID is required" });
    if (!quantity || quantity < 1) return res.status(400).json({ message: "Quantity must be a positive number" });
    if (DATABASE_TYPE === 'sql') {
        try {
            const [result]: any = await pool.execute('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, id, userId]);
            if (result.affectedRows === 0) return res.status(404).json({ message: "Cart item not found" });
            res.status(200).json({ message: "Cart item updated" });
        } catch (error) {
            console.error('Error updating cart item:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else if (DATABASE_TYPE === 'mongodb') {
        try {
            const result = await cartitemSchema.findOneAndUpdate({ _id: id, user_id: userId }, { quantity }, { new: true });
            if (!result) return res.status(404).json({ message: "Cart item not found" });
            res.status(200).json({ message: "Cart item updated", item: result });
        } catch (error) {
            console.error('Error updating cart item in MongoDB:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export { AddToCart, GetCart, RemoveFromCart, UpdateCartItem } 






