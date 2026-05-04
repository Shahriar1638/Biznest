# ---

## 1. The Admin (The Platform Controller)

The Admin role is designed for oversight, system configuration, and high-level financial monitoring.

* **User Oversight:** Can view all users, monitor their roles, and exercise the power to ban or unban accounts.
* **Product Moderation:** Can see every product in the database (including `pending` or `rejected` ones) and is the only role that can change a product's status to `released`/ `Banned`/ `reject`.
* **Financial Monitoring:** Has exclusive access to the `platform_revenue` table and can view every individual `seller_statement` for auditing and support.
* **Global Marketing:** Can create `admin_offers` that apply sitewide or target specific categories, products, or variants.
* **Support & Internal Notes:** Can assign tickets to themselves or others, resolve disputes, and write `private_notes` in the `ticket_admin_meta` table that the customer cannot see.
* **System Configuration:** Manages the "source of truth" data, such as creating or deleting `categories` and `regions`.

---

## 2. The Seller (The Merchant)

The Seller role focuses on catalog management, localized inventory, and business-specific marketing.

* **Catalog Management:** Can create (INSERT) and manage (UPDATE/DELETE) their own products and variants.
* **Inventory Control:** Responsible for updating `stock_count` in the `inventory` table for their specific variants across different regions.
* **Financial Tracking:** Can view their own `seller_statements` to track `gross_sales`, `inventory_fees`, and their final `net_payout`.
* **Promotions:** Can create `seller_offers` (Percent, Fixed, or BOGO) specifically for their own products to drive sales.
* **Advertising:** Can create `banners` for the storefront and manage the `banner_payments` associated with them.
* **Support:** Can open `support_tickets` for issues (like "banner_payments" or "products" or "bank_update_requests") and message admins directly through the `ticket_messages` thread.
* **Business Profile:** Updates their `store_name` and `description`, and initiates `bank_update_requests` when financial details need changing.
* **Order Fulfillment:** Can view `order_items` for products they have sold to facilitate shipping and tracking.

---

## 3. The Customer (The Consumer)

The Customer role is centered around the shopping experience, loyalty, and feedback.

* **Discovery:** Can browse all `released` products, view their various sizes/units (variants), and see active marketing `banners`.
* **Purchasing:** Can view their own `orders`, check the `payment_status` (e.g., `succeeded`, `failed`), and follow `delivery_logs` to see where their package is.
* **Personalization:** Manages a private `wishlist` of product variants they are interested in buying later.
* **Feedback & Reputation:** Can write, edit, or delete their own `reviews` and ratings for products they have interacted with.
* **Support:** Can open `support_tickets` for issues (like "payment" or "product") and message admins directly through the `ticket_messages` thread.
* **Loyalty:** Tracks their own accumulated `points` which may be used for future platform benefits.

---

## 4. Side Notes

1. I wont let anyone delete there users if they have any sorts of purchase or payment. Instead I will archive them (in users table u can see is_archive colomn.)
2. If my seller delete a product or product variant. I will check if that product have purchased by some on or no. if nobody brought that product i will let the seller to delete it (for those who have added that in cart but didnt brought yet, i will set the reference of the product null and will show message "product got removed"). and if the product was sold at least once. i will instead archive it,. [set product,status == "archieved"] and product.status will be indexed for faster query.

---
