// Adattatore Vercel: riusa le funzioni scritte per Cloudflare Pages (functions/api/*.js) senza duplicarle.
// Il file inizia con "_": Vercel non lo espone come indirizzo.
import { waitUntil } from '@vercel/functions';

const env = process.env;
export const metodo = (handler) => (request) => handler({ request, env, waitUntil });
