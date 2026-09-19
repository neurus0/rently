import { Router } from 'express';
import { prisma } from '../prisma';
const router = Router();
const parseProduct = (p: any) => ({ ...p, images: safeJson<string[]>(p.images, []), description: safeJson<string[]>(p.description, [p.description]), specifications: safeJson<Record<string,string>>(p.specifications, {}) });
const safeJson = <T>(value: string, fallback: T): T => { try { return JSON.parse(value) as T; } catch { return fallback; } };
router.get('/', async (req, res, next) => { try {
  const q = String(req.query.q || '').trim(); const category = String(req.query.category || '').trim(); const location = String(req.query.location || '').trim(); const available = req.query.available === 'true';
  const min = Number(req.query.minPrice); const max = Number(req.query.maxPrice); const sort = String(req.query.sort || 'newest');
  const where: any = { status: 'ACTIVE', ...(category ? { category: { slug: category } } : {}), ...(location ? { location: { contains: location } } : {}), ...(available ? { availableStock: { gt: 0 } } : {}), ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] } : {}), ...(!Number.isNaN(min) && min > 0 ? { pricePerDay: { gte: min } } : {}), ...(!Number.isNaN(max) && max > 0 ? { pricePerDay: { lte: max } } : {}) };
  const orderBy: any = sort === 'price_asc' ? { pricePerDay: 'asc' } : sort === 'price_desc' ? { pricePerDay: 'desc' } : { createdAt: 'desc' };
  const products = await prisma.product.findMany({ where, orderBy, include: { category: true, seller: { select: { shopName: true, city: true, status: true } } } });
  res.json({ products: products.map(parseProduct), count: products.length });
} catch (error) { next(error); } });
router.get('/:id/availability', async (req, res, next) => { try {
  const product = await prisma.product.findUnique({ where: { id: req.params.id }, select: { id: true, status: true, availableStock: true } });
  if (!product || product.status !== 'ACTIVE') return res.status(404).json({ message: 'Product is unavailable.' });
  const start = req.query.start ? new Date(String(req.query.start)) : undefined; const end = req.query.end ? new Date(String(req.query.end)) : undefined;
  if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime())) || (start && end && end < start)) return res.status(400).json({ message: 'Please provide valid rental dates.' });
  const conflicts = start && end ? await prisma.orderItem.aggregate({ where: { productId: product.id, startDate: { lte: end }, endDate: { gte: start }, order: { status: { notIn: ['CANCELLED', 'COMPLETED'] } } }, _sum: { quantity: true } }) : null;
  const availableStock = Math.max(0, product.availableStock - (conflicts?._sum.quantity || 0));
  res.json({ available: availableStock > 0, availableStock });
} catch (error) { next(error); } });
router.get('/:id', async (req, res, next) => { try {
  const product = await prisma.product.findFirst({ where: { id: req.params.id, status: 'ACTIVE' }, include: { category: true, seller: { select: { id: true, shopName: true, description: true, city: true, status: true } } } });
  if (!product) return res.status(404).json({ message: 'We could not find this equipment.' }); res.json({ product: parseProduct(product) });
} catch (error) { next(error); } });
export default router;
