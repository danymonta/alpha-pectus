// Indirizzo /api/result su Vercel. La logica sta in functions/api/result.js (la stessa che usa Cloudflare Pages).
import * as m from '../functions/api/result.js';
import { metodo } from './_adatta.js';

export const GET = metodo(m.onRequestGet);
