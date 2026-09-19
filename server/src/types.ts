export type Role = 'CUSTOMER' | 'SELLER' | 'ADMIN';
export type AuthUser = { id: string; role: Role; email: string };
declare global { namespace Express { interface Request { user?: AuthUser } } }
