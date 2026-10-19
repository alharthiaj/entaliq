-- Madar Tech store schema (PostgreSQL 13+). Safe to run more than once.
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mime text NOT NULL,
  data bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  image_id uuid REFERENCES images(id) ON DELETE SET NULL,
  sort int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  subs jsonb NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  sku text,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  desc_ar text NOT NULL DEFAULT '',
  desc_en text NOT NULL DEFAULT '',
  brand text NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id),
  tags text[] NOT NULL DEFAULT '{}',
  features text[] NOT NULL DEFAULT '{}',
  price int NOT NULL,
  compare_price int,
  stock int NOT NULL DEFAULT 10,
  active boolean NOT NULL DEFAULT true,
  is_new boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  deal boolean NOT NULL DEFAULT false,
  popularity int NOT NULL DEFAULT 0,
  rating real,
  reviews int NOT NULL DEFAULT 0,
  images uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);

CREATE TABLE IF NOT EXISTS slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_ar text NOT NULL DEFAULT '', tag_en text NOT NULL DEFAULT '',
  title_ar text NOT NULL, title_en text NOT NULL,
  text_ar text NOT NULL DEFAULT '', text_en text NOT NULL DEFAULT '',
  image_id uuid REFERENCES images(id) ON DELETE SET NULL,
  link text NOT NULL DEFAULT '/',
  bg_from text NOT NULL DEFAULT '#0a0f1f', bg_to text NOT NULL DEFAULT '#3a1f6b', glow text NOT NULL DEFAULT '#7c5cff',
  price_from int,
  sort int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 10001;
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number int NOT NULL UNIQUE DEFAULT nextval('order_number_seq'),
  status text NOT NULL DEFAULT 'pending',
  pay_status text NOT NULL DEFAULT 'unpaid',
  pay_method text NOT NULL,
  pay_ref text,
  name text NOT NULL, phone text NOT NULL, email text NOT NULL DEFAULT '',
  city text NOT NULL, district text NOT NULL DEFAULT '', address text NOT NULL, notes text NOT NULL DEFAULT '',
  subtotal int NOT NULL, shipping int NOT NULL, cod_fee int NOT NULL DEFAULT 0, total int NOT NULL,
  history jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name_ar text NOT NULL, name_en text NOT NULL,
  price int NOT NULL, qty int NOT NULL
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, company text NOT NULL DEFAULT '', phone text NOT NULL, email text NOT NULL DEFAULT '', note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pages (
  slug text PRIMARY KEY,
  title_ar text NOT NULL, title_en text NOT NULL,
  body_ar text NOT NULL DEFAULT '', body_en text NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);
