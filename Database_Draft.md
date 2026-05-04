# My DB Initial Idea

## Core User Table

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL, -- e.g., '<user@example.com>'
    password_hash TEXT NOT NULL,         -- e.g., '$2b$12$KIs...'
    name VARCHAR(100) NOT NULL,          -- e.g., 'Shahriar Hossain'
    phone VARCHAR(20),                   -- e.g., '+8801700000000'
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'customer', 'seller')),
    gender VARCHAR(10),                  -- e.g., 'male', 'female', 'other'
    photo_url TEXT,
    is_banned BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

## Seller Profile (Linked 1:1 with users)

CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    store_description TEXT
);

CREATE TABLE seller_financials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID UNIQUE REFERENCES sellers(id) ON DELETE CASCADE,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    business_registration_number VARCHAR(100),
    bank_account_details JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seller_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE RESTRICT,

    period_start DATE NOT NULL,  -- always store as first day: '2026-04-01'

    gross_sales NUMERIC(12,2) DEFAULT 0,          -- before any discounts
    seller_funded_discounts NUMERIC(12,2) DEFAULT 0, 
    admin_funded_discounts NUMERIC(12,2) DEFAULT 0, -- for record only
    inventory_fee NUMERIC(12,2) DEFAULT 0,         -- platform charge for inventory management

    net_payout NUMERIC(12,2) GENERATED ALWAYS AS (gross_sales - seller_funded_discounts - inventory_fee) STORED,

    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(seller_id, period_start),
    CHECK (EXTRACT(DAY FROM period_start) = 1)
);

## Offers Provided by Sellers

-- Offer calculation pipeline: raw_price -> apply seller offer -> apply admin offer -> apply tax (5%)

CREATE TYPE seller_offer_type AS ENUM ('percent', 'fixed', 'bogo');

CREATE TABLE seller_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,

    title VARCHAR(150) NOT NULL,          -- e.g. "20% Off Summer Sale"
    type seller_offer_type NOT NULL,      -- percent/fixed/bogo

    percent_off NUMERIC(5,2),             -- for percent
    fixed_off NUMERIC(12,2),              -- for fixed amount (e.g. 20 tk off)
    buy_qty INT,                          -- for BOGO
    get_qty INT,                          -- for BOGO

    priority INT DEFAULT 0,               -- higher number = higher priority if multiple seller offers exist
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (ends_at > starts_at),
    CHECK (percent_off IS NULL OR percent_off <= 80),
    CHECK (
      (type = 'percent' AND percent_off IS NOT NULL AND fixed_off IS NULL AND buy_qty IS NULL AND get_qty IS NULL)
      OR
      (type = 'fixed' AND fixed_off IS NOT NULL AND percent_off IS NULL AND buy_qty IS NULL AND get_qty IS NULL)
      OR
      (type = 'bogo' AND buy_qty IS NOT NULL AND get_qty IS NOT NULL AND percent_off IS NULL AND fixed_off IS NULL)
    )
);

CREATE TYPE seller_offer_target AS ENUM ('product', 'variant');

CREATE TABLE seller_offer_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID REFERENCES seller_offers(id) ON DELETE CASCADE,
    target_type seller_offer_target NOT NULL,

    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,

    CHECK (
      (target_type = 'product' AND product_id IS NOT NULL AND variant_id IS NULL)
      OR
      (target_type = 'variant' AND variant_id IS NOT NULL AND product_id IS NULL)
    ),
    UNIQUE(offer_id, product_id),
    UNIQUE(offer_id, variant_id)
);

## Customer Profile (Linked 1:1 with users)

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255),    -- For saved cards/1-click checkout
    default_shipping_address_id UUID REFERENCES address(id) ON DELETE SET NULL, -- Specific delivery drop-off point
    points INT DEFAULT 0                -- e.g., Loyalty points
);

## Customer Address

CREATE TABLE address (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_line TEXT NOT NULL,
    house_no VARCHAR(50),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    region VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

## Customer Wishlist

CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, variant_id) -- Prevents duplicate entries for the same product variant
);

## Admin Profile (Linked 1:1 with users)

CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    salary DECIMAL(15, 2) DEFAULT 0.00
);

