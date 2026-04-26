import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { WishlistItem, Product } from '../types';
import { createId, getProductById, getWishlistStore, saveWishlistStore } from '../lib/localStore';

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
  const guestId = 'guest';

  const fetchWishlist = async () => {
    setLoading(true);
    const wishlist = getWishlistStore()[guestId] ?? [];
    setItems(
      wishlist
        .map((item: { id: string; user_id: string; product_id: string; created_at: string }) => {
          const product = getProductById(item.product_id);
          return product ? { ...item, product } : null;
        })
        .filter(Boolean) as (WishlistItem & { product: Product })[]
    );
    setLoading(false);
  };

  useEffect(() => { fetchWishlist(); }, []);

  const toggleWishlist = async (productId: string) => {
    const existing = items.find(i => i.product_id === productId);
    const wishlistStore = getWishlistStore();
    if (existing) {
      wishlistStore[guestId] = (wishlistStore[guestId] ?? []).filter((item: { id: string }) => item.id !== existing.id);
      saveWishlistStore(wishlistStore);
      setItems(prev => prev.filter(i => i.id !== existing.id));
    } else {
      wishlistStore[guestId] = [
        ...(wishlistStore[guestId] ?? []),
        { id: createId('wish'), user_id: guestId, product_id: productId, created_at: new Date().toISOString() },
      ];
      saveWishlistStore(wishlistStore);
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
