/**
 * Central API base URL.
 * In development, Vite proxies /api → localhost:5000
 * In production, reads VITE_API_URL from .env (set on Vercel)
 */
export const API_BASE = import.meta.env.VITE_API_URL || '';
