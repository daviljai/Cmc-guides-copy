export async function onRequest({ env }) {
  const res = await fetch(
    'https://api.craftersmc.net/v1/skyblock/bazaar/items',
    {
      headers: {
        'User-Agent': 'Bazaar-Tracker/1.0',
        'Accept': 'application/json',
        'x-api-key': env.CMC_API_KEY || env.cmc_api_key || env['cmc-api-key']
      }
    }
  )

  if (!res.ok) {
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch item list',
        status: res.status
      }),
      { status: 500 }
    )
  }

  const data = await res.json()

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}
