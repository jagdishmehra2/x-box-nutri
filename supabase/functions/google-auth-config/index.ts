const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, max-age=300',
}

const googleClientIdPattern = /^[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve((request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed.' }, 405)
  }

  const clientId =
    Deno.env.get('GOOGLE_CLIENT_ID') || Deno.env.get('VITE_GOOGLE_CLIENT_ID')
  const normalizedClientId = clientId?.trim() ?? ''

  if (!googleClientIdPattern.test(normalizedClientId)) {
    return json({ error: 'Login failed Please Try Again.' }, 500)
  }

  return json({ clientId: normalizedClientId })
})
