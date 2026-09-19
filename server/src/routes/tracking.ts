import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import '../types';

const router = Router();

/* ── GET /api/tracking/:codeOrId — Track order by code or ID ────────── */
router.get('/:codeOrId', async (req, res, next) => {
  try {
    const codeOrId = req.params.codeOrId as string;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { trackingCode: codeOrId },
          { id: codeOrId },
        ],
      },
      include: {
        customer: { select: { name: true, city: true, state: true } },
        seller: { select: { shopName: true, city: true } },
        items: {
          include: {
            product: { select: { name: true, images: true } },
          },
        },
        trackingEvents: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'No tracking information found for this code or order.' });
    }

    res.json({
      orderId: order.id,
      trackingCode: order.trackingCode,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      customerCity: order.customer.city,
      sellerShop: order.seller.shopName,
      sellerCity: order.seller.city,
      items: order.items.map(i => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        startDate: i.startDate,
        endDate: i.endDate,
        image: (() => {
          try {
            const arr = JSON.parse(i.product?.images || '[]');
            return arr[0] || '';
          } catch {
            return '';
          }
        })(),
      })),
      events: order.trackingEvents.map(e => ({
        id: e.id,
        status: e.status,
        description: e.description,
        timestamp: e.timestamp,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/* ── POST /api/tracking/:orderId/events — Add tracking event (Seller/Admin) */
router.post('/:orderId/events', authenticate, async (req, res, next) => {
  try {
    const { status, description } = req.body;
    if (!status || !description) {
      return res.status(400).json({ message: 'Status and description are required.' });
    }

    const orderId = req.params.orderId as string;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { seller: true },
    });

    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Validate ownership
    if (req.user!.role !== 'ADMIN') {
      const seller = await prisma.seller.findUnique({ where: { userId: req.user!.id } });
      if (!seller || seller.id !== order.sellerId) {
        return res.status(403).json({ message: 'Not authorized to update tracking for this order.' });
      }
    }

    const event = await prisma.trackingEvent.create({
      data: {
        orderId: order.id,
        status,
        description,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status },
    });

    // Create customer notification
    await prisma.notification.create({
      data: {
        userId: order.customerId,
        title: `Order Update: ${status.replace(/_/g, ' ')}`,
        message: description,
        type: 'ORDER',
        orderId: order.id,
      },
    });

    res.status(201).json({ event, message: 'Tracking event recorded.' });
  } catch (error) {
    next(error);
  }
});

export default router;
