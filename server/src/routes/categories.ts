import { Router } from 'express'; import { prisma } from '../prisma'; const router = Router();
router.get('/', async (_req, res, next) => { try { const categories = await prisma.category.findMany({ include: { _count: { select: { products: { where: { status: 'ACTIVE' } } } } }, orderBy: { name: 'asc' } }); res.json({ categories }); } catch (error) { next(error); } });
export default router;
