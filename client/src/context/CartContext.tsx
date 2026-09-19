import { createContext, useContext, useEffect, useState } from 'react';
import type { CartItem, Product } from '../types';

type Cart = {
  items: CartItem[];
  add: (product: Product, quantity: number, startDate: string, endDate: string) => void;
  remove: (id: string) => void;
  update: (id: string, change: Partial<Pick<CartItem, 'quantity' | 'startDate' | 'endDate'>>) => void;
  clear: () => void;
  total: number;
};

const CartContext = createContext<Cart | undefined>(undefined);
const key = 'rently-guest-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(items));
  }, [items]);

  const add = (product: Product, quantity: number, startDate: string, endDate: string) =>
    setItems(old => {
      const match = old.find(i => i.product.id === product.id && i.startDate === startDate && i.endDate === endDate);
      return match
        ? old.map(i =>
            i.id === match.id
              ? { ...i, quantity: Math.min(product.availableStock, i.quantity + quantity) }
              : i
          )
        : [
            ...old,
            {
              id: `local-${crypto.randomUUID()}`,
              product,
              quantity: Math.min(product.availableStock, quantity),
              startDate,
              endDate,
            },
          ];
    });

  const update = (id: string, change: Partial<CartItem>) =>
    setItems(old =>
      old.map(i =>
        i.id === id
          ? {
              ...i,
              ...change,
              quantity: Math.min(change.quantity ?? i.quantity, i.product.availableStock),
            }
          : i
      )
    );

  const remove = (id: string) => setItems(old => old.filter(i => i.id !== id));
  const clear = () => setItems([]);
  const total = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const x = useContext(CartContext);
  if (!x) throw new Error('CartProvider is missing');
  return x;
};
