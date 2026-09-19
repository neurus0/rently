import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
const router = Router(); router.use(authenticate);
const cartShape = z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(50), startDate: z.coerce.date(), endDate: z.coerce.date() });
const dates = cartShape.refine(v => v.endDate >= v.startDate, { message: 'End date must be after start date.' });
const include = { product: { include: { category: true, seller: { select: { shopName: true } } } } } as const;
async function validate(data: z.infer<typeof dates>) { const product = await prisma.product.findFirst({ where: { id: data.productId, status: 'ACTIVE' } }); if (!product) throw new Error('This equipment is no longer available.'); if (data.quantity > product.availableStock) throw new Error(`Only ${product.availableStock} unit(s) are currently available.`); return product; }
router.get('/', async (req, res, next) => { try { const items = await prisma.cartItem.findMany({ where: { userId: req.user!.id }, include, orderBy: { createdAt: 'desc' } }); res.json({ items }); } catch (error) { next(error); } });
router.post('/', async (req, res, next) => { try { const data = dates.parse(req.body); await validate(data); const item = await prisma.cartItem.create({ data: { ...data, userId: req.user!.id }, include }); res.status(201).json({ item }); } catch (error) { next(error); } });
router.patch('/:id', async (req, res, next) => { try { const existing = await prisma.cartItem.findFirst({ where: { id: req.params.id, userId: req.user!.id } }); if (!existing) return res.status(404).json({ message: 'Cart item not found.' }); const data = cartShape.partial().parse(req.body); const proposed = { productId: existing.productId, quantity: data.quantity ?? existing.quantity, startDate: data.startDate ?? existing.startDate, endDate: data.endDate ?? existing.endDate }; if (proposed.endDate < proposed.startDate) return res.status(400).json({ message: 'End date must be after start date.' }); await validate(proposed); const item = await prisma.cartItem.update({ where: { id: existing.id }, data, include }); res.json({ item }); } catch (error) { next(error); } });
router.delete('/:id', async (req, res, next) => { try { const result = await prisma.cartItem.deleteMany({ where: { id: req.params.id, userId: req.user!.id } }); if (!result.count) return res.status(404).json({ message: 'Cart item not found.' }); res.status(204).send(); } catch (error) { next(error); } });
export default router;
