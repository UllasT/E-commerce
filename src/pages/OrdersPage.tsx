import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Order, OrderItem } from '../types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<(Order & { order_items: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false })
        .then(({ data }) => {
          setOrders((data as (Order & { order_items: OrderItem[] })[]) ?? []);
          setLoading(false);
        });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="page container">
        <div className="empty-state">
          <Package size={48} />
          <h2>Please sign in</h2>
          <p>You need to be logged in to view your orders</p>
          <Link to="/login" className="btn btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="spinner" />;

  if (orders.length === 0) {
    return (
      <div className="page container">
        <div className="empty-state">
          <Package size={48} />
          <h2>No orders yet</h2>
          <p>Start shopping to see your orders here</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 24 }}>My Orders</h1>

        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <div className="order-number">Order #{order.order_number}</div>
                <div className="order-date">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={`order-status ${order.status}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                <span style={{ fontWeight: 700 }}>&#8377;{order.total_amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="order-items">
              {order.order_items.map(item => (
                <div key={item.id} className="order-item">
                  <img src={item.product_image} alt={item.product_name} />
                  <div className="order-item-info">
                    <h4>{item.product_name}</h4>
                    <span>Qty: {item.quantity} &middot; &#8377;{item.price.toLocaleString()} each</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>&#8377;{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--neutral-200)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
              <span>Payment: {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method === 'card' ? 'Card' : 'UPI'}</span>
              <span>Payment Status: {order.payment_status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
