// Indirizzo /api/disiscrivi su Vercel. La logica sta in functions/api/disiscrivi.js (la stessa che usa Cloudflare Pages).
import * as m from '../functions/api/disiscrivi.js';
import { metodo } from './_adatta.js';

export const GET = metodo(m.onRequestGet);
export const POST = metodo(m.onRequestPost);
