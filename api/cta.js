// Indirizzo /api/cta su Vercel. La logica sta in functions/api/cta.js (la stessa che usa Cloudflare Pages).
import * as m from '../functions/api/cta.js';
import { metodo } from './_adatta.js';

export const POST = metodo(m.onRequestPost);
