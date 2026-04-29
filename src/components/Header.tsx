import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, LogOut, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useState } from 'react';

export default function Header() {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">ShopKart</Link>

        <form className="search-bar" onSubmit={handleSearch}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="header-actions">
          {user ? (
            <>
              <Link to="/wishlist" className="header-btn">
                <Heart size={20} />
                {wishlistItems.length > 0 && <span className="badge">{wishlistItems.length}</span>}
              </Link>
              <Link to="/cart" className="header-btn">
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>
              <Link to="/orders" className="header-btn">
                <Package size={20} />
              </Link>
              <Link to="/dashboard" className="header-btn">
                <User size={20} />
              </Link>
              <button className="header-btn" onClick={signOut}>
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-secondary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
