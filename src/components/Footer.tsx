import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3>ShopKart</h3>
            <p>Your one-stop destination for everything you need. Shop from a wide range of products at the best prices with fast delivery.</p>
          </div>
          <div>
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?category=electronics">Electronics</Link></li>
              <li><Link to="/products?category=fashion">Fashion</Link></li>
              <li><Link to="/products?category=home-kitchen">Home & Kitchen</Link></li>
            </ul>
          </div>
          <div>
            <h3>Account</h3>
            <ul>
              <li><Link to="/dashboard">My Account</Link></li>
              <li><Link to="/orders">Orders</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
            </ul>
          </div>
          <div>
            <h3>Support</h3>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} ShopKart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
