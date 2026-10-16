// Indirizzo /api/erasure su Vercel. La logica sta in functions/api/erasure.js (la stessa che usa Cloudflare Pages).
import * as m from '../functions/api/erasure.js';
import { metodo } from './_adatta.js';

export const POST = metodo(m.onRequestPost);
