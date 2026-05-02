import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import api from '../lib/api';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Fetch categories
        const catRes = await api.get('categories');
        const cats = catRes.data?.categories || catRes.data?.catagories || [];
        setCategories(cats);

        // Fetch featured products
        const featRes = await api.get('products', { params: { featured: 'true' } });
        const featuredProducts = featRes.data?.items || featRes.data || [];
        setFeatured(featuredProducts);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setCategories([]);
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div className="page">
      <div className="container">
        {/* Hero Banner */}
        <div className="hero-banner">
          <h1>Mega Sale is Live!</h1>
          <p>Up to 70% off on electronics, fashion, home essentials and more. Shop now before deals expire.</p>
          <Link to="/products" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary-700)' }}>
            Shop Now <ArrowRight size={18} />
          </Link>
        </div>

        {/* Categories */}
        <h2 className="section-title">Shop by Category</h2>
        <div className="categories-grid">
          {categories.map(cat => (
            <Link to={`/products?category=${cat.slug}`} key={cat.id} className="category-card">
              <img src={cat.image_url} alt={cat.name} loading="lazy" />
              <h3>{cat.name}</h3>
            </Link>
          ))}
        </div>

        {/* Featured Products */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Featured Products</h2>
          <Link to="/products" className="btn btn-ghost btn-sm">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="products-grid">
          {featured.map(p => (
            <ProductCard key={p.slug || p.id || Math.random()} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
