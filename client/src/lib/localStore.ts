import type { Category, Product } from '../types';

const STORAGE_KEYS = {
  users: 'shopkart-users',
  session: 'shopkart-session',
  profiles: 'shopkart-profiles',
  addresses: 'shopkart-addresses',
  orders: 'shopkart-orders',
  cart: 'shopkart-cart',
  wishlist: 'shopkart-wishlist',
} as const;

export interface LocalAuthUser {
  id: string;
  email: string;
  full_name: string;
  password: string;
}

type WithId = { id: string };

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const value = window.localStorage.getItem(key);
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function createId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const categories: Category[] = [
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80',
    description: 'Phones, laptops, audio, and smart gadgets.',
    created_at: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'cat-fashion',
    name: 'Fashion',
    slug: 'fashion',
    image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    description: 'Daily wear and seasonal style staples.',
    created_at: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'cat-home',
    name: 'Home',
    slug: 'home',
    image_url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80',
    description: 'Furniture, decor, and kitchen essentials.',
    created_at: '2026-04-01T00:00:00.000Z',
  },
  {
    id: 'cat-beauty',
    name: 'Beauty',
    slug: 'beauty',
    image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
    description: 'Self-care products and grooming essentials.',
    created_at: '2026-04-01T00:00:00.000Z',
  },
];

export const products: Product[] = [
  {
    id: 'prod-wireless-headphones',
    name: 'Wireless Headphones Pro',
    slug: 'wireless-headphones-pro',
    description: 'Noise-cancelling headphones with 40-hour battery life and rich bass.',
    price: 7999,
    compare_price: 9999,
    image_url: 'https://images.unsplash.com/photo-1518441902117-f0dd9a6b8b65?auto=format&fit=crop&w=900&q=80',
    category_id: 'cat-electronics',
    rating: 4.6,
    review_count: 214,
    stock: 18,
    featured: true,
    created_at: '2026-04-02T00:00:00.000Z',
  },
  {
    id: 'prod-smartwatch',
    name: 'Everyday Smartwatch',
    slug: 'everyday-smartwatch',
    description: 'Track workouts, sleep, and notifications in a slim, durable frame.',
    price: 6499,
    compare_price: 7999,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    category_id: 'cat-electronics',
    rating: 4.4,
    review_count: 168,
    stock: 31,
    featured: true,
    created_at: '2026-04-02T00:00:00.000Z',
  },
  {
    id: 'prod-laptop-stand',
    name: 'Aluminum Laptop Stand',
    slug: 'aluminum-laptop-stand',
    description: 'Ergonomic stand that improves posture and airflow for your laptop.',
    price: 2499,
    compare_price: 3499,
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80',
    category_id: 'cat-electronics',
    rating: 4.8,
    review_count: 89,
    stock: 52,
    featured: false,
    created_at: '2026-04-02T00:00:00.000Z',
  },
  {
    id: 'prod-denim-jacket',
    name: 'Classic Denim Jacket',
    slug: 'classic-denim-jacket',
    description: 'Relaxed fit jacket with a timeless washed finish.',
    price: 3599,
    compare_price: 4999,
    image_url: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80',
    category_id: 'cat-fashion',
    rating: 4.5,
    review_count: 132,
    stock: 24,
    featured: true,
    created_at: '2026-04-02T00:00:00.000Z',
  },
  {
    id: 'prod-sneakers',
    name: 'Street Runner Sneakers',
    slug: 'street-runner-sneakers',
    description: 'Lightweight daily sneakers with cushioned soles.',
    price: 4299,
    compare_price: 5499,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    category_id: 'cat-fashion',
    rating: 4.7,
    review_count: 256,
    stock: 45,
    featured: true,
    created_at: '2026-04-02T00:00:00.000Z',
  },
  {
    id: 'prod-bamboo-chair',
    name: 'Bamboo Accent Chair',
    slug: 'bamboo-accent-chair',
    description: 'A warm, minimal chair for reading corners and living rooms.',
    price: 8999,
    compare_price: 11999,
    image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    category_id: 'cat-home',
    rating: 4.3,
    review_count: 61,
    stock: 12,
    featured: false,
    created_at: '2026-04-02T00:00:00.000Z',
  },
  {
    id: 'prod-ceramic-set',
    name: 'Ceramic Dinner Set',
    slug: 'ceramic-dinner-set',
    description: 'A four-person dinner set with a matte, handcrafted finish.',
    price: 2999,
    compare_price: 3899,
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    category_id: 'cat-home',
    rating: 4.6,
    review_count: 104,
    stock: 29,
    featured: true,
    created_at: '2026-04-02T00:00:00.000Z',
  },
  {
    id: 'prod-face-serum',
    name: 'Hydrating Face Serum',
    slug: 'hydrating-face-serum',
    description: 'Lightweight serum with fast-absorbing hydration and glow support.',
    price: 1299,
    compare_price: 1699,
    image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80',
    category_id: 'cat-beauty',
    rating: 4.5,
    review_count: 78,
    stock: 64,
    featured: false,
    created_at: '2026-04-02T00:00:00.000Z',
  },
  {
    id: 'prod-fragrance',
    name: 'Signature Eau de Parfum',
    slug: 'signature-eau-de-parfum',
    description: 'Warm floral fragrance with long-lasting projection.',
    price: 2199,
    compare_price: 2799,
    image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
    category_id: 'cat-beauty',
    rating: 4.2,
    review_count: 55,
    stock: 22,
    featured: true,
    created_at: '2026-04-02T00:00:00.000Z',
  },
];

