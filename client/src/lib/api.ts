const base = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> { const token = localStorage.getItem('rently-token'); const response = await fetch(`${base}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers } }); const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.message || 'We could not complete that request.'); return body as T; }
export const money = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
export const dateInput = (date: Date) => date.toISOString().slice(0,10);
export const rentalDays = (start: string, end: string) => Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
