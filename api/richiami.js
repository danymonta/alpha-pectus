// Indirizzo /api/richiami su Vercel. La logica sta in functions/api/richiami.js (la stessa che usa Cloudflare Pages).
import * as m from '../functions/api/richiami.js';
import { metodo } from './_adatta.js';

export const GET = metodo(m.onRequestGet);

