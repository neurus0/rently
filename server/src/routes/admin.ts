import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate, authorize } from '../middleware/auth';
import '../types';

const router = Router();
router.use(authenticate);
router.use(authorize('ADMIN'));

/* ── GET /api/admin/dashboard — Overview KPI Stats ─────────────────── */
router.get('/dashboard', async (_req, res, next) => {
  try {
    const [
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      orders,
      recentUsers,
      recentOrders,
      categories,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.seller.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({ select: { totalAmount: true, commissionAmount: true, rentalAmount: true, status: true, paymentStatus: true } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, city: true, createdAt: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, email: true } },
          seller: { select: { shopName: true } },
          items: true,
        },
      }),
      prisma.category.findMany({
        include: { _count: { select: { products: true } } },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'SUCCESS' ? o.totalAmount : 0), 0);
    const totalCommission = orders.reduce((sum, o) => sum + (o.paymentStatus === 'SUCCESS' ? o.commissionAmount : 0), 0);
    const totalRentalVolume = orders.reduce((sum, o) => sum + (o.paymentStatus === 'SUCCESS' ? o.rentalAmount : 0), 0);

    res.json({
      metrics: {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalRevenue,
        totalCommission,
        totalRentalVolume,
      },
      recentUsers,
      recentOrders,
      categoryDistribution: categories.map(c => ({
        id: c.id,
        name: c.name,
        productCount: c._count.products,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/* ── GET /api/admin/users — List all users ─────────────────────────── */
router.get('/users', async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const role = typeof req.query.role === 'string' ? req.query.role : undefined;

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        seller: { select: { id: true, shopName: true, status: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

/* ── PATCH /api/admin/users/:id/role — Change user role ────────────── */
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['CUSTOMER', 'SELLER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided.' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    res.json({ user: updated, message: `Role updated to ${role}.` });
  } catch (error) {
    next(error);
  }
});

/* ── GET /api/admin/sellers — List all sellers ─────────────────────── */
router.get('/sellers', async (req, res, next) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const where = status ? { status } : {};

    const sellers = await prisma.seller.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        _count: { select: { products: true, orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ sellers });
  } catch (error) {
    next(error);
  }
});

/* ── PATCH /api/admin/sellers/:id/status — Approve/suspend seller ──── */
router.patch('/sellers/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const seller = await prisma.seller.update({
      where: { id: req.params.id },
      data: { status },
      include: { user: true },
    });

    // If approved, ensure user has SELLER role
    if (status === 'APPROVED' && seller.user.role === 'CUSTOMER') {
      await prisma.user.update({
        where: { id: seller.userId },
        data: { role: 'SELLER' },
      });
    }

    // Send notification to user
    await prisma.notification.create({
      data: {
        userId: seller.userId,
        title: `Seller account ${status.toLowerCase()}`,
        message: `Your seller profile for "${seller.shopName}" has been updated to ${status}.`,
        type: 'SELLER',
      },
    });

    res.json({ seller, message: `Seller status updated to ${status}.` });
  } catch (error) {
    next(error);
  }
});

/* ── GET /api/admin/products — List all products across catalog ────── */
router.get('/products', async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        seller: { select: { shopName: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ products });
  } catch (error) {
    next(error);
  }
});

/* ── PATCH /api/admin/products/:id/status — Moderate product ───────── */
router.patch('/products/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid product status.' });
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ product, message: `Product status updated to ${status}.` });
  } catch (error) {
    next(error);
  }
});

/* ── GET /api/admin/orders — List all orders ───────────────────────── */
router.get('/orders', async (req, res, next) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const where = status ? { status } : {};

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        seller: { select: { id: true, shopName: true, city: true } },
        items: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

/* ── PATCH /api/admin/orders/:id/status — Admin update order status ── */
router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const allowed = ['BOOKING_CONFIRMED', 'PAYMENT_SUCCESS', 'DISPATCHED', 'DELIVERED', 'RETURN_INITIATED', 'COMPLETED', 'CANCELLED'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid order status.' });

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    await prisma.trackingEvent.create({
      data: {
        orderId: order.id,
        status,
        description: note || `Order marked as ${status.replace(/_/g, ' ').toLowerCase()} by administrator`,
      },
    });

    await prisma.notification.create({
      data: {
        userId: order.customerId,
        title: `Order Status: ${status.replace(/_/g, ' ')}`,
        message: note || `Your order #${order.trackingCode || order.id.slice(-6)} is now ${status.replace(/_/g, ' ').toLowerCase()}.`,
        type: 'ORDER',
        orderId: order.id,
      },
    });

    res.json({ order, message: `Order status updated to ${status}.` });
  } catch (error) {
    next(error);
  }
});

/* ── GET /api/admin/payments — List all payments ───────────────────── */
router.get('/payments', async (_req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        order: { select: { trackingCode: true, totalAmount: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ payments });
  } catch (error) {
    next(error);
  }
});

export default router;
