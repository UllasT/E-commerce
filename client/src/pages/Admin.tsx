import { useEffect, useState } from 'react';
import { Plus, X, Trash2, Edit2, Loader } from 'lucide-react';
import type { Product, Category } from '../types';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    compare_price: '',
    image_url: '',
    category_id: '',
    stock: '',
    featured: false,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        // Fetch categories
        const catRes = await api.get('categories');
        const fetchedCategories = catRes.data.catagories || catRes.data 
 ;
        setCategories(fetchedCategories);

        // Fetch products
        const prodRes = await api.get('products/user');
        setProducts(prodRes.data ?? []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setCategories([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: String(product.price),
        compare_price: String(product.compare_price || ''),
        image_url: product.image_url,
        category_id: product.category_id,
        stock: String(product.stock),
        featured: product.featured,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: '',
        compare_price: '',
        image_url: '',
        category_id: '',
        stock: '',
        featured: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      compare_price: '',
      image_url: '',
      category_id: '',
      stock: '',
      featured: false,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        stock: parseInt(formData.stock),
        image_url: formData.image_url,
      };

      if (editingProduct) {
        await api.put(`products/update/${editingProduct.id}`, payload);
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p));
        setMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        const res = await api.post('products/create', payload);
        const newProduct: Product = {
          id: res.data?.productId ?? res.data?._id ?? res.data?.id ?? Date.now().toString(),
          ...payload,
          compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
          slug: formData.slug,
          rating: 0,
          review_count: 0,
          featured: formData.featured,
          created_at: new Date().toISOString(),
        } as Product;
        setProducts([newProduct, ...products]);
        setMessage({ type: 'success', text: 'Product added successfully!' });
      }
      
      handleCloseModal();
      setTimeout(() => setMessage(null), 2000);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const msg = error?.response?.data?.message || 'Error saving product. Please try again.';
      setMessage({ type: 'error', text: msg });
      setTimeout(() => setMessage(null), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`products/delete/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      setMessage({ type: 'success', text: 'Product deleted successfully!' });
      setTimeout(() => setMessage(null), 2000);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      const msg = error?.response?.data?.message || 'Error deleting product.';
      setMessage({ type: 'error', text: msg });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  if (!user) {
    return (
      <div className="admin-page container">
        <div className="empty-state">
          <h2>Please log in to access admin panel</h2>
          <p>You need to be logged in to manage products.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="admin-page loading"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1>Product Management</h1>
            <p>Manage your uploaded products</p>
          </div>
          <button 
            className="admin-header-button"
            onClick={() => handleOpenModal()}
          >
            <Plus size={18} /> Add Product
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Products Grid */}
        <div className="admin-products">
          {products.length === 0 ? (
            <div className="empty-state-admin">
              <p>No products yet. Click "Add Product" to get started!</p>
            </div>
          ) : (
            <div className="admin-products-grid">
              {products.map(product => (
                <div key={product.id} className="admin-product-card">
                  <div className="admin-product-image">
                    <img src={product.image_url} alt={product.name} />
                    {product.featured && <span className="featured-badge">Featured</span>}
                  </div>
                  <div className="admin-product-info">
                    <h3>{product.name}</h3>
                    <p className="description">{product.description?.substring(0, 80)}...</p>
                    <div className="product-meta">
                      <div>
                        <span className="label">Price</span>
                        <span className="value">₹{product.price}</span>
                      </div>
                      <div>
                        <span className="label">Stock</span>
                        <span className="value">{product.stock}</span>
                      </div>
                    </div>
                  </div>
                  <div className="admin-product-actions">
                    <button
                      onClick={() => handleOpenModal(product)}
                      title="Edit product"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteProduct(product.id)}
                      title="Delete product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div>
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., iPhone 15 Pro"
                  required
                />
              </div>

              <div>
                <label htmlFor="slug">Slug *</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g., iphone-15-pro"
                  required
                />
              </div>

              <div>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Product description..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div>
                  <label htmlFor="price">Price (₹) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="compare_price">Compare Price (₹)</label>
                  <input
                    type="number"
                    id="compare_price"
                    name="compare_price"
                    value={formData.compare_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label htmlFor="stock">Stock *</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category_id">Category</label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a category</option>
                    {categories &&categories.map(cat => {
                      const catId = (cat as any)._id || cat.id;
                      return (
                        <option key={catId} value={catId}>
                          {cat.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="image_url">Image URL *</label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div className="form-group-checkbox">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                <label htmlFor="featured">Mark as Featured</label>
              </div>

              {formData.image_url && (
                <div className="image-preview">
                  <label>Image Preview:</label>
                  <img src={formData.image_url} alt="Preview" onError={() => {}} />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? (
                    <span className="btn-spinner">
                      <Loader size={16} className="spinner-icon" /> Saving...
                    </span>
                  ) : (
                    editingProduct ? 'Update Product' : 'Add Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