CREATE TABLE platform_revenue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start DATE NOT NULL UNIQUE,

    revenue_from_inventory_fee NUMERIC(12,2) DEFAULT 0,
    revenue_from_other_fees NUMERIC(12,2) DEFAULT 0,

    admin_funded_discounts_cost NUMERIC(12,2) DEFAULT 0,  -- expense
    net_platform_revenue NUMERIC(12,2) GENERATED ALWAYS AS (revenue_from_inventory_fee + revenue_from_other_fees - admin_funded_discounts_cost) STORED,

    new_users INT DEFAULT 0,
    new_sellers INT DEFAULT 0,

    generated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (EXTRACT(DAY FROM period_start) = 1)
);

## Offers provided by Admin panels

-- These apply after seller offers in the discount pipeline.

CREATE TYPE admin_offer_type AS ENUM ('percent', 'fixed');

CREATE TABLE admin_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(150) NOT NULL,
    type admin_offer_type NOT NULL,          -- percent or fixed

    percent_off NUMERIC(5,2),                -- e.g. 5.00 = 5%
    fixed_off NUMERIC(12,2),                 -- e.g. 20 taka off

    is_global BOOLEAN DEFAULT FALSE,         -- TRUE = applies to entire site
    stacks_with_seller_offers BOOLEAN DEFAULT TRUE,

    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (ends_at > starts_at),
    CHECK (
      (type = 'percent' AND percent_off IS NOT NULL AND fixed_off IS NULL)
      OR
      (type = 'fixed' AND fixed_off IS NOT NULL AND percent_off IS NULL)
    )
);

CREATE TYPE admin_offer_target AS ENUM ('product', 'variant', 'category');

CREATE TABLE admin_offer_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID REFERENCES admin_offers(id) ON DELETE CASCADE,
    target_type admin_offer_target,

    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,

    CHECK (
      (target_type = 'product' AND product_id IS NOT NULL AND variant_id IS NULL AND category_id IS NULL)
      OR
      (target_type = 'variant' AND variant_id IS NOT NULL AND product_id IS NULL AND category_id IS NULL)
      OR
      (target_type = 'category' AND category_id IS NOT NULL AND product_id IS NULL AND variant_id IS NULL)
    ),
    UNIQUE(offer_id, product_id),
    UNIQUE(offer_id, variant_id),
    UNIQUE(offer_id, category_id)
);

## Banner published by Admin and Seller

CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    created_by UUID REFERENCES users(id) ON DELETE RESTRICT,
    -- Only the creator (seller) or admin will have permission to CRUD via RLS

    title VARCHAR(200),
    subtitle VARCHAR(300),
    img_url TEXT NOT NULL,
    redirect_url TEXT,

    description TEXT,      -- replaces banner_position enum
                           -- e.g.: "hero section", "eid special", "new product ad"

    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE banner_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banner_id UUID REFERENCES banners(id) ON DELETE RESTRICT,
    seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

## Categories (Normalizing the string 'category' from NoSQL)

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL -- e.g., 'Groceries', 'Electronics'
);

## General Product Table

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE RESTRICT,
    category_id INT REFERENCES categories(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    product_imgurl TEXT,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'released', 'rejected', 'archived')),
    metadata JSONB,                       -- e.g., {"brand": "Lays", "flavor": "Spicy"}
    status_updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

## Product Reviews / Ratings

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    rate INT CHECK (rate >= 1 AND rate <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, customer_id)
);

## Product Variants (The "Juice Bottle" sizes or "Chips Bag" weights)

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    unit_type VARCHAR(50), -- e.g., 'Volume', 'Weight', 'Size', 'pieces'
    unit_name VARCHAR(50), -- e.g., '1 Liter', '1kg', 'Large', '6 piece' [note: i will assume pieces type stuff comes with package such as 6 piece package 12 piece package 4 piece etc etc so for them each package stock count will be one]
    price DECIMAL(12, 2) NOT NULL, -- e.g., 150.00
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

## Regions Table

CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL -- e.g., 'Mirpur', 'Bashundhara'
);

## Regional Inventory (The Junction Table)

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    region_id INT REFERENCES regions(id) ON DELETE CASCADE,
    stock_count INT DEFAULT 0 CHECK (stock_count >= 0),
    UNIQUE(variant_id, region_id) -- Prevents duplicate region entries for one variant
);

## Orders Table

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    region_id INT REFERENCES regions(id) ON DELETE RESTRICT,
    total_amount DECIMAL(15, 2) NOT NULL,
    delivery_status VARCHAR(50) DEFAULT 'processing' CHECK (delivery_status IN ('processing', 'shipped', 'out-for-delivery', 'delivered')),
    order_status VARCHAR(50) DEFAULT 'cart' CHECK (order_status IN ('cart', 'processing', 'archived', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

## Order Items (Snapshot table)

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    seller_id UUID REFERENCES sellers(id) ON DELETE RESTRICT,
    quantity INT NOT NULL,          -- e.g., 3
    price_at_purchase DECIMAL(12, 2) NOT NULL, -- e.g., 150.00 (captures current price)
    product_name_snapshot VARCHAR(255) NOT NULL,
    variant_label_snapshot VARCHAR(100),
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id, variant_id)
);

