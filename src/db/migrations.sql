-- ============================================
-- 1. COMPANIES
-- ============================================
CREATE TABLE companies (
  id            VARCHAR(20) PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. USERS
-- ============================================
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(150) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(50) NOT NULL,
  permissions     TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMP NULL
);

CREATE TABLE user_companies (
  user_id     INTEGER NOT NULL REFERENCES users(id),
  company_id  VARCHAR(20) NOT NULL REFERENCES companies(id),
  PRIMARY KEY (user_id, company_id)
);

-- ============================================
-- 3. PRODUCTS
-- ============================================
CREATE TABLE products (
  id            SERIAL PRIMARY KEY,
  company_id    VARCHAR(20) NOT NULL REFERENCES companies(id),
  name          VARCHAR(150) NOT NULL,
  unit          VARCHAR(20) NOT NULL,
  attributes    JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMP NULL
);

CREATE INDEX idx_products_attributes ON products USING GIN (attributes);
CREATE INDEX idx_products_company ON products (company_id);

-- ============================================
-- 4. RAW MATERIALS
-- ============================================
CREATE TABLE raw_materials (
  id            SERIAL PRIMARY KEY,
  company_id    VARCHAR(20) NOT NULL REFERENCES companies(id),
  name          VARCHAR(150) NOT NULL,
  unit          VARCHAR(20) NOT NULL,
  attributes    JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMP NULL
);

CREATE INDEX idx_raw_materials_company ON raw_materials (company_id);

-- ============================================
-- 5. PRODUCTION BATCHES (snapshot pattern)
-- ============================================
CREATE TABLE batches (
  id                SERIAL PRIMARY KEY,
  company_id        VARCHAR(20) NOT NULL REFERENCES companies(id),
  product_id        INTEGER NOT NULL REFERENCES products(id),
  quantity          NUMERIC(14,4) NOT NULL CHECK (quantity > 0),
  product_snapshot  JSONB NOT NULL,
  produced_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMP NULL
);

CREATE INDEX idx_batches_company ON batches (company_id);
CREATE INDEX idx_batches_product ON batches (product_id);
CREATE INDEX idx_batches_produced_at ON batches (produced_at);

-- ============================================
-- 6. RAW MATERIAL STOCK MOVEMENTS
-- ============================================
CREATE TABLE raw_material_movements (
  id                SERIAL PRIMARY KEY,
  raw_material_id   INTEGER NOT NULL REFERENCES raw_materials(id),
  batch_id          INTEGER NULL REFERENCES batches(id),
  type              VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'usage')),
  quantity           NUMERIC(14,4) NOT NULL CHECK (quantity > 0),
  movement_date      DATE NOT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rm_movements_material ON raw_material_movements (raw_material_id);
CREATE INDEX idx_rm_movements_date ON raw_material_movements (movement_date);

-- ============================================
-- 7. PRODUCT STOCK MOVEMENTS
-- ============================================
CREATE TABLE product_movements (
  id             SERIAL PRIMARY KEY,
  product_id     INTEGER NOT NULL REFERENCES products(id),
  batch_id       INTEGER NULL REFERENCES batches(id),
  type           VARCHAR(20) NOT NULL CHECK (
                   type IN ('production_in', 'sale_out', 'refund_in', 'repair_out', 'repair_in')
                 ),
  quantity       NUMERIC(14,4) NOT NULL CHECK (quantity > 0),
  movement_date  DATE NOT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_movements_product ON product_movements (product_id);
CREATE INDEX idx_product_movements_date ON product_movements (movement_date);