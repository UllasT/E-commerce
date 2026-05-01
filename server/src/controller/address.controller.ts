import { DATABASE_TYPE } from "../config/db.js";
import pool from "../db/sql/index.js";
import addressSchema from "../models/address.schema.js";

const AddAddress = async (req: any, res: any) => {
    const userId = req.user?.id;
    const { full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default } = req.body;
    
    if (!userId) return res.status(401).json({ message: "Unauthorized", error: "User ID not found in request" });
    if (!address_line1 || !city || !postal_code) return res.status(400).json({ message: "address_line1, city, and postal_code are required" });
    
    if (DATABASE_TYPE === 'sql') {
        try {
            await pool.execute(
                `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [ userId, full_name || '', phone || '', address_line1, address_line2 || null, city, state || '', postal_code, country || 'India', is_default ? 1 : 0]
            );
            res.status(201).json({ message: "Address added successfully" });
        } catch (error) {
            console.error('Error adding address:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else if (DATABASE_TYPE === 'mongodb') {
        try {
            const newAddress = new addressSchema({
                user_id: userId,
                full_name: full_name || '',
                phone: phone || '',
                address_line1,
                address_line2: address_line2 || null,
                city,
                state: state || '',
                postal_code,
                country: country || 'India',
                is_default: is_default || false
            });
            await newAddress.save();
            res.status(201).json({ message: "Address added successfully", id: newAddress._id });
        } catch (error) {
            console.error('Error adding address:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};

const GetAddresses = async (req: any, res: any) => {
    const userId = req.user?.id;
    
    if (!userId) return res.status(401).json({ message: "Unauthorized", error: "User ID not found in request" });
    
    if (DATABASE_TYPE === 'sql') {
        try {
            const [addresses]: any = await pool.execute('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [userId]);
            res.status(200).json(addresses);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else if (DATABASE_TYPE === 'mongodb') {
        try {
            const addresses = await addressSchema.find({ user_id: userId }).sort({ is_default: -1, createdAt: -1 });
            res.status(200).json(addresses);
        } catch (error) {
            console.error('Error fetching addresses from MongoDB:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};

const UpdateAddress = async (req: any, res: any) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const { full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default } = req.body;
    
    if (!userId) return res.status(401).json({ message: "Unauthorized", error: "User ID not found in request" });
    if (!id) return res.status(400).json({ message: "Address ID is required" });
    
    if (DATABASE_TYPE === 'sql') {
        try {
            const [existing]: any = await pool.execute('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
            if (existing.length === 0) return res.status(404).json({ message: "Address not found" });
            
            const updateData = {
                full_name: full_name !== undefined ? full_name : existing[0].full_name,
                phone: phone !== undefined ? phone : existing[0].phone,
                address_line1: address_line1 !== undefined ? address_line1 : existing[0].address_line1,
                address_line2: address_line2 !== undefined ? address_line2 : existing[0].address_line2,
                city: city !== undefined ? city : existing[0].city,
                state: state !== undefined ? state : existing[0].state,
                postal_code: postal_code !== undefined ? postal_code : existing[0].postal_code,
                country: country !== undefined ? country : existing[0].country,
                is_default: is_default !== undefined ? (is_default ? 1 : 0) : existing[0].is_default
            };
            
            await pool.execute(
                `UPDATE addresses SET full_name = ?, phone = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, postal_code = ?, country = ?, is_default = ? WHERE id = ? AND user_id = ?`,
                [updateData.full_name, updateData.phone, updateData.address_line1, updateData.address_line2, updateData.city, updateData.state, updateData.postal_code, updateData.country, updateData.is_default, id, userId]
            );
            res.status(200).json({ message: "Address updated successfully" });
        } catch (error) {
            console.error('Error updating address:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else if (DATABASE_TYPE === 'mongodb') {
        try {
            const updateData: any = {};
            if (full_name !== undefined) updateData.full_name = full_name;
            if (phone !== undefined) updateData.phone = phone;
            if (address_line1 !== undefined) updateData.address_line1 = address_line1;
            if (address_line2 !== undefined) updateData.address_line2 = address_line2;
            if (city !== undefined) updateData.city = city;
            if (state !== undefined) updateData.state = state;
            if (postal_code !== undefined) updateData.postal_code = postal_code;
            if (country !== undefined) updateData.country = country;
            if (is_default !== undefined) updateData.is_default = is_default;
            
            const result = await addressSchema.findOneAndUpdate(
                { _id: id, user_id: userId },
                updateData,
                { new: true }
            );
            
            if (!result) return res.status(404).json({ message: "Address not found" });
            res.status(200).json({ message: "Address updated successfully", address: result });
        } catch (error) {
            console.error('Error updating address:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};

const DeleteAddress = async (req: any, res: any) => {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) return res.status(401).json({ message: "Unauthorized", error: "User ID not found in request" });
    if (!id) return res.status(400).json({ message: "Address ID is required" });
    
    if (DATABASE_TYPE === 'sql') {
        try {
            const [result]: any = await pool.execute('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
            if (result.affectedRows === 0) return res.status(404).json({ message: "Address not found" });
            res.status(200).json({ message: "Address deleted successfully" });
        } catch (error) {
            console.error('Error deleting address:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    } else if (DATABASE_TYPE === 'mongodb') {
        try {
            const result = await addressSchema.findOneAndDelete({ _id: id, user_id: userId });
            if (!result) return res.status(404).json({ message: "Address not found" });
            res.status(200).json({ message: "Address deleted successfully" });
        } catch (error) {
            console.error('Error deleting address:', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};

export { AddAddress, GetAddresses, UpdateAddress, DeleteAddress };