## Payments Table (Sensitive data)

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
    stripe_intent_id VARCHAR(255),  -- e.g., 'pi_3P4k...'
    transaction_id VARCHAR(255),    -- Final bank/gateway receipt ID
    payment_method_id VARCHAR(255), -- e.g., 'pm_1N...'
    amount DECIMAL(15, 2) NOT NULL,
    payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'succeeded', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

## Contact Messages / Feedback

CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Human-readable ID (e.g., BN-2026-X1)
    reference_id VARCHAR(50) UNIQUE NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    -- Categorization
    issue_category VARCHAR(50) NOT NULL, -- e.g., 'payment', 'product'
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'open', 'resolved', 'disputed')),

    -- Admin side only
    assigned_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Context (Optional)
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Who sent this specific message?

    message_body TEXT NOT NULL,
    read_at TIMESTAMPTZ, -- Single timestamp replaces buggy booleans
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ticket_admin_meta (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id    UUID UNIQUE REFERENCES support_tickets(id) ON DELETE CASCADE,
    private_notes TEXT,
    resolved_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at   TIMESTAMPTZ
);

## Delivery Tracking (Initial groundwork)

CREATE TABLE delivery_logs ( [note: i dont have any plan to add a Delivery role to add to our multi tenant SaaS application so we will keep this part simple.]
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    current_region_id INT REFERENCES regions(id) ON DELETE SET NULL,
    delivery_status VARCHAR(50), -- e.g., 'out-for-delivery'
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

## CRITICAL SYSTEM DESIGN INDEXES

## 1. Cart Conflation Protection

CREATE UNIQUE INDEX one_cart_per_customer ON orders(customer_id) WHERE order_status = 'cart';

## 2. GIN Index for JSONB Metadata searching (Flexible category search)

CREATE INDEX idx_product_metadata ON products USING GIN (metadata);

## 3. Partial Index for Active Products only (Reduces index size)

CREATE INDEX idx_active_products ON products(product_name) WHERE status = 'released';

## 4. Composite Index for Customer Order Status (FAST "My Orders" and "Cart" lookups)

CREATE INDEX idx_customer_orders ON orders(customer_id, order_status);

## 5. Sellers browsing their own catalog (very frequent)

CREATE INDEX idx_products_seller ON products(seller_id);

## 6. Loading variants for a product page

CREATE INDEX idx_variants_product ON product_variants(product_id);

## 7. Loading reviews for a product

CREATE INDEX idx_reviews_product ON reviews(product_id);

## 8. Loading items inside an order

CREATE INDEX idx_order_items_order ON order_items(order_id);

## 9. User viewing their support tickets

CREATE INDEX idx_tickets_sender ON support_tickets(sender_id);

## 10. Loading messages in a ticket thread

CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);

## 11. Seller browsing their own offers

CREATE INDEX idx_seller_offers_seller ON seller_offers(seller_id);

## 12. Seller viewing their own statements

CREATE INDEX idx_seller_statements_seller ON seller_statements(seller_id);

## 13. Offer target lookups

CREATE INDEX idx_seller_offer_targets_offer ON seller_offer_targets(offer_id);
CREATE INDEX idx_seller_offer_targets_product ON seller_offer_targets(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_seller_offer_targets_variant ON seller_offer_targets(variant_id) WHERE variant_id IS NOT NULL;

CREATE INDEX idx_admin_offer_targets_offer ON admin_offer_targets(offer_id);
CREATE INDEX idx_admin_offer_targets_product ON admin_offer_targets(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_admin_offer_targets_variant ON admin_offer_targets(variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX idx_admin_offer_targets_category ON admin_offer_targets(category_id) WHERE category_id IS NOT NULL;

CREATE INDEX idx_seller_offers_active ON seller_offers(starts_at, ends_at) WHERE is_active = TRUE;
CREATE INDEX idx_admin_offers_active ON admin_offers(starts_at, ends_at) WHERE is_active = TRUE;

## 14. Platform revenue and statements by month

-- Note: UNIQUE constraints on these tables automatically generate their own indexes.
