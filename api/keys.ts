export const config = { runtime: 'edge' };

/**
 * Key delivery endpoint. Returns API keys that the app needs for direct
 * connections (e.g., TinyFish SSE streaming that can't be proxied).
 *
 * Keys live in Vercel env vars — never hardcoded in the APK.
 * App authenticates with a shared app token, rotatable server-side.
 */
export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 405);
  }

  const keys: Record<string, string | undefined> = {};

  // App token for authenticating to other Citros API endpoints (e.g., /api/search)
  if (process.env.CITROS_APP_TOKEN) {
    keys.appToken = process.env.CITROS_APP_TOKEN;
  }

  if (process.env.TINYFISH_API_KEY) {
    keys.tinyfish = process.env.TINYFISH_API_KEY;
  }

  // Add future keys here as needed:
  // if (process.env.SOME_OTHER_KEY) keys.someOther = process.env.SOME_OTHER_KEY;

  return new Response(JSON.stringify({ keys }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
