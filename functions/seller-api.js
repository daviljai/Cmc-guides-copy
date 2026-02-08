export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'GET' && request.method !== 'PUT') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    //from env secret
    const token = env.MarigoldEditToken;

    if (!token) {
        return new Response(JSON.stringify({ error: 'GitHub token not configured on server.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const githubApiUrl = 'https://api.github.com/repos/CraftersMC-Guides-Project/guides-code/contents/ranksellers/ranksellers.txt';

    const headers = {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Cloudflare-Pages-Proxy',
    };

    let body = null;
    if (request.method === 'PUT') { body = await request.text();}

    try {
        const response = await fetch(githubApiUrl, {
            method: request.method,
            headers: headers,
            body: body,
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('github api error, token may have expired:', errorData);
            return new Response(errorData, { 
                status: response.status, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
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