import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, authorize } from '../middleware/auth';
import '../types';

const router = Router();
router.use(authenticate);

/* ── POST /register — Become a seller ──────────────────────────────── */
router.post('/register', async (req, res, next) => {
  try {
    const { shopName, description, address, city, state } = req.body;
    if (!shopName || !city) return res.status(400).json({ message: 'Shop name and city are required.' });

    const existing = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (existing) return res.status(409).json({ message: 'You already have a seller account.' });

    const seller = await prisma.seller.create({
      data: { userId: req.user!.id, shopName, description, address, city, state, status: 'PENDING' },
    });

    // Update user role
    await prisma.user.update({ where: { id: req.user!.id }, data: { role: 'SELLER' } });

    res.status(201).json({ seller, message: 'Seller registration submitted for review.' });
  } catch (error) {
    next(error);
  }
});

/* ── GET /me — Seller profile + stats ──────────────────────────────── */
router.get('/me', authorize('SELLER'), async (req, res, next) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: { userId: req.user!.id },
      include: {
        _count: { select: { products: true, orders: true } },
      },
    });
    if (!seller) return res.status(404).json({ message: 'Seller profile not found.' });

    const revenue = await prisma.order.aggregate({
      where: { sellerId: seller.id, paymentStatus: 'SUCCESS' },
      _sum: { rentalAmount: true },
    });

    const lowStock = await prisma.product.count({
      where: { sellerId: seller.id, status: 'ACTIVE', availableStock: { lte: 2 } },
    });

    res.json({ seller, revenue: revenue._sum.rentalAmount || 0, lowStock });
  } catch (error) {
    next(error);
  }
});

/* ── PUT /me — Update seller profile ───────────────────────────────── */
router.put('/me', authorize('SELLER'), async (req, res, next) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller) return res.status(404).json({ message: 'Seller profile not found.' });

    const { shopName, description, address, city, state } = req.body;
    const updated = await prisma.seller.update({
      where: { id: seller.id },
      data: { ...(shopName && { shopName }), ...(description && { description }), ...(address && { address }), ...(city && { city }), ...(state && { state }) },
    });
    res.json({ seller: updated });
  } catch (error) {
    next(error);
  }
});

/* ── GET /products — Seller's products ─────────────────────────────── */
router.get('/products', authorize('SELLER'), async (req, res, next) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller) return res.status(404).json({ message: 'Seller profile not found.' });

    const products = await prisma.product.findMany({
      where: { sellerId: seller.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

/* ── POST /products — Create product ───────────────────────────────── */
router.post('/products', authorize('SELLER'), async (req, res, next) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller) return res.status(404).json({ message: 'Seller profile not found.' });
    if (seller.status !== 'VERIFIED') return res.status(403).json({ message: 'Your seller account is not yet verified.' });

    const { name, description, categoryId, pricePerDay, securityDeposit, totalStock, location, condition, images, specifications } = req.body;
    if (!name || !categoryId || !pricePerDay || !securityDeposit || !totalStock || !location) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    const product = await prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId,
        name,
        description: JSON.stringify(Array.isArray(description) ? description : [description || '']),
        images: JSON.stringify(images || []),
        pricePerDay: Number(pricePerDay),
        pricePerWeek: Number(pricePerDay) * 5,
        securityDeposit: Number(securityDeposit),
        totalStock: Number(totalStock),
        availableStock: Number(totalStock),
        location,
        condition: condition || 'Good',
        specifications: JSON.stringify(specifications || {}),
      },
      include: { category: true },
    });
    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

/* ── PUT /products/:id — Update product ────────────────────────────── */
router.put('/products/:id', authorize('SELLER'), async (req, res, next) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller) return res.status(404).json({ message: 'Seller profile not found.' });

    const id = req.params.id as string;
    const existing = await prisma.product.findFirst({ where: { id, sellerId: seller.id } });
    if (!existing) return res.status(404).json({ message: 'Product not found.' });

    const { name, description, categoryId, pricePerDay, securityDeposit, totalStock, location, condition, status, images } = req.body;
    const product = await prisma.product.update({
      where: { id: existing.id },
      data: {
        ...(name && { name }),
        ...(description && { description: JSON.stringify(Array.isArray(description) ? description : [description]) }),
        ...(categoryId && { categoryId }),
        ...(pricePerDay && { pricePerDay: Number(pricePerDay), pricePerWeek: Number(pricePerDay) * 5 }),
        ...(securityDeposit && { securityDeposit: Number(securityDeposit) }),
        ...(totalStock !== undefined && { totalStock: Number(totalStock), availableStock: Number(totalStock) }),
        ...(location && { location }),
        ...(condition && { condition }),
        ...(status && { status }),
        ...(images && { images: JSON.stringify(images) }),
      },
      include: { category: true },
    });
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

