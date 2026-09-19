import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import '../types';

const router = Router();
router.use(authenticate);

/* ── POST /api/orders — Create order from cart ──────────────────────── */
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: { include: { seller: true } } },
    });

    if (!cartItems.length) return res.status(400).json({ message: 'Your cart is empty.' });

    // Validate stock
    for (const item of cartItems) {
      if (item.product.status !== 'ACTIVE')
        return res.status(400).json({ message: `${item.product.name} is no longer available.` });
      if (item.quantity > item.product.availableStock)
        return res.status(400).json({ message: `Only ${item.product.availableStock} unit(s) of ${item.product.name} are available.` });
    }

    // Group items by seller
    const bySeller = new Map<string, typeof cartItems>();
    for (const item of cartItems) {
      const sellerId = item.product.sellerId;
      if (!bySeller.has(sellerId)) bySeller.set(sellerId, []);
      bySeller.get(sellerId)!.push(item);
    }

    const orders = [];
    for (const [sellerId, items] of bySeller) {
      const rentalAmount = items.reduce((sum, item) => {
        const days = Math.max(1, Math.ceil((item.endDate.getTime() - item.startDate.getTime()) / 86400000) + 1);
        return sum + item.product.pricePerDay * item.quantity * days;
      }, 0);
      const securityDeposit = items.reduce((sum, item) => sum + item.product.securityDeposit * item.quantity, 0);
      const commissionAmount = Math.round(rentalAmount * 0.1);
      const totalAmount = rentalAmount + securityDeposit;

      const order = await prisma.order.create({
        data: {
          customerId: userId,
          sellerId,
          rentalAmount,
          securityDeposit,
          commissionAmount,
          totalAmount,
          status: 'BOOKING_CONFIRMED',
          paymentStatus: 'PENDING',
          trackingCode: `RNT-${Date.now().toString(36).toUpperCase().slice(-6)}`,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              name: item.product.name,
              quantity: item.quantity,
              startDate: item.startDate,
              endDate: item.endDate,
              pricePerDay: item.product.pricePerDay,
              securityDeposit: item.product.securityDeposit,
            })),
          },
        },
        include: { items: true },
      });

      // Decrement stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { availableStock: { decrement: item.quantity } },
        });
      }

      // Create initial tracking event
      await prisma.trackingEvent.create({
        data: { orderId: order.id, status: 'BOOKING_CONFIRMED', description: 'Order placed and confirmed' },
      });

      // Notification for customer
      await prisma.notification.create({
        data: {
          userId,
          title: `Order ${order.trackingCode} confirmed`,
          message: `Your rental order has been placed successfully. Total: ₹${totalAmount}`,
          type: 'ORDER',
          orderId: order.id,
        },
      });

      orders.push(order);
    }

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId } });

    res.status(201).json({ orders });
  } catch (error) {
    next(error);
  }
});

/* ── GET /api/orders — List user's orders ──────────────────────────── */
router.get('/', async (req, res, next) => {
  try {
    const where = req.user!.role === 'ADMIN' ? {} : { customerId: req.user!.id };
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: { select: { images: true, category: { select: { name: true } } } } } },
        seller: { select: { shopName: true, city: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

/* ── GET /api/orders/:id — Single order detail ─────────────────────── */
router.get('/:id', async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, ...(req.user!.role === 'ADMIN' ? {} : { customerId: req.user!.id }) },
      include: {
        items: { include: { product: { select: { images: true, category: { select: { name: true } } } } } },
        seller: { select: { shopName: true, city: true } },
        customer: { select: { name: true, email: true, phone: true, city: true } },
        payment: true,
        trackingEvents: { orderBy: { timestamp: 'asc' } },
      },
    });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

export default router;
