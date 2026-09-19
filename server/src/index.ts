import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import auth from './routes/auth';
import products from './routes/products';
import categories from './routes/categories';
import cart from './routes/cart';
import orders from './routes/orders';
import payments from './routes/payments';
import sellers from './routes/sellers';
import admin from './routes/admin';
import analytics from './routes/analytics';
import marketing from './routes/marketing';
import tracking from './routes/tracking';
import notifications from './routes/notifications';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'rently-api', timestamp: new Date().toISOString() }));

app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/categories', categories);
app.use('/api/cart', cart);
app.use('/api/orders', orders);
app.use('/api/payments', payments);
app.use('/api/sellers', sellers);
app.use('/api/admin', admin);
app.use('/api/analytics', analytics);
app.use('/api/marketing', marketing);
app.use('/api/tracking', tracking);
app.use('/api/notifications', notifications);

app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  const message = error instanceof Error ? error.message : 'Something went wrong.';
  const status = message.includes('validation') || message.includes('Expected') ? 400 : 500;
  res.status(status).json({ message: status === 500 ? 'The server could not process your request.' : message });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`🚀 Rently API running at http://localhost:${port}`));
