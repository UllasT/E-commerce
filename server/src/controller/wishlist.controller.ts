import { DATABASE_TYPE } from "../config/db.js";
import pool from "../db/sql/index.js";
import wishlistitemSchema from "../models/wishlistitem.schema.js";








const GetWishlist = async (req: any, res: any) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized", user: req.user ,error: "User ID not found in request" });
    if (DATABASE_TYPE === 'sql') {
        try {
            const [rows]: any = await pool.execute(
                `SELECT w.id,  w.created_at, p.* 
                 FROM wishlist_items w 
                 JOIN products p ON w.product_id = p.id 
                 WHERE w.user_id = ?`,
                [userId]
            );
            res.status(200).json(rows);
        } catch (error) {
            console.error('Error fetching user wishlist:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else if (DATABASE_TYPE === 'mongodb') {
        try {
            const wishlist = await wishlistitemSchema.find({ user_id: userId }).populate('product_id').select('-__v -createdAt -updatedAt -user_id');
            res.status(200).json(wishlist);
        } catch (error) {
            console.error('Error fetching user wishlist from MongoDB:', error);
            res.status(500).json({ message: "Internal server error" });
        }   
}
}

const AddToWishlist = async (req: any, res: any) => {
    const userId = req.user?.id;
    const { productId } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized", user: req.user ,error: "User ID not found in request" });
    if (!productId) return res.status(400).json({ message: "Product ID is required" }); 
    if (DATABASE_TYPE === 'sql') {
        try {
            // check if the product is already in the wishlist
            const [existing]: any = await pool.execute('SELECT * FROM wishlist_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
            if (existing.length > 0) return res.status(400).json({ message: "Product already in wishlist" });
            await pool.execute('INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)', [userId, productId]);
            res.status(201).json({ message: "Product added to wishlist" });
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else if (DATABASE_TYPE === 'mongodb') {
        try {
            // check if the product is already in the wishlist
            const existing = await wishlistitemSchema.findOne({ user_id: userId, product_id: productId });
            if (existing) return res.status(400).json({ message: "Product already in wishlist" });
            const newItem = new wishlistitemSchema({ user_id: userId, product_id: productId });
            await newItem.save();
            res.status(201).json({ message: "Product added to wishlist" });
        } catch (error) {
            console.error('Error adding to wishlist in MongoDB:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

const RemoveFromWishlist = async (req: any, res: any) => {
    const userId = req.user?.id;
    const { id, productId } = req.params;
    if (!userId) return res.status(401).json({ message: "Unauthorized", user: req.user ,error: "User ID not found in request" });
    if (!id) return res.status(400).json({ message: "Wishlist item ID is required" });
    if (DATABASE_TYPE === 'sql') {
        try {
            const [result]: any = await pool.execute('DELETE FROM wishlist_items WHERE id = ? AND user_id = ? AND product_id = ?', [id, userId, productId]);
            if (result.affectedRows === 0) return res.status(404).json({ message: "Wishlist item not found" });
            res.status(200).json({ message: "Product removed from wishlist" });
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else if (DATABASE_TYPE === 'mongodb') {
        try {
            const result = await wishlistitemSchema.findOneAndDelete({ _id: id, user_id: userId });
            if (!result) return res.status(404).json({ message: "Wishlist item not found" });
            res.status(200).json({ message: "Product removed from wishlist" });
        } catch (error) {
            console.error('Error removing from wishlist in MongoDB:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}







export { GetWishlist, AddToWishlist, RemoveFromWishlist }









