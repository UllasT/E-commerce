import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

type OrderItem = {
  product_name?: string;
  product_image?: string | null;
  price?: number;
  quantity?: number;
  [k: string]: any;
};

type Order = {
  _id?: string;
  id?: string | number;
  order_number?: string;
  status?: string;
  total_amount?: number;
  total?: number;
  createdAt?: string;
  created_at?: string;
  items?: OrderItem[];
  shipping_address?: any;
  [k: string]: any;
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'orders') fetchOrders();
  }, [tab]);

  async function fetchOrders() {
    setLoadingOrders(true);
    setError(null);
    try {
      const res = await api.get('orders/my');
      const data = res.data;
      // API returns array of orders for both SQL and Mongo
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  }

  function formatDate(o: Order) {
    const d = o.createdAt || o.created_at || o.created_at || undefined;
    if (!d) return '';
    try {
      return new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  }

  return (
    <div className="container page">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="user-info">
            <div className="avatar">{user?.full_name ? user.full_name[0] : (user?.email ? user.email[0] : 'U')}</div>
            <div className="user-name">{user?.full_name ?? 'User'}</div>
            <div className="user-email">{user?.email ?? ''}</div>
          </div>

          <nav className="dashboard-nav">
            <a className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')} style={{ cursor: 'pointer' }}>Orders</a>
            <a className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')} style={{ cursor: 'pointer' }}>Profile</a>
          </nav>
        </aside>

        <section className="dashboard-content">
          {tab === 'profile' && (
            <div>
              <h1>Profile</h1>
              <div style={{ maxWidth: 720 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-group">
                      <div className="form-group label">Full name</div>
                      <input value={user?.full_name ?? ''} readOnly />
                    </label>
                  </div>
                  <div>
                    <label className="form-group">
                      <div className="form-group label">Email</div>
                      <input value={user?.email ?? ''} readOnly />
                    </label>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <label className="form-group">
                    <div className="form-group label">Phone</div>
                    <input value={(user as any)?.phone ?? ''} readOnly />
                  </label>
                </div>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div>
              <h1>Orders</h1>
              {loadingOrders && <div className="spinner" />}
              {error && <div className="alert alert-error">{error}</div>}
              {!loadingOrders && (!orders || orders.length === 0) && <div className="empty-state"><h2>No orders found</h2></div>}

              {!loadingOrders && orders && orders.map((o) => (
                <div key={(o._id ?? o.id) as string} className="order-card">
                  <div className="order-header">
                    <div>
                      <div className="order-number">{o.order_number ?? `#${o.id ?? o._id}`}</div>
                      <div className="order-date">{formatDate(o)}</div>
                    </div>
                    <div>
                      <span className={`order-status ${o.status ?? ''}`}>{o.status ?? 'pending'}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: 12, fontWeight: 700 }}>Total: ${ (o.total_amount ?? o.total ?? 0).toFixed ? (o.total_amount ?? o.total ?? 0).toFixed(2) : String(o.total_amount ?? o.total ?? 0) }</div>

                  <div className="order-items">
                    {(o.items ?? []).map((it: OrderItem, idx: number) => (
                      <div key={idx} className="order-item">
                        <img src={it.product_image || (it as any).product?.image_url || '/'} alt={it.product_name} />
                        <div className="order-item-info">
                          <h4>{it.product_name ?? (it as any).product?.name ?? 'Product'}</h4>
                          <span>${(it.price ?? 0).toFixed ? (it.price ?? 0).toFixed(2) : String(it.price ?? 0)} • Qty: {it.quantity ?? 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
