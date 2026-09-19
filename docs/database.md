# Database

The SQLite Prisma schema contains `User`, `Seller`, `Category`, `Product`, `CartItem`, `Order`, `OrderItem`, and `Payment` models.

Users have role values of CUSTOMER, SELLER, or ADMIN. Passwords are bcrypt hashes only. Products retain total and available stock, prices, condition, JSON specifications and seller/category relationships. Historical orders and payments are seeded strictly as fictional demo data to support later analytics.

Cart items store product, quantity, and rental date range. The product availability endpoint checks active overlapping order items and never returns a negative available amount.
