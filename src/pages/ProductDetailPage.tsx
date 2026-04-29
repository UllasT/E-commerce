import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        setProduct(data as Product & { category: { name: string } });
        if (data.category_id) {
          const { data: relData } = await supabase
            .from('products')
            .select('*, category:categories(*)')
            .eq('category_id', data.category_id)
            .neq('id', data.id)
            .limit(4);
          setRelated((relData as (Product & { category: { name: string } })[]) ?? []);
        }
      }
      setLoading(false);
    }
    if (slug) fetchProduct();
  }, [slug]);

  if (loading) return <div className="spinner" />;
  if (!product) return (
    <div className="page container">
      <div className="empty-state">
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist</p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    </div>
  );

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          <Link to="/products">Products</Link>
          <span className="separator">/</span>
          <span className="current">{product.name}</span>
        </div>

        <div className="product-detail">
          <div className="product-detail-image">
            <img src={product.image_url} alt={product.name} />
          </div>

          <div className="product-detail-info">
            <h1>{product.name}</h1>

            <div className="product-detail-rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={18} fill={i <= Math.round(product.rating) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span>{product.rating} ({product.review_count} reviews)</span>
            </div>

            <div className="product-detail-pricing">
              <span className="price">&#8377;{product.price.toLocaleString()}</span>
              {product.compare_price && (
                <>
                  <span className="compare-price">&#8377;{product.compare_price.toLocaleString()}</span>
                  <span className="discount">{discount}% off</span>
                </>
              )}
            </div>

            <p className="product-detail-description">{product.description}</p>

            <p className={`product-detail-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? (
                <><Check size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> In Stock ({product.stock} available)</>
              ) : 'Out of Stock'}
            </p>

            {user && (
              <div className="product-detail-actions">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button
                  className={`btn btn-secondary btn-lg ${isInWishlist(product.id) ? 'btn-danger' : ''}`}
                  onClick={() => toggleWishlist(product.id)}
                >
                  <Heart size={18} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                  {isInWishlist(product.id) ? 'Wishlisted' : 'Wishlist'}
                </button>
              </div>
            )}

            {!user && (
              <div style={{ padding: 16, background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', marginTop: 16 }}>
                <p style={{ marginBottom: 8, color: 'var(--primary-700)', fontWeight: 500 }}>
                  Please sign in to add items to your cart or wishlist.
                </p>
                <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <>
            <h2 className="section-title">Related Products</h2>
            <div className="products-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
