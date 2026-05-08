-- ============================================================
-- HELPER FUNCTIONS (SECURITY DEFINER — placed in a private schema)
-- These centralize repeated checks, improve performance, and
-- keep policies DRY. Wrapped (SELECT auth.uid()) caches the
-- call once per statement instead of once per row.
-- ============================================================

-- Create the private schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS private;

-- Check if the current user is an admin
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid())
    AND role = 'admin'
  );
$$;

-- Get the customers.id for the current auth user (returns NULL if not a customer)
CREATE OR REPLACE FUNCTION private.get_customer_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM public.customers
  WHERE user_id = (SELECT auth.uid())
  LIMIT 1;
$$;

-- Get the sellers.id for the current auth user (returns NULL if not a seller)
CREATE OR REPLACE FUNCTION private.get_seller_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM public.sellers
  WHERE user_id = (SELECT auth.uid())
  LIMIT 1;
$$;

-- ============================================================
-- STEP 1: Enable RLS on ALL tables
-- ============================================================
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_financials  ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE address            ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins             ENABLE ROW LEVEL SECURITY;
ALTER TABLE products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist           ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_admin_meta  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_offers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_offer_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_offers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_offer_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_revenue   ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_statements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners             ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_payments     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: USERS TABLE
-- Everyone can read their own row. Admins can read all.
-- ============================================================
CREATE POLICY "Users see own profile"
ON users FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()));

CREATE POLICY "Admins see all users"
ON users FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- Users can update their own non-role fields (role changes = backend only)
CREATE POLICY "Users update own profile"
ON users FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

-- ============================================================
-- STEP 3: ROLE PROFILE TABLES (sellers, customers, admins)
-- ============================================================

-- SELLERS --
CREATE POLICY "Sellers see own profile"
ON sellers FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins see all seller profiles"
ON sellers FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

CREATE POLICY "Sellers update own profile"
ON sellers FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- SELLER FINANCIALS --
CREATE POLICY "Sellers see own financials"
ON seller_financials FOR SELECT
TO authenticated
USING (seller_id = (SELECT private.get_seller_id()));

CREATE POLICY "Sellers insert own financials securely"
ON seller_financials FOR INSERT
TO authenticated
WITH CHECK (
  seller_id = (SELECT private.get_seller_id())
  AND verification_status = 'pending' -- Prevents self-verifying!
);

CREATE POLICY "Admins manage all seller financials"
ON seller_financials FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- CUSTOMERS --
CREATE POLICY "Customers see own profile"
ON customers FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins see all customer profiles"
ON customers FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- RLS handles WHICH row a customer can update
CREATE POLICY "Customers update own profile"
ON customers FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- Column-level GRANT handles WHICH columns they can update (PostgreSQL feature)
-- We REVOKE general update, and GRANT update ONLY on default_shipping_address_id
REVOKE UPDATE ON customers FROM authenticated;
GRANT UPDATE (default_shipping_address_id) ON customers TO authenticated;

-- ADDRESS --
-- Users can view their own addresses
CREATE POLICY "Users see own address"  
ON address FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Admins can view all user addresses
CREATE POLICY "Admins see all addresses"  
ON address FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- Users can insert their own address
CREATE POLICY "Users insert own address"  
ON address FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

-- Users can update own address, constrained by 72-hour (3-day) cooldown
CREATE POLICY "Users update own address with cooldown"  
ON address FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()) AND updated_at <= NOW() - INTERVAL '72 hours')
WITH CHECK (user_id = (SELECT auth.uid()));

-- ADMINS --
CREATE POLICY "Admins see admin profiles"
ON admins FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- ============================================================
-- STEP 4: PRODUCTS
-- Public can see released products.
-- Sellers manage their own. Admins see all + update status.
-- ============================================================

-- Anyone (including anon) can view released products
CREATE POLICY "Anyone can view released products"
ON products FOR SELECT
TO anon, authenticated
USING (status = 'released');

-- Sellers see ALL of their own products (including pending/rejected)
CREATE POLICY "Sellers see own products"
ON products FOR SELECT
TO authenticated
USING (seller_id = (SELECT private.get_seller_id()));

