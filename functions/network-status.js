export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    // try multiple common env names for the secret
    const token = env.cmc_api_key || env.CMC_API_KEY || env['cmc-api-key'] || env.cmcApiKey || env.CMCAPIKEY;

    // possible API hosts (primary first)
    const apiUrls = [
        'https://api.craftersmc.net/v1/network/status',
        'https://craftersmc.net/v1/network/status',
        'https://craftersmc.net/api/v1/network/status'
    ];

    const headers = {
        'Accept': 'application/json',
        'User-Agent': 'Cloudflare-Pages-Proxy'
    };

    if (token) {
        // common header name for API keys
        headers['x-api-key'] = token;
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        let lastError = null;
        let response = null;
        for (const url of apiUrls) {
            try {
                response = await fetch(url, { method: 'GET', headers });
            } catch (err) {
                lastError = err;
                continue;
            }
            if (response && response.ok) break;
        }

        if (!response) {
            return new Response(JSON.stringify({ error: 'No response from upstream API', details: lastError?.message }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (!response.ok) {
            const text = await response.text();
            return new Response(text, {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const data = await response.text();
        return new Response(data, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('proxy error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}