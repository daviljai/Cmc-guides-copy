export async function onRequest(context) {
  const API_KEY = context.env.CMC_API_KEY

  if (!API_KEY) {
    return new Response(
      JSON.stringify({ error: "API key not configured" }),
      { status: 500 }
    )
  }

  const url = "https://api.craftersmc.net/bazaar"

  const res = await fetch(url, {
    headers: {
      "X-API-Key": API_KEY
    }
  })

  const data = await res.json()

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30"
    }
  })
}