-- Sellers insert products assigned to themselves
CREATE POLICY "Sellers insert own products"
ON products FOR INSERT
TO authenticated
WITH CHECK (seller_id = (SELECT private.get_seller_id()));

-- Sellers update their own products (status protection enforced in backend)
CREATE POLICY "Sellers update own products"
ON products FOR UPDATE
TO authenticated
USING (seller_id = (SELECT private.get_seller_id()))
WITH CHECK (seller_id = (SELECT private.get_seller_id()));

-- Sellers delete their own products
CREATE POLICY "Sellers delete own products"
ON products FOR DELETE
TO authenticated
USING (seller_id = (SELECT private.get_seller_id()));

-- Admins see ALL products (including pending/rejected)
CREATE POLICY "Admins see all products"
ON products FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- Admins can update product status (approve/reject)
CREATE POLICY "Admins update products"
ON products FOR UPDATE
TO authenticated
USING ((SELECT private.is_admin()));

-- ============================================================
-- STEP 5: PRODUCT VARIANTS
-- Public can read variants for released products.
-- Sellers manage variants of their own products.
-- ============================================================
CREATE POLICY "Anyone can view released product variants"
ON product_variants FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_variants.product_id
    AND products.status = 'released'
  )
);

CREATE POLICY "Sellers manage own product variants"
ON product_variants FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_variants.product_id
    AND products.seller_id = (SELECT private.get_seller_id())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_variants.product_id
    AND products.seller_id = (SELECT private.get_seller_id())
  )
);

CREATE POLICY "Admins manage all product variants"
ON product_variants FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- ============================================================
-- STEP 6: CATEGORIES & REGIONS (lookup tables)
-- Public read. Admin write.
-- ============================================================
CREATE POLICY "Anyone can read categories"
ON categories FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins manage categories"
ON categories FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "Anyone can read regions"
ON regions FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins manage regions"
ON regions FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- ============================================================
-- STEP 7: INVENTORY
-- Sellers see stock for their own product variants.
-- Admins see all.
-- ============================================================
CREATE POLICY "Sellers see own inventory"
ON inventory FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM product_variants
    JOIN products ON products.id = product_variants.product_id
    WHERE product_variants.id = inventory.variant_id
    AND products.seller_id = (SELECT private.get_seller_id())
  )
);

CREATE POLICY "Admins manage all inventory"
ON inventory FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- ============================================================
-- STEP 8: REVIEWS
-- Public can read reviews. Customers can insert reviews.
-- Customers can update/delete their own reviews.
-- ============================================================
CREATE POLICY "Anyone can read reviews"
ON reviews FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Customers insert own reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (customer_id = (SELECT private.get_customer_id()));

CREATE POLICY "Customers update own reviews"
ON reviews FOR UPDATE
TO authenticated
USING (customer_id = (SELECT private.get_customer_id()))
WITH CHECK (customer_id = (SELECT private.get_customer_id()));

CREATE POLICY "Customers delete own reviews"
ON reviews FOR DELETE
TO authenticated
USING (customer_id = (SELECT private.get_customer_id()));

CREATE POLICY "Admins manage all reviews"
ON reviews FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- ============================================================
-- STEP 9: ORDERS
-- Customers see their own orders. Admins see all.
-- INSERT/UPDATE restricted to backend (service_role).
-- ============================================================
CREATE POLICY "Customers see own orders"
ON orders FOR SELECT
TO authenticated
USING (customer_id = (SELECT private.get_customer_id()));

CREATE POLICY "Admins see all orders"
ON orders FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- ============================================================
-- STEP 10: ORDER ITEMS
-- Visible only if the parent order belongs to the customer.
-- Sellers see items they sold. Admins see all.
-- ============================================================
CREATE POLICY "Customers see own order items"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.customer_id = (SELECT private.get_customer_id())
  )
);

CREATE POLICY "Sellers see own sold items"
ON order_items FOR SELECT
TO authenticated
USING (seller_id = (SELECT private.get_seller_id()));