export function getCategories() {
  return categories;
}

export function getProducts() {
  return products;
}

export function getCategoryBySlug(slug: string) {
  return categories.find(category => category.slug === slug) ?? null;
}

export function getProductBySlug(slug: string) {
  return products.find(product => product.slug === slug) ?? null;
}

export function getProductById(id: string) {
  return products.find(product => product.id === id) ?? null;
}

export function getFeaturedProducts(limit = 8) {
  return products.filter(product => product.featured).slice(0, limit);
}

export function getRelatedProducts(categoryId: string, currentProductId: string, limit = 4) {
  return products.filter(product => product.category_id === categoryId && product.id !== currentProductId).slice(0, limit);
}

export function getStoredValue<T>(key: string, fallback: T): T {
  return readStorage(key, fallback);
}

export function setStoredValue<T>(key: string, value: T) {
  writeStorage(key, value);
}

export function removeStoredValue(key: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

export function getSessionUser() {
  return readStorage<LocalAuthUser | null>(STORAGE_KEYS.session, null);
}

export function setSessionUser(user: LocalAuthUser | null) {
  if (user) {
    writeStorage(STORAGE_KEYS.session, user);
  } else {
    removeStoredValue(STORAGE_KEYS.session);
  }
}

export function getStoredUsers() {
  return readStorage<LocalAuthUser[]>(STORAGE_KEYS.users, []);
}

export function saveStoredUsers(users: LocalAuthUser[]) {
  writeStorage(STORAGE_KEYS.users, users);
}

export function getProfileStore() {
  return readStorage<Record<string, { full_name: string; phone: string; avatar_url: string; created_at: string; updated_at: string }>>(
    STORAGE_KEYS.profiles,
    {}
  );
}

export function saveProfileStore(profiles: Record<string, { full_name: string; phone: string; avatar_url: string; created_at: string; updated_at: string }>) {
  writeStorage(STORAGE_KEYS.profiles, profiles);
}

export function getAddressStore() {
  return readStorage<Record<string, Array<{ id: string; user_id: string; full_name: string; phone: string; address_line1: string; address_line2: string; city: string; state: string; postal_code: string; country: string; is_default: boolean; created_at: string }>>>(
    STORAGE_KEYS.addresses,
    {}
  );
}

export function saveAddressStore(addresses: Record<string, Array<{ id: string; user_id: string; full_name: string; phone: string; address_line1: string; address_line2: string; city: string; state: string; postal_code: string; country: string; is_default: boolean; created_at: string }>>) {
  writeStorage(STORAGE_KEYS.addresses, addresses);
}

export function getOrderStore() {
  return readStorage<Record<string, Array<{ id: string; user_id: string; order_number: string; status: string; total_amount: number; shipping_address: unknown; payment_method: string; payment_status: string; created_at: string; updated_at: string; order_items: Array<{ id: string; order_id: string; product_id: string; product_name: string; product_image: string; price: number; quantity: number; created_at: string }> }>>>(
    STORAGE_KEYS.orders,
    {}
  );
}

export function saveOrderStore(orders: Record<string, Array<{ id: string; user_id: string; order_number: string; status: string; total_amount: number; shipping_address: unknown; payment_method: string; payment_status: string; created_at: string; updated_at: string; order_items: Array<{ id: string; order_id: string; product_id: string; product_name: string; product_image: string; price: number; quantity: number; created_at: string }> }>>) {
  writeStorage(STORAGE_KEYS.orders, orders);
}

export function getCartStore() {
  return readStorage<Record<string, Array<{ id: string; user_id: string; product_id: string; quantity: number; created_at: string }>>>(STORAGE_KEYS.cart, {});
}

export function saveCartStore(cart: Record<string, Array<{ id: string; user_id: string; product_id: string; quantity: number; created_at: string }>>) {
  writeStorage(STORAGE_KEYS.cart, cart);
}

export function getWishlistStore() {
  return readStorage<Record<string, Array<{ id: string; user_id: string; product_id: string; created_at: string }>>>(STORAGE_KEYS.wishlist, {});
}

export function saveWishlistStore(wishlist: Record<string, Array<{ id: string; user_id: string; product_id: string; created_at: string }>>) {
  writeStorage(STORAGE_KEYS.wishlist, wishlist);
}
