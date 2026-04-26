import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../types';
import { createId, getCartStore, getProductById, saveCartStore } from '../lib/localStore';

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
  const guestId = 'guest';

  const fetchCart = async () => {
    setLoading(true);
    const cart = getCartStore()[guestId] ?? [];
    setItems(
      cart
        .map((item: { id: string; user_id: string; product_id: string; quantity: number; created_at: string }) => {
          const product = getProductById(item.product_id);
          return product ? { ...item, product } : null;
        })
        .filter(Boolean) as (CartItem & { product: Product })[]
    );
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, []);

  const addToCart = async (productId: string) => {
    const existing = items.find(i => i.product_id === productId);
    if (existing) {
      await updateQuantity(existing.id, existing.quantity + 1);
    } else {
      const cartStore = getCartStore();
      const userCart = cartStore[guestId] ?? [];
      userCart.push({ id: createId('cart'), user_id: guestId, product_id: productId, quantity: 1, created_at: new Date().toISOString() });
      cartStore[guestId] = userCart;
      saveCartStore(cartStore);
      fetchCart();
    }
  };

  const removeFromCart = async (itemId: string) => {
    const cartStore = getCartStore();
    cartStore[guestId] = (cartStore[guestId] ?? []).filter((item: { id: string }) => item.id !== itemId);
    saveCartStore(cartStore);
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) { await removeFromCart(itemId); return; }
    const cartStore = getCartStore();
    cartStore[guestId] = (cartStore[guestId] ?? []).map((item: { id: string; user_id: string; product_id: string; quantity: number; created_at: string }) => (
      item.id === itemId ? { ...item, quantity } : item
    ));
    saveCartStore(cartStore);
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
  };

  const clearCart = async () => {
    const cartStore = getCartStore();
    cartStore[guestId] = [];
    saveCartStore(cartStore);
    setItems([]);
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
