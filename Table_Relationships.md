# Database Tables

Total Tables: **28**

## Table Names

1. users - "Users see own profile; Admins see all; Users update own profile"
2. sellers - "Sellers see own profile; Admins see all; Sellers update own profile"
3. seller_financials - "Sellers see own financials; Sellers insert own (pending only); Admins manage all"
4. seller_statements - "Sellers view own; Admins view all (auto-generated, no write)"
5. seller_offers - "Sellers manage own; Admins manage all; Public view active"
6. seller_offer_targets - "Sellers manage own; Admins manage all; Public view active offer targets"
7. customers - "Customers see own profile; Admins see all; Customers update own (address only)"
8. address - "Users see own; Admins see all; Users insert own; Users update with 72h cooldown"
9. wishlist - "Customers manage own (SELECT/INSERT/DELETE)"
10. admins - "Admins see admin profiles only"
11. platform_revenue - "Admins view only (auto-generated, no write)"
12. admin_offers - "Admins manage all; Public view active"
13. admin_offer_targets - "Admins manage all; Public view active offer targets"
14. banners - "Sellers manage own; Admins manage all; Public view active"
15. banner_payments - "Sellers manage own; Admins view all"
16. categories - "Anyone read; Admins manage all"
17. products - "Anyone view released; Sellers manage own; Admins see all + update status"
18. reviews - "Anyone read; Customers insert own; Customers update/delete own; Admins manage all"
19. product_variants - "Anyone view released product's variants; Sellers manage own product's variants; Admins manage all"
20. regions - "Anyone read; Admins manage all"
21. inventory - "Sellers see own product variants' inventory; Admins manage all"
22. orders - "Customers see own; Admins see all (INSERT/UPDATE restricted to backend)"
23. order_items - "Customers see own order items; Sellers see own sold items; Admins see all"
24. payments - "Customers see own order payments; Admins see all (INSERT/UPDATE restricted to backend)"
25. support_tickets - "Users see/create/update own; Admins see/manage all"
26. ticket_messages - "Users see/send in own tickets; Admins see/send all; Admins update all"
27. ticket_admin_meta - "Admins manage all (private notes)"
28. delivery_logs - "Customers see own order logs; Admins manage all"

## Table Relationships

These are the direct foreign-key relationships in the draft schema.

users → sellers
users → customers
users → admins
users → address
users → banners
users → support_tickets
users → ticket_messages
users → ticket_admin_meta

sellers → seller_financials
sellers → seller_statements
sellers → seller_offers
sellers → products
sellers → banner_payments

customers → address
customers → wishlist
customers → reviews
customers → orders
customers → payments
customers → support_tickets

address → users

seller_financials → sellers
seller_statements → sellers
seller_offers → sellers
seller_offer_targets → seller_offers
seller_offer_targets → products
seller_offer_targets → product_variants

admin_offer_targets → admin_offers
admin_offer_targets → products
admin_offer_targets → product_variants
admin_offer_targets → categories

banners → users
banner_payments → banners
banner_payments → sellers

products → sellers
products → categories
products → users

reviews → products
reviews → customers

product_variants → products

inventory → product_variants
inventory → regions

orders → customers
orders → regions

order_items → orders
order_items → product_variants
order_items → sellers

payments → orders

support_tickets → users
support_tickets → orders
support_tickets → products

ticket_messages → support_tickets
ticket_messages → users

ticket_admin_meta → support_tickets
ticket_admin_meta → users

delivery_logs → orders
delivery_logs → regions

platform_revenue, categories, regions, and admin_offers do not have outgoing foreign keys in this draft.
