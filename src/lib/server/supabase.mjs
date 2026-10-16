// Accesso a Supabase (PostgREST) dalle Functions, con la chiave service role. Solo lato server.
export async function sb(env, method, path, body, headers = {}) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`supabase ${method} ${path.split('?')[0]}: ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}
export const configured = (env) => Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY);
