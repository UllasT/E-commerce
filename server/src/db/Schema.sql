create database ecommerce;
use ecommerce;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL DEFAULT (UUID()),

  full_name VARCHAR(255) DEFAULT '',
  phone VARCHAR(50) DEFAULT '',
  avatar_url VARCHAR(500) NULL,

  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',

  refresh_token TEXT NULL,
  refresh_token_expires_at TIMESTAMP NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS categories (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  image_url VARCHAR(500) NULL,
  description TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name),
  UNIQUE KEY uq_categories_slug (slug)
);

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NULL,

  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  compare_price DECIMAL(10,2) NULL,

  image_url VARCHAR(500) NULL,
  category_id CHAR(36) NULL,

  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  stock INT DEFAULT 0,
  featured TINYINT DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_products_slug (slug),
  INDEX idx_products_category (category_id),
  INDEX idx_products_featured (featured),

  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_cart_items_user (user_id),

  CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_cart_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
  INDEX idx_wishlist_user (user_id),

  CONSTRAINT fk_wishlist_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_wishlist_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS addresses (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,

  full_name VARCHAR(255) DEFAULT '',
  phone VARCHAR(50) DEFAULT '',

  address_line1 TEXT NULL,
  address_line2 TEXT NULL,

  city VARCHAR(100) DEFAULT '',
  state VARCHAR(100) DEFAULT '',
  postal_code VARCHAR(20) DEFAULT '',
  country VARCHAR(100) DEFAULT 'India',

  is_default TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  CONSTRAINT fk_addresses_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,

  order_number VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10,2) DEFAULT 0.00,

  shipping_address JSON NULL,
  payment_method VARCHAR(50) DEFAULT 'cod',
  payment_status VARCHAR(50) DEFAULT 'pending',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_orders_order_number (order_number),
  INDEX idx_orders_user (user_id),

  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  order_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,

  product_name VARCHAR(255) DEFAULT '',
  product_image VARCHAR(500) NULL,

  price DECIMAL(10,2) DEFAULT 0.00,
  quantity INT DEFAULT 1,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_order_items_order (order_id),

  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS before_order_items_insert_reduce_stock;
DELIMITER //
CREATE TRIGGER before_order_items_insert_reduce_stock
BEFORE INSERT ON order_items
FOR EACH ROW
BEGIN
  DECLARE available_stock INT;

  SELECT stock INTO available_stock
  FROM products
  WHERE id = NEW.product_id
  FOR UPDATE;

  IF available_stock IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Product not found';
  END IF;

  IF available_stock < NEW.quantity THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Insufficient stock';
  END IF;

  UPDATE products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
END//
DELIMITER ;


