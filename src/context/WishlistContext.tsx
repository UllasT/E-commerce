import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { WishlistItem, Product } from '../types';

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
  const { user } = useAuth();

  const fetchWishlist = async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from('wishlist_items')
      .select('*, product:products(*)')
      .eq('user_id', user.id);
    setItems((data as (WishlistItem & { product: Product })[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchWishlist(); }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) return;
    const existing = items.find(i => i.product_id === productId);
    if (existing) {
      await supabase.from('wishlist_items').delete().eq('id', existing.id);
      setItems(prev => prev.filter(i => i.id !== existing.id));
    } else {
      await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: productId });
      fetchWishlist();
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
