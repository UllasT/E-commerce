import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Star } from 'lucide-react';

export default function WishlistPage() {
  const { items, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="page container">
        <div className="empty-state">
          <Heart size={48} />
          <h2>Please sign in</h2>
          <p>You need to be logged in to view your wishlist</p>
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
          <Heart size={48} />
          <h2>Your wishlist is empty</h2>
          <p>Save items you love for later</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 24 }}>
          My Wishlist ({items.length} item{items.length !== 1 ? 's' : ''})
        </h1>

        <div className="products-grid">
          {items.map(item => {
            const p = item.product;
            if (!p) return null;
            return (
              <div key={item.id} className="product-card">
                <Link to={`/product/${p.slug}`}>
                  <div className="product-card-image">
                    <img src={p.image_url} alt={p.name} loading="lazy" />
                    {p.compare_price && p.compare_price > p.price && (
                      <span className="product-card-discount">
                        {Math.round(((p.compare_price - p.price) / p.compare_price) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  <div className="product-card-body">
                    <h3>{p.name}</h3>
                    <div className="product-card-rating">
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} size={14} fill={i <= Math.round(p.rating) ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                      <span>({p.review_count})</span>
                    </div>
                    <div className="product-card-pricing">
                      <span className="price">&#8377;{p.price.toLocaleString()}</span>
                      {p.compare_price && (
                        <span className="compare-price">&#8377;{p.compare_price.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="product-card-actions">
                      <button className="btn btn-primary btn-sm" onClick={e => { e.preventDefault(); addToCart(p.id); }}>
                        <ShoppingCart size={14} /> Add to Cart
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={e => { e.preventDefault(); toggleWishlist(p.id); }}>
                        <Heart size={14} fill="currentColor" /> Remove
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
