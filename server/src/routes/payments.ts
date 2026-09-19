import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import '../types';

const router = Router();
router.use(authenticate);

/* ── POST /api/payments — Demo payment processing ──────────────────── */
router.post('/', async (req, res, next) => {
  try {
    const { orderId, method = 'UPI' } = req.body;
    const normalizedMethod = String(method).replace(/^Demo\s+/i, '').toUpperCase();
    if (!orderId) return res.status(400).json({ message: 'Order ID is required.' });

    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: req.user!.id },
    });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (order.paymentStatus === 'SUCCESS') return res.status(400).json({ message: 'This order has already been paid.' });

    const payment = await prisma.payment.create({
      data: {
        transactionId: `TXN-${Date.now().toString(36).toUpperCase()}`,
        orderId: order.id,
        customerId: req.user!.id,
        amount: order.totalAmount,
        method: normalizedMethod,
        status: 'SUCCESS',
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'SUCCESS', status: 'PAYMENT_SUCCESS' },
    });

    // Create tracking event
    await prisma.trackingEvent.create({
      data: { orderId: order.id, status: 'PAYMENT_SUCCESS', description: `Payment of ₹${order.totalAmount} received via ${normalizedMethod}` },
    });

    // Notification
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: `Payment confirmed — ${order.trackingCode}`,
        message: `₹${order.totalAmount} paid successfully via ${normalizedMethod}.`,
        type: 'PAYMENT',
        orderId: order.id,
      },
    });

    res.status(201).json({ payment, message: 'Payment processed successfully.' });
  } catch (error) {
    next(error);
  }
});

/* ── GET /api/payments/:orderId — Payment status ───────────────────── */
router.get('/:orderId', async (req, res, next) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { orderId: req.params.orderId },
    });
    if (!payment) return res.status(404).json({ message: 'No payment found for this order.' });
    res.json({ payment });
  } catch (error) {
    next(error);
  }
});

export default router;
