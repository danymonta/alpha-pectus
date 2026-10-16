// Indirizzo /api/lead su Vercel. La logica sta in functions/api/lead.js (la stessa che usa Cloudflare Pages).
import * as m from '../functions/api/lead.js';
import { metodo } from './_adatta.js';

export const GET = metodo(m.onRequestGet);
export const POST = metodo(m.onRequestPost);
