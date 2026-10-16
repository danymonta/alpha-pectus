// Indirizzo /api/candidatura su Vercel. La logica sta in functions/api/candidatura.js (la stessa che usa Cloudflare Pages).
import * as m from '../functions/api/candidatura.js';
import { metodo } from './_adatta.js';

export const GET = metodo(m.onRequestGet);
export const POST = metodo(m.onRequestPost);
