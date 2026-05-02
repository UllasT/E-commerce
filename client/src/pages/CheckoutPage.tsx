import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, Banknote, CircleCheck as CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { Address } from '../types';
import api from '../lib/api';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // New address form
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: '', phone: '', address_line1: '', address_line2: '',
    city: '', state: '', postal_code: '', country: 'India',
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get('addresses/list');
        const addrs = res.data || [];
        setAddresses(addrs);
        if (addrs.length > 0) {
          const defaultAddr = addrs.find((a: Address) => a.is_default);
          const selectedId = (defaultAddr ?? addrs[0])._id || (defaultAddr ?? addrs[0]).id;
          setSelectedAddress(selectedId);
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
      } finally {
        setFetchingAddresses(false);
      }
    };
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  if (items.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  if (fetchingAddresses) {
    return <div className="spinner" />;
  }

  const shipping = cartTotal >= 500 ? 0 : 49;
  const total = cartTotal + shipping;

  const handleAddAddress = async () => {
    try {
      const payload = {
        ...newAddress,
        is_default: addresses.length === 0,
      };
      const res = await api.post('addresses/add', payload);
      const addedAddress = res.data;
      setAddresses(prev => [...prev, addedAddress]);
      const newSelectedId = addedAddress._id || addedAddress.id;
      setSelectedAddress(newSelectedId);
      setShowNewAddress(false);
      setNewAddress({ full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'India' });
    } catch (err: any) {
      console.error('Error adding address:', err);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return;
    setLoading(true);

    try {
      const addr = addresses.find((a:any) => (a.id === selectedAddress) || (a._id === selectedAddress));
      
      const payload = {
        items,
        shipping_address: addr,
        payment_method: paymentMethod,
      };

      const res = await api.post('orders/create', payload);
      const order = res.data;
      
      setOrderNumber(order.order_number || `SK${Date.now().toString(36).toUpperCase()}`);
      setOrderPlaced(true);
    } catch (err: any) {
      console.error('Error placing order:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="page container">
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '64px 0' }}>
          <div className="success-icon">
            <CheckCircle size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Order Placed!</h1>
          <p style={{ color: 'var(--neutral-500)', marginBottom: 8 }}>
            Your order <strong>{orderNumber}</strong> has been placed successfully.
          </p>
          <p style={{ color: 'var(--neutral-500)', marginBottom: 32 }}>
            Your order has been saved locally in this browser.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/products" className="btn btn-secondary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 24 }}>Checkout</h1>

        <div className="checkout-layout">
          <div>
            {/* Shipping Address */}
            <div className="checkout-section">
              <h2>Shipping Address</h2>
              {addresses.map(addr => {
                const addrId = (addr as any)._id || addr.id;
                return (
                  <div
                    key={addrId}
                    className={`address-card ${selectedAddress === addrId ? 'selected' : ''}`}
                    onClick={() => setSelectedAddress(addrId)}
                  >
                    <div className="name">{addr.full_name} {addr.is_default && <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 600 }}>(Default)</span>}</div>
                    <div className="detail">{addr.phone}</div>
                    <div className="detail">{addr.address_line1}, {addr.city}, {addr.state} - {addr.postal_code}</div>
                  </div>
                );
              })}

              {showNewAddress ? (
                <div style={{ marginTop: 16, padding: 16, border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group"><label>Full Name</label><input value={newAddress.full_name} onChange={e => setNewAddress(p => ({ ...p, full_name: e.target.value }))} /></div>
                    <div className="form-group"><label>Phone</label><input value={newAddress.phone} onChange={e => setNewAddress(p => ({ ...p, phone: e.target.value }))} /></div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Address Line 1</label><input value={newAddress.address_line1} onChange={e => setNewAddress(p => ({ ...p, address_line1: e.target.value }))} /></div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Address Line 2</label><input value={newAddress.address_line2} onChange={e => setNewAddress(p => ({ ...p, address_line2: e.target.value }))} /></div>
                    <div className="form-group"><label>City</label><input value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} /></div>
                    <div className="form-group"><label>State</label><input value={newAddress.state} onChange={e => setNewAddress(p => ({ ...p, state: e.target.value }))} /></div>
                    <div className="form-group"><label>Postal Code</label><input value={newAddress.postal_code} onChange={e => setNewAddress(p => ({ ...p, postal_code: e.target.value }))} /></div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={handleAddAddress}>Save Address</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowNewAddress(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={() => setShowNewAddress(true)} style={{ marginTop: 12 }}>
                  + Add New Address
                </button>
              )}
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <h2>Payment Method</h2>
              <div className="payment-options">
                <div className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cod')}>
                  <input type="radio" name="payment" checked={paymentMethod === 'cod'} readOnly />
                  <Banknote size={20} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Cash on Delivery</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>Pay when you receive</div>
                  </div>
                </div>
                <div className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`} onClick={() => setPaymentMethod('card')}>
                  <input type="radio" name="payment" checked={paymentMethod === 'card'} readOnly />
                  <CreditCard size={20} />
                  <div>
                    <div style={{ fontWeight: 600 }}>Credit/Debit Card</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>Visa, Mastercard, Rupay</div>
                  </div>
                </div>
                <div className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`} onClick={() => setPaymentMethod('upi')}>
                  <input type="radio" name="payment" checked={paymentMethod === 'upi'} readOnly />
                  <Truck size={20} />
                  <div>
                    <div style={{ fontWeight: 600 }}>UPI</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>Google Pay, PhonePe, Paytm</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <h2>Order Summary</h2>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
                <span style={{ flex: 1, marginRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.product?.name} x{item.quantity}
                </span>
                <span>&#8377;{((item.product?.price ?? 0) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--neutral-200)', margin: '12px 0', paddingTop: 12 }}>
              <div className="cart-summary-row"><span>Subtotal</span><span>&#8377;{cartTotal.toLocaleString()}</span></div>
              <div className="cart-summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="cart-summary-row total"><span>Total</span><span>&#8377;{total.toLocaleString()}</span></div>
            </div>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddress}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
