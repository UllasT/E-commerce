import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Check, ArrowLeft } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import api from '../lib/api';
import { getRelatedProducts } from '../lib/localStore';

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = async () => {
    try {
      if (product) await addToCart(product.id);
    } catch (err: any) {
      if (err.message === 'PLEASE_LOGIN') {
        navigate('/login');
      }
    }
  };

  const handleWishlist = async () => {
    try {
      if (product) await toggleWishlist(product.id);
    } catch (err: any) {
      if (err.message === 'PLEASE_LOGIN') {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        if (!slug) {
          setProduct(null);
          setRelated([]);
          return;
        }
        const res = await api.get(`products/slug/${encodeURIComponent(slug)}`);
        const data = res.data;
        setProduct(data as Product);
        setRelated(getRelatedProducts((data as any).category_id, (data as any).id) as Product[]);
      } catch (err) {
        setProduct(null);
        setRelated([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (loading) return <div className="spinner" />;
  if (!product)
    return (
      <div className="page container">
        <div className="empty-state">
          <h2>Product not found</h2>
          <p>The product you're looking for doesn't exist</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
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
            <img src={(product as any).image_url} alt={product.name} />
          </div>

          <div className="product-detail-info">
            <h1>{product.name}</h1>

            <div className="product-detail-rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={18} fill={i <= Math.round(product.rating || 0) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span>{product.rating ?? 0} ({product.review_count ?? 0} reviews)</span>
            </div>

            <div className="product-detail-pricing">
              <span className="price">₹{product.price.toLocaleString()}</span>
              {product.compare_price && (
                <>
                  <span className="compare-price">₹{product.compare_price.toLocaleString()}</span>
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

            <div className="product-detail-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button
                className={`btn btn-secondary btn-lg ${isInWishlist(product.id) ? 'btn-danger' : ''}`}
                onClick={handleWishlist}
              >
                <Heart size={18} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                {isInWishlist(product.id) ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>

          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <>
            <h2 className="section-title">Related Products</h2>
            <div className="products-grid">
              {related.map(p => (
                <ProductCard key={p.slug || p.id || Math.random()} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
