import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import api from '../lib/api';

const PRICE_RANGES = [
  { label: 'Under 500', min: 0, max: 500 },
  { label: '500 - 2000', min: 500, max: 2000 },
  { label: '2000 - 10000', min: 2000, max: 10000 },
  { label: '10000 - 50000', min: 10000, max: 50000 },
  { label: 'Above 50000', min: 50000, max: Infinity },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get('category_id') || '';
  const searchQuery = searchParams.get('search') || '';
  const selectedPriceRanges = searchParams.get('price')?.split(',').filter(Boolean) || [];

  // Fetch categories from backend with fallback
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('categories');
        const cats = res.data?.categories || res.data?.catagories || [];
        console.log('Categories from backend:', cats);
        if (cats.length > 0) {
          setCategories(cats);
        } else {
          // Fallback to local categories if backend returns empty
          const { getCategories } = await import('../lib/localStore');
          setCategories(getCategories());
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback to local categories on error
        const { getCategories } = await import('../lib/localStore');
        setCategories(getCategories());
      }
    })();
  }, []);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const params: any = {};
        if (searchQuery) params.q = searchQuery;
        if (selectedCategory) params.category_id = selectedCategory;
        const res = await api.get('products', { params });
        const items = res.data?.items ?? res.data ?? [];
        console.log('Products response:', { received: items.length, data: res.data });
        setProducts(items);
      } catch (err: any) {
        console.error('Error fetching products:', err?.response?.data || err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedCategory, searchQuery]);

  const filteredProducts = useMemo(() => {
    if (selectedPriceRanges.length === 0) return products;
    return products.filter(p => {
      return selectedPriceRanges.some(range => {
        const r = PRICE_RANGES[parseInt(range)];
        return r && p.price >= r.min && p.price < r.max;
      });
    });
  }, [products, selectedPriceRanges]);

  const toggleCategory = (categoryId: string) => {
    setSearchParams(prev => {
      if (categoryId === selectedCategory) prev.delete('category_id');
      else prev.set('category_id', categoryId);
      return prev;
    });
  };

  const togglePriceRange = (idx: number) => {
    setSearchParams(prev => {
      const current = prev.get('price')?.split(',').filter(Boolean) || [];
      const strIdx = String(idx);
      const next = current.includes(strIdx) ? current.filter(x => x !== strIdx) : [...current, strIdx];
      if (next.length) prev.set('price', next.join(','));
      else prev.delete('price');
      return prev;
    });
  };

  const clearFilters = () => setSearchParams({});

  const activeCategory = categories.find(c => ((c as any)._id || c.id) === selectedCategory);

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          <span className="current">
            {activeCategory ? activeCategory.name : searchQuery ? `Search: "${searchQuery}"` : 'All Products'}
          </span>
        </div>

        <div className="products-layout">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Filters</h3>
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear All</button>
            </div>

            <div className="filter-group">
              <h3>Category</h3>
              {categories.map(cat => {
                const categoryId = (cat as any)._id || cat.id;
                return (
                  <label key={categoryId}>
                    <input
                      type="checkbox"
                      checked={selectedCategory === categoryId}
                      onChange={() => toggleCategory(categoryId)}
                    />
                    {cat.name}
                  </label>
                );
              })}
            </div>

            <div className="filter-group">
              <h3>Price Range</h3>
              {PRICE_RANGES.map((range, idx) => (
                <label key={idx}>
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes(String(idx))}
                    onChange={() => togglePriceRange(idx)}
                  />
                  {range.max === Infinity ? 'Above 50000' : `₹${range.min.toLocaleString()} - ₹${range.max.toLocaleString()}`}
                </label>
              ))}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="products-main">
            <p style={{ marginBottom: 20, color: 'var(--neutral-500)', fontSize: '0.9rem' }}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
            {loading ? (
              <div className="spinner" />
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <h2>No products found</h2>
                <p>Try adjusting your filters or search terms</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(p => (
                  <ProductCard key={p.slug || p.id || Math.random()} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
