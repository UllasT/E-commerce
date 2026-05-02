import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { WishlistItem, Product } from '../types';
import api from '../lib/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();

  const fetchWishlist = async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('wishlist');
      const wishlistItems = res.data || [];
      // Transform backend response to WishlistItem format
      const transformed = wishlistItems.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        product_id: item.product_id,
        created_at: item.created_at,
        product: {
          id: item.id || item.product_id,
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
      })) as WishlistItem[];
      setItems(transformed);
    } catch (err: any) {
      if (err.response?.status === 401) {
        signOut();
      }
      console.error('Error fetching wishlist:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      const err = new Error('PLEASE_LOGIN');
      (err as any).requiresLogin = true;
      throw err;
    }
    try {
      const existing = items.find(i => i.product_id === productId);
      if (existing) {
        await api.delete(`wishlist/remove/${existing.id}`);
        setItems(prev => prev.filter(i => i.id !== existing.id));
      } else {
        await api.post('wishlist/add', { productId });
        await fetchWishlist();
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        signOut();
      }
      console.error('Error toggling wishlist:', err);
      throw err;
    }
  };

  const isInWishlist = (productId: string) => items.some(i => i.product_id === productId);

  return (
    <WishlistContext.Provider value={{ items, loading, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
