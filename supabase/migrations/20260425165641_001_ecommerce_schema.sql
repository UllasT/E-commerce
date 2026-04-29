/*
  # E-Commerce Database Schema

  1. New Tables
    - `profiles` - User profiles linked to auth.users
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `avatar_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `categories` - Product categories
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `image_url` (text)
      - `description` (text)
      - `created_at` (timestamptz)

    - `products` - Product catalog
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `price` (numeric(10,2))
      - `compare_price` (numeric(10,2), optional for showing discounts)
      - `image_url` (text)
      - `category_id` (uuid, references categories)
      - `rating` (numeric(3,2), default 0)
      - `review_count` (integer, default 0)
      - `stock` (integer, default 0)
      - `featured` (boolean, default false)
      - `created_at` (timestamptz)

    - `cart_items` - Shopping cart
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_id` (uuid, references products)
      - `quantity` (integer, default 1)
      - `created_at` (timestamptz)

    - `wishlist_items` - User wishlists
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_id` (uuid, references products)
      - `created_at` (timestamptz)

    - `addresses` - User shipping addresses
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `address_line1` (text)
      - `address_line2` (text, optional)
      - `city` (text)
      - `state` (text)
      - `postal_code` (text)
      - `country` (text, default 'India')
      - `is_default` (boolean, default false)
      - `created_at` (timestamptz)

    - `orders` - Customer orders
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `order_number` (text, unique)
      - `status` (text, default 'pending')
      - `total_amount` (numeric(10,2))
      - `shipping_address` (jsonb)
      - `payment_method` (text, default 'cod')
      - `payment_status` (text, default 'pending')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `order_items` - Items within orders
      - `id` (uuid, primary key)
      - `order_id` (uuid, references orders)
      - `product_id` (uuid, references products)
      - `product_name` (text)
      - `product_image` (text)
      - `price` (numeric(10,2))
      - `quantity` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on ALL tables
    - Profiles: users can read/update own profile
    - Categories: public read
    - Products: public read
    - Cart items: users manage own cart
    - Wishlist items: users manage own wishlist
    - Addresses: users manage own addresses
    - Orders: users read own orders, insert own orders
    - Order items: users read own order items via order ownership

  3. Indexes
    - products: category_id, featured, slug
    - cart_items: user_id
    - wishlist_items: user_id, unique(user_id, product_id)
    - orders: user_id
    - order_items: order_id
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  image_url text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  compare_price numeric(10,2),
  image_url text DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  stock integer DEFAULT 0,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);

-- Wishlist items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wishlist"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address_line1 text NOT NULL DEFAULT '',
  address_line2 text DEFAULT '',
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  country text DEFAULT 'India',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  shipping_address jsonb DEFAULT '{}',
  payment_method text DEFAULT 'cod',
  payment_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name text NOT NULL DEFAULT '',
  product_image text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

-- Trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
