import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, cartTotal, loading } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="page container">
        <div className="empty-state">
          <ShoppingBag size={48} />
          <h2>Please sign in</h2>
          <p>You need to be logged in to view your cart</p>
          <Link to="/login" className="btn btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="spinner" />;
  if (items.length === 0) {
    return (
      <div className="page container">
        <div className="empty-state">
          <ShoppingBag size={48} />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  const shipping = cartTotal >= 500 ? 0 : 49;
  const total = cartTotal + shipping;

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart ({items.length} item{items.length !== 1 ? 's' : ''})</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <Link to={`/product/${item.product?.slug}`}>
                    <img src={item.product?.image_url} alt={item.product?.name} />
                  </Link>
                </div>
                <div className="cart-item-info">
                  <Link to={`/product/${item.product?.slug}`}>
                    <h3>{item.product?.name}</h3>
                  </Link>
                  <p className="price">&#8377;{((item.product?.price ?? 0) * item.quantity).toLocaleString()}</p>
                  <div className="quantity-control">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>&#8377;{cartTotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            {shipping > 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-600)', marginBottom: 8 }}>
                Free shipping on orders above ₹500
              </p>
            )}
            <div className="cart-summary-row total">
              <span>Total</span>
              <span>&#8377;{total.toLocaleString()}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-lg">Proceed to Checkout</Link>
            <Link to="/products" className="btn btn-ghost" style={{ width: '100%', marginTop: 8 }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