CREATE POLICY "Admins see all order items"
ON order_items FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- ============================================================
-- STEP 11: PAYMENTS
-- Customers see payments for their own orders. Admins see all.
-- INSERT/UPDATE restricted to backend (service_role).
-- ============================================================
CREATE POLICY "Customers see own payments"
ON payments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = payments.order_id
    AND orders.customer_id = (SELECT private.get_customer_id())
  )
);

CREATE POLICY "Admins see all payments"
ON payments FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- ============================================================
-- STEP 12: WISHLIST
-- Customers manage (SELECT/INSERT/DELETE) their own wishlist.
-- ============================================================
CREATE POLICY "Customers manage own wishlist"
ON wishlist FOR ALL
TO authenticated
USING (customer_id = (SELECT private.get_customer_id()))
WITH CHECK (customer_id = (SELECT private.get_customer_id()));

-- ============================================================
-- STEP 13: SUPPORT TICKETS
-- Users see/create/update their own tickets. Admins see + manage all.
-- ============================================================
CREATE POLICY "Users see own tickets"
ON support_tickets FOR SELECT
TO authenticated
USING (sender_id = (SELECT auth.uid()));

CREATE POLICY "Admins see all tickets"
ON support_tickets FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

CREATE POLICY "Users create own tickets"
ON support_tickets FOR INSERT
TO authenticated
WITH CHECK (sender_id = (SELECT auth.uid()));

-- Users can update their own tickets (e.g., adding context)
-- Status/assignment changes enforced in backend
CREATE POLICY "Users update own tickets"
ON support_tickets FOR UPDATE
TO authenticated
USING (sender_id = (SELECT auth.uid()))
WITH CHECK (sender_id = (SELECT auth.uid()));

-- Admins can update any ticket (status, assignment, priority, etc.)
CREATE POLICY "Admins update all tickets"
ON support_tickets FOR UPDATE
TO authenticated
USING ((SELECT private.is_admin()));

-- ============================================================
-- STEP 14: TICKET MESSAGES
-- Users see/send messages in their own tickets. Admins see/send all.
-- ============================================================
CREATE POLICY "Users see messages in own tickets"
ON ticket_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM support_tickets
    WHERE support_tickets.id = ticket_messages.ticket_id
    AND support_tickets.sender_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Admins see all ticket messages"
ON ticket_messages FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

CREATE POLICY "Users send messages in own tickets"
ON ticket_messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM support_tickets
    WHERE support_tickets.id = ticket_messages.ticket_id
    AND support_tickets.sender_id = (SELECT auth.uid())
  )
);

-- Admins can send messages in any ticket (replies)
CREATE POLICY "Admins send messages in any ticket"
ON ticket_messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = (SELECT auth.uid())
  AND (SELECT private.is_admin())
);

-- Admins can update messages (e.g., mark as read)
CREATE POLICY "Admins update ticket messages"
ON ticket_messages FOR UPDATE
TO authenticated
USING ((SELECT private.is_admin()));

-- ============================================================
-- STEP 14.5: TICKET ADMIN META (Private Notes)
-- Only admins can view and manage private notes
-- ============================================================
CREATE POLICY "Admins manage ticket admin meta"
ON ticket_admin_meta FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- ============================================================
-- STEP 15: DELIVERY LOGS
-- Customers see delivery logs for their own orders. Admins see all.
-- ============================================================
CREATE POLICY "Customers see own delivery logs"
ON delivery_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = delivery_logs.order_id
    AND orders.customer_id = (SELECT private.get_customer_id())
  )
);

CREATE POLICY "Admins manage all delivery logs"
ON delivery_logs FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- ============================================================
-- STEP 16: ADMIN OFFERS & TARGETS
-- Admin-only CRUD. Public can read active offers (for storefront display).
-- ============================================================
CREATE POLICY "Admins manage admin offers"
ON admin_offers FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- Public can see active admin offers (needed for storefront discount display)
CREATE POLICY "Anyone can view active admin offers"
ON admin_offers FOR SELECT
TO anon, authenticated
USING (is_active = TRUE AND NOW() BETWEEN starts_at AND ends_at);