/* ── DELETE /products/:id — Soft delete ────────────────────────────── */
router.delete('/products/:id', authorize('SELLER'), async (req, res, next) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller) return res.status(404).json({ message: 'Seller profile not found.' });

    const id = req.params.id as string;
    const existing = await prisma.product.findFirst({ where: { id, sellerId: seller.id } });
    if (!existing) return res.status(404).json({ message: 'Product not found.' });

    await prisma.product.update({ where: { id: existing.id }, data: { status: 'INACTIVE' } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/* ── POST /products/csv — CSV bulk upload ──────────────────────────── */
router.post('/products/csv', authorize('SELLER'), async (req, res, next) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller) return res.status(404).json({ message: 'Seller profile not found.' });
    if (seller.status !== 'VERIFIED') return res.status(403).json({ message: 'Your seller account is not yet verified.' });

    const { rows } = req.body; // Array of {name, categoryId, description, pricePerDay, securityDeposit, totalStock, location, condition}
    if (!Array.isArray(rows) || !rows.length) return res.status(400).json({ message: 'No product rows provided.' });

    const created = [];
    for (const row of rows) {
      if (!row.name || !row.categoryId || !row.pricePerDay || !row.securityDeposit || !row.totalStock || !row.location) continue;
      created.push(
        await prisma.product.create({
          data: {
            sellerId: seller.id,
            categoryId: row.categoryId,
            name: row.name,
            description: JSON.stringify([row.description || '']),
            images: JSON.stringify([]),
            pricePerDay: Number(row.pricePerDay),
            pricePerWeek: Number(row.pricePerDay) * 5,
            securityDeposit: Number(row.securityDeposit),
            totalStock: Number(row.totalStock),
            availableStock: Number(row.totalStock),
            location: row.location,
            condition: row.condition || 'Good',
            specifications: JSON.stringify({}),
          },
        }),
      );
    }
    res.status(201).json({ created: created.length, message: `${created.length} product(s) imported.` });
  } catch (error) {
    next(error);
  }
});

/* ── GET /orders — Seller's orders ─────────────────────────────────── */
router.get('/orders', authorize('SELLER'), async (req, res, next) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller) return res.status(404).json({ message: 'Seller profile not found.' });

    const orders = await prisma.order.findMany({
      where: { sellerId: seller.id },
      include: {
        items: true,
        customer: { select: { name: true, email: true, phone: true, city: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

/* ── PATCH /orders/:id/status — Update order status ────────────────── */
router.patch('/orders/:id/status', authorize('SELLER'), async (req, res, next) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller) return res.status(404).json({ message: 'Seller profile not found.' });

    const id = req.params.id as string;
    const order = await prisma.order.findFirst({ where: { id, sellerId: seller.id } });
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const { status, description } = req.body;
    const validStatuses = ['READY_FOR_PICKUP', 'DISPATCHED', 'DELIVERED', 'IN_USE', 'RETURN_INITIATED', 'RETURNED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status.' });

    await prisma.order.update({ where: { id: order.id }, data: { status } });

    await prisma.trackingEvent.create({
      data: { orderId: order.id, status, description: description || `Order status updated to ${status.replace(/_/g, ' ').toLowerCase()}` },
    });

    // If completed or cancelled, return stock
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { availableStock: { increment: item.quantity } },
        });
      }
    }

    // Notification
    await prisma.notification.create({
      data: {
        userId: order.customerId,
        title: `Order ${order.trackingCode} — ${status.replace(/_/g, ' ').toLowerCase()}`,
        message: description || `Your order status has been updated to ${status.replace(/_/g, ' ').toLowerCase()}.`,
        type: 'ORDER',
        orderId: order.id,
      },
    });

    res.json({ message: 'Order status updated.' });
  } catch (error) {
    next(error);
  }
});

/* ── GET /inventory — Inventory overview ───────────────────────────── */
router.get('/inventory', authorize('SELLER'), async (req, res, next) => {
  try {
    const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
    if (!seller) return res.status(404).json({ message: 'Seller profile not found.' });

    const products = await prisma.product.findMany({
      where: { sellerId: seller.id },
      select: { id: true, name: true, totalStock: true, availableStock: true, status: true, category: { select: { name: true } } },
      orderBy: { availableStock: 'asc' },
    });
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

export default router;
