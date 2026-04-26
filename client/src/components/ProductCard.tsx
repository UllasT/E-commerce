import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

function DiscountBadge({ price, comparePrice }: { price: number; comparePrice: number | null }) {
  if (!comparePrice || comparePrice <= price) return null;
  const discount = Math.round(((comparePrice - price) / comparePrice) * 100);
  return <span className="product-card-discount">{discount}% OFF</span>;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} fill={i <= Math.round(rating) ? 'currentColor' : 'none'} />
      ))}
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`}>
        <div className="product-card-image">
          <img src={product.image_url} alt={product.name} loading="lazy" />
          <DiscountBadge price={product.price} comparePrice={product.compare_price} />
          <button
            className={`product-card-wishlist ${isInWishlist(product.id) ? 'active' : ''}`}
            onClick={handleWishlist}
            aria-label="Toggle wishlist"
          >
            <Heart size={18} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="product-card-body">
          <h3>{product.name}</h3>
          <div className="product-card-rating">
            <Stars rating={product.rating} />
            <span>({product.review_count})</span>
          </div>
          <div className="product-card-pricing">
            <span className="price">&#8377;{product.price.toLocaleString()}</span>
            {product.compare_price && (
              <span className="compare-price">&#8377;{product.compare_price.toLocaleString()}</span>
            )}
          </div>
          <div className="product-card-actions">
            <button className="btn btn-primary btn-sm" onClick={handleAddToCart}>
              <ShoppingCart size={14} /> Add to Cart
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
