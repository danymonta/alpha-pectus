// Proxy degli eventi Plausible per Cloudflare Pages (spec G.4). Su Netlify lo fa la regola 200 in netlify.toml.
export const onRequestPost = async ({ request }) => {
  const headers = new Headers();
  headers.set('Content-Type', request.headers.get('Content-Type') || 'text/plain');
  headers.set('User-Agent', request.headers.get('User-Agent') || '');
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) headers.set('X-Forwarded-For', ip);
  return fetch('https://plausible.io/api/event', { method: 'POST', headers, body: request.body });
};