CREATE POLICY "Admins manage admin offer targets"
ON admin_offer_targets FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- Public can read targets to know which products/variants/categories have offers
CREATE POLICY "Anyone can view admin offer targets"
ON admin_offer_targets FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_offers
    WHERE admin_offers.id = admin_offer_targets.offer_id
    AND admin_offers.is_active = TRUE
    AND NOW() BETWEEN admin_offers.starts_at AND admin_offers.ends_at
  )
);

-- ============================================================
-- STEP 17: SELLER OFFERS & TARGETS
-- Sellers CRUD their own offers. Admins can manage all (fallback).
-- Public can read active offers (for storefront display).
-- ============================================================
CREATE POLICY "Sellers manage own offers"
ON seller_offers FOR ALL
TO authenticated
USING (seller_id = (SELECT private.get_seller_id()))
WITH CHECK (seller_id = (SELECT private.get_seller_id()));

CREATE POLICY "Admins manage all seller offers"
ON seller_offers FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- Public can see active seller offers
CREATE POLICY "Anyone can view active seller offers"
ON seller_offers FOR SELECT
TO anon, authenticated
USING (is_active = TRUE AND NOW() BETWEEN starts_at AND ends_at);

CREATE POLICY "Sellers manage own offer targets"
ON seller_offer_targets FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM seller_offers
    WHERE seller_offers.id = seller_offer_targets.offer_id
    AND seller_offers.seller_id = (SELECT private.get_seller_id())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM seller_offers
    WHERE seller_offers.id = seller_offer_targets.offer_id
    AND seller_offers.seller_id = (SELECT private.get_seller_id())
  )
);

CREATE POLICY "Admins manage all seller offer targets"
ON seller_offer_targets FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

-- Public can read targets for active seller offers
CREATE POLICY "Anyone can view active seller offer targets"
ON seller_offer_targets FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM seller_offers
    WHERE seller_offers.id = seller_offer_targets.offer_id
    AND seller_offers.is_active = TRUE
    AND NOW() BETWEEN seller_offers.starts_at AND seller_offers.ends_at
  )
);

-- ============================================================
-- STEP 18: BANNERS & BANNER PAYMENTS
-- Sellers manage their own banners and banner payments.
-- Admins can view all banner payments.
-- Public can read active banners.
-- ============================================================
CREATE POLICY "Seller manages own banners"
ON banners FOR ALL
TO authenticated
USING (created_by = (SELECT auth.uid()))
WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "Admin full access to banners"
ON banners FOR ALL
TO authenticated
USING ((SELECT private.is_admin()))
WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY "Public reads active banners"
ON banners FOR SELECT
TO anon, authenticated
USING (
  is_active = TRUE
  AND NOW() BETWEEN starts_at AND ends_at
);

CREATE POLICY "Seller manages own banner payments"
ON banner_payments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM sellers s
    WHERE s.id = banner_payments.seller_id
    AND s.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Seller inserts own banner payments"
ON banner_payments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM sellers s
    WHERE s.id = banner_payments.seller_id
    AND s.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Admin views all banner payments"
ON banner_payments FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- ============================================================
-- STEP 19: PLATFORM REVENUE (admin view-only, auto-generated)
-- No INSERT/UPDATE/DELETE for anyone via Data API.
-- ============================================================
CREATE POLICY "Admins view platform revenue"
ON platform_revenue FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));

-- ============================================================
-- STEP 20: SELLER STATEMENTS (seller view-only, auto-generated)
-- No INSERT/UPDATE/DELETE for anyone via Data API.
-- ============================================================
CREATE POLICY "Sellers view own statements"
ON seller_statements FOR SELECT
TO authenticated
USING (seller_id = (SELECT private.get_seller_id()));

-- Admins can also view seller statements (for support/audit)
CREATE POLICY "Admins view all seller statements"
ON seller_statements FOR SELECT
TO authenticated
USING ((SELECT private.is_admin()));
