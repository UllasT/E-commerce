import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, ShoppingCart, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Profile, Address } from '../types';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      .then(({ data }) => {
        setProfile(data as Profile);
        if (data) { setFullName(data.full_name); setPhone(data.phone); }
      });
    supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false })
      .then(({ data }) => setAddresses((data as Address[]) ?? []));
  }, [user, navigate]);

  if (!user) return null;

  const initials = (profile?.full_name || user.email || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSaveProfile = async () => {
    await supabase.from('profiles').update({ full_name: fullName, phone, updated_at: new Date().toISOString() }).eq('id', user.id);
    setProfile(prev => prev ? { ...prev, full_name: fullName, phone } : null);
    setEditing(false);
  };

  const handleDeleteAddress = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard-layout">
          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <div className="user-info">
              <div className="avatar">{initials}</div>
              <div className="user-name">{profile?.full_name || 'User'}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <nav className="dashboard-nav">
              <a className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                <User size={18} /> Profile
              </a>
              <a className={activeTab === 'addresses' ? 'active' : ''} onClick={() => setActiveTab('addresses')}>
                <MapPin size={18} /> Addresses
              </a>
              <Link to="/orders"><Package size={18} /> Orders</Link>
              <Link to="/wishlist"><Heart size={18} /> Wishlist</Link>
              <Link to="/cart"><ShoppingCart size={18} /> Cart</Link>
              <a onClick={signOut} style={{ color: 'var(--error-500)' }}><LogOut size={18} /> Sign Out</a>
            </nav>
          </aside>

          {/* Content */}
          <div className="dashboard-content">
            {activeTab === 'profile' && (
              <>
                <h1>My Profile</h1>
                {editing ? (
                  <div>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input value={fullName} onChange={e => setFullName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary" onClick={handleSaveProfile}>Save Changes</button>
                      <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>Full Name</label>
                      <p style={{ fontWeight: 500 }}>{profile?.full_name || 'Not set'}</p>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>Email</label>
                      <p style={{ fontWeight: 500 }}>{user.email}</p>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>Phone</label>
                      <p style={{ fontWeight: 500 }}>{profile?.phone || 'Not set'}</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'addresses' && (
              <>
                <h1>My Addresses</h1>
                {addresses.length === 0 ? (
                  <div className="empty-state" style={{ padding: 32 }}>
                    <MapPin size={36} />
                    <h2>No addresses saved</h2>
                    <p>Add an address during checkout</p>
                    <Link to="/products" className="btn btn-primary">Start Shopping</Link>
                  </div>
                ) : (
                  <div>
                    {addresses.map(addr => (
                      <div key={addr.id} style={{ border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <span style={{ fontWeight: 600 }}>{addr.full_name}</span>
                            {addr.is_default && <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 600, background: 'var(--primary-50)', padding: '2px 8px', borderRadius: 999 }}>Default</span>}
                            <p style={{ color: 'var(--neutral-500)', fontSize: '0.9rem', marginTop: 4 }}>{addr.phone}</p>
                            <p style={{ color: 'var(--neutral-500)', fontSize: '0.9rem' }}>{addr.address_line1}, {addr.city}, {addr.state} - {addr.postal_code}</p>
                          </div>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteAddress(addr.id)} style={{ color: 'var(--error-500)' }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
