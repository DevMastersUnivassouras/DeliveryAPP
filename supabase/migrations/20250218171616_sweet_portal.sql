/*
  # Initial Schema Setup for Restaurant Delivery App

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `email` (text)
      - `full_name` (text)
      - `address` (text)
      - `phone` (text)
      - `created_at` (timestamp)
    
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text)
      - `created_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `image_url` (text)
      - `category_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `status` (text)
      - `total` (numeric)
      - `created_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create tables
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text,
  address text,
  phone text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text NOT NULL,
  category_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  status text NOT NULL DEFAULT 'pending',
  total numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Insert initial categories
INSERT INTO categories (name, slug) VALUES
  ('Pizzas', 'pizzas'),
  ('Hamburgers', 'hamburgers'),
  ('Drinks', 'drinks'),
  ('Desserts', 'desserts');

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category_id) VALUES
  ('Margherita Pizza', 'Fresh tomatoes, mozzarella, and basil', 45.90, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3', (SELECT id FROM categories WHERE slug = 'pizzas')),
  ('Pepperoni Pizza', 'Classic pepperoni with extra cheese', 49.90, 'https://images.unsplash.com/photo-1628840042765-356cda07504e', (SELECT id FROM categories WHERE slug = 'pizzas')),
  ('Classic Burger', 'Beef patty with cheese and special sauce', 35.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', (SELECT id FROM categories WHERE slug = 'hamburgers')),
  ('Double Cheese Burger', 'Double beef patty with extra cheese', 45.90, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b', (SELECT id FROM categories WHERE slug = 'hamburgers')),
  ('Cola', 'Regular cola 350ml', 7.90, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97', (SELECT id FROM categories WHERE slug = 'drinks')),
  ('Natural Juice', 'Fresh orange juice 500ml', 12.90, 'https://images.unsplash.com/photo-1613478223719-2ab802602423', (SELECT id FROM categories WHERE slug = 'drinks')),
  ('Chocolate Cake', 'Rich chocolate cake with ganache', 18.90, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', (SELECT id FROM categories WHERE slug = 'desserts')),
  ('Ice Cream', 'Three scoops of artisanal ice cream', 15.90, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb', (SELECT id FROM categories WHERE slug = 'desserts'));