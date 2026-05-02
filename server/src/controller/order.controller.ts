import { DATABASE_TYPE } from "../config/db.js";
import pool from "../db/sql/index.js";
import Order from "../models/order.schema.js";
import OrderItem from "../models/orderitem.schema.js";
import cartitemSchema from "../models/cartitem.schema.js";
import productSchema from "../models/product.schema.js";

const CreateOrder = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { items, shipping_address, payment_method } = req.body;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ message: "Items are required" });

  if (DATABASE_TYPE === 'sql') {
    let conn: any;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      // calculate total and validate products
      let total = 0;
      for (const it of items) {
        const [rows]: any = await conn.execute('SELECT id, name, image_url, price, stock FROM products WHERE id = ?', [it.product_id]);
        if (!rows || rows.length === 0) return res.status(404).json({ message: `Product ${it.product_id} not found` });
        const p = rows[0];
        const qty = Number(it.quantity) || 1;
        if (qty > p.stock) return res.status(400).json({ message: 'Out of stock', available: p.stock });
        total += Number(p.price) * qty;
        // normalize item fields for insertion
        it.price = Number(p.price);
        it.product_name = p.name;
        it.product_image = p.image_url;
      }

      const orderNumber = `ORD-${Date.now()}`;

      await conn.execute(
        `INSERT INTO orders (user_id, order_number, status, total_amount, shipping_address, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, orderNumber, 'pending', total, JSON.stringify(shipping_address || {}), payment_method || 'cod', 'pending']
      );

      const [orderRows]: any = await conn.execute('SELECT id FROM orders WHERE order_number = ? AND user_id = ? LIMIT 1', [orderNumber, userId]);
      const orderId = orderRows[0]?.id;
      if (!orderId) throw { status: 500, message: 'Failed to resolve created order id' };

      for (const it of items) {
        await conn.execute(
          `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity) VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, it.product_id, it.product_name || '', it.product_image || null, it.price, it.quantity || 1]
        );
      }
    //   get the cart id and delete the cart items for the user
      await conn.execute('DELETE FROM cart_items WHERE user_id = ?', [userId])

      await conn.commit();
      res.status(201).json({ message: 'Order created', id: orderId, order_number: orderNumber, total });
    } catch (error: any) {
      if (conn) await conn.rollback();
      console.error('Error creating order:', error);
      if (error?.status) return res.status(error.status).json({ message: error.message, available: error.available });
      res.status(500).json({ message: 'Internal server error' });
    } finally {
      if (conn) conn.release();
    }
  } else if (DATABASE_TYPE === 'mongodb') {
    try {
      // validate products and compute total
      let total = 0;
      const validatedItems: any[] = [];
      for (const it of items) {
       
        const prod = await productSchema.findById(it.product_id).lean();
        if (!prod) return res.status(404).json({ message: `Product ${it.product_id} not found` });
        const qty = Number(it.quantity) || 1;
        if (qty > (prod.stock || 0)) return res.status(400).json({ message: 'Out of stock', available: prod.stock });
        total += (prod.price || 0) * qty;
        validatedItems.push({ product_id: prod._id, product_name: prod.name, product_image: prod.image_url || null, price: prod.price || 0, quantity: qty });
      }

      const order = new Order({ user_id: userId, order_number: `ORD-${Date.now()}`, status: 'pending', total_amount: total, shipping_address: shipping_address || {}, payment_method: payment_method || 'cod', payment_status: 'pending' });
      await order.save();

      const createdItems = [];
      for (const it of validatedItems) {
        const oi = new OrderItem({ order_id: order._id, product_id: it.product_id, product_name: it.product_name, product_image: it.product_image, price: it.price, quantity: it.quantity });
        await oi.save();
        createdItems.push(oi);
      }

      await cartitemSchema.deleteMany({ user_id: userId });

      res.status(201).json({ message: 'Order created', id: order._id, order_number: order.order_number, total: order.total_amount, items: createdItems });
    } catch (error) {
      console.error('Error creating MongoDB order:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

const GetOrders = async (req: any, res: any) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  if (DATABASE_TYPE === 'sql') {
    try {
      const [orders]: any = await pool.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
      // fetch items per order
      for (const o of orders) {
        const [items]: any = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
        o.items = items;
      }
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (DATABASE_TYPE === 'mongodb') {
    try {
      const orders:any = await Order.find({ user_id: userId }).sort({ createdAt: -1 }).lean();
      for (const o  of orders) {
        const items = await OrderItem.find({ order_id: o._id }).lean();
        o.items = items;
      }
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching MongoDB orders:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

const GetOrderById = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!id) return res.status(400).json({ message: 'Order ID is required' });

  if (DATABASE_TYPE === 'sql') {
    try {
      const [orders]: any = await pool.execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId]);
      if (!orders || orders.length === 0) return res.status(404).json({ message: 'Order not found' });
      const order = orders[0];
      const [items]: any = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
      res.status(200).json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (DATABASE_TYPE === 'mongodb') {
    try {
      const order:any = await Order.findOne({ _id: id, user_id: userId }).lean();
      if (!order) return res.status(404).json({ message: 'Order not found' });
      const items = await OrderItem.find({ order_id: order._id }).lean();
      order.items = items;
      res.status(200).json(order);
    } catch (error) {
      console.error('Error fetching MongoDB order:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

const UpdateOrder = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { status, payment_status } = req.body;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!id) return res.status(400).json({ message: 'Order ID is required' });

  if (DATABASE_TYPE === 'sql') {
    try {
      const [existing]: any = await pool.execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId]);
      if (!existing || existing.length === 0) return res.status(404).json({ message: 'Order not found' });
      await pool.execute('UPDATE orders SET status = ?, payment_status = ? WHERE id = ? AND user_id = ?', [status || existing[0].status, payment_status || existing[0].payment_status, id, userId]);
      res.status(200).json({ message: 'Order updated' });
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (DATABASE_TYPE === 'mongodb') {
    try {
      const updated = await Order.findOneAndUpdate({ _id: id, user_id: userId }, { ...(status !== undefined ? { status } : {}), ...(payment_status !== undefined ? { payment_status } : {}) }, { new: true });
      if (!updated) return res.status(404).json({ message: 'Order not found' });
      res.status(200).json({ message: 'Order updated', order: updated });
    } catch (error) {
      console.error('Error updating MongoDB order:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

const CancelOrder = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!id) return res.status(400).json({ message: 'Order ID is required' });

  if (DATABASE_TYPE === 'sql') {
    try {
      const [result]: any = await pool.execute('UPDATE orders SET status = ? WHERE id = ? AND user_id = ?', ['cancelled', id, userId]);
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Order not found' });
      res.status(200).json({ message: 'Order cancelled' });
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (DATABASE_TYPE === 'mongodb') {
    try {
      const updated = await Order.findOneAndUpdate({ _id: id, user_id: userId }, { status: 'cancelled' }, { new: true });
      if (!updated) return res.status(404).json({ message: 'Order not found' });
      res.status(200).json({ message: 'Order cancelled', order: updated });
    } catch (error) {
      console.error('Error cancelling MongoDB order:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export { CreateOrder, GetOrders, GetOrderById, UpdateOrder, CancelOrder };
