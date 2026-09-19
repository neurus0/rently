-- CreateTable
CREATE TABLE "User" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "phone" TEXT, "dateOfBirth" DATETIME, "gender" TEXT, "city" TEXT, "state" TEXT, "marketingConsent" BOOLEAN NOT NULL DEFAULT false, "role" TEXT NOT NULL DEFAULT 'CUSTOMER', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL);

-- CreateTable
CREATE TABLE "Seller" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "shopName" TEXT NOT NULL, "description" TEXT, "address" TEXT, "city" TEXT NOT NULL, "state" TEXT, "status" TEXT NOT NULL DEFAULT 'PENDING', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Seller_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE);

-- CreateTable
CREATE TABLE "Category" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "slug" TEXT NOT NULL, "description" TEXT);

-- CreateTable
CREATE TABLE "Product" ("id" TEXT NOT NULL PRIMARY KEY, "sellerId" TEXT NOT NULL, "categoryId" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT NOT NULL, "images" TEXT NOT NULL DEFAULT '[]', "pricePerDay" INTEGER NOT NULL, "pricePerWeek" INTEGER, "securityDeposit" INTEGER NOT NULL, "totalStock" INTEGER NOT NULL, "availableStock" INTEGER NOT NULL, "location" TEXT NOT NULL, "condition" TEXT NOT NULL DEFAULT 'Good', "specifications" TEXT NOT NULL DEFAULT '{}', "status" TEXT NOT NULL DEFAULT 'ACTIVE', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE);

-- CreateTable
CREATE TABLE "CartItem" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "productId" TEXT NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 1, "startDate" DATETIME NOT NULL, "endDate" DATETIME NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE);

-- CreateTable
CREATE TABLE "Order" ("id" TEXT NOT NULL PRIMARY KEY, "customerId" TEXT NOT NULL, "sellerId" TEXT NOT NULL, "rentalAmount" INTEGER NOT NULL, "securityDeposit" INTEGER NOT NULL, "commissionAmount" INTEGER NOT NULL, "totalAmount" INTEGER NOT NULL, "status" TEXT NOT NULL DEFAULT 'BOOKING_CONFIRMED', "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING', "trackingCode" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE RESTRICT ON UPDATE CASCADE);

-- CreateTable
CREATE TABLE "OrderItem" ("id" TEXT NOT NULL PRIMARY KEY, "orderId" TEXT NOT NULL, "productId" TEXT NOT NULL, "name" TEXT NOT NULL, "quantity" INTEGER NOT NULL, "startDate" DATETIME NOT NULL, "endDate" DATETIME NOT NULL, "pricePerDay" INTEGER NOT NULL, "securityDeposit" INTEGER NOT NULL, CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE);

-- CreateTable
CREATE TABLE "Payment" ("id" TEXT NOT NULL PRIMARY KEY, "transactionId" TEXT NOT NULL, "orderId" TEXT NOT NULL, "customerId" TEXT NOT NULL, "amount" INTEGER NOT NULL, "method" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Seller_userId_key" ON "Seller"("userId");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "CartItem_userId_idx" ON "CartItem"("userId");
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");
