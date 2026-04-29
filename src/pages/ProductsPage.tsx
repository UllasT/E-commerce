import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

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

  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const selectedPriceRanges = searchParams.get('price')?.split(',').filter(Boolean) || [];

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let query = supabase.from('products').select('*, category:categories(*)');

      if (selectedCategory) {
        const { data: catData } = await supabase.from('categories').select('id').eq('slug', selectedCategory).maybeSingle();
        if (catData) query = query.eq('category_id', catData.id);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data } = await query.order('created_at', { ascending: false });
      setProducts((data as (Product & { category: Category })[]) ?? []);
      setLoading(false);
    }
    fetchProducts();
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

  const toggleCategory = (slug: string) => {
    setSearchParams(prev => {
      if (slug === selectedCategory) prev.delete('category');
      else prev.set('category', slug);
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

  const activeCategory = categories.find(c => c.slug === selectedCategory);

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
              {categories.map(cat => (
                <label key={cat.id}>
                  <input
                    type="checkbox"
                    checked={selectedCategory === cat.slug}
                    onChange={() => toggleCategory(cat.slug)}
                  />
                  {cat.name}
                </label>
              ))}
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
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
