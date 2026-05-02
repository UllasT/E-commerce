import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../types';
import api from '../lib/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('cart');
      const cartItems = res.data || [];
      // Transform backend response to CartItem format
      const transformed = cartItems.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        quantity: item.quantity,
        created_at: item.created_at,
        product: {
          id: item.product_id,  // Fix: use product_id, not item.id
          name: item.name,
          description: item.description,
          price: item.price,
          compare_price: item.compare_price || null,
          slug: item.slug,
          image_url: item.image_url,
          category_id: item.category_id,
          rating: item.rating || 0,
          review_count: item.review_count || 0,
          stock: item.stock,
          featured: item.featured || false,
          created_at: item.created_at,
        } as Product
      })) as CartItem[];
      setItems(transformed);
    } catch (err: any) {
      if (err.response?.status === 401) {
        signOut();
      }
      console.error('Error fetching cart:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId: string) => {
    if (!user) {
      const err = new Error('PLEASE_LOGIN');
      (err as any).requiresLogin = true;
      throw err;
    }
    try {
      const res = await api.post('cart/add', { productId, quantity: 1 });
      console.log('Add to cart response:', res.data);
      await fetchCart();
    } catch (err: any) {
      if (err.response?.status === 401) {
        signOut();
      }
      console.error('Backend error response:', err.response?.data);
      console.error('Error adding to cart:', err.response?.data?.message || err.message);
      throw err;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await api.delete(`cart/remove/${itemId}`);
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err: any) {
      if (err.response?.status === 401) {
        signOut();
      }
      console.error('Error removing from cart:', err);
      throw err;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }
    try {
      await api.put(`cart/update/${itemId}`, { quantity });
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
    } catch (err: any) {
      if (err.response?.status === 401) {
        signOut();
      }
      console.error('Error updating quantity:', err);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      for (const item of items) {
        await api.delete(`cart/remove/${item.id}`);
      }
      setItems([]);
    } catch (err: any) {
      if (err.response?.status === 401) {
        signOut();
      }
      console.error('Error clearing cart:', err);
      throw err;
    }
  };

  const cartTotal = items.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
