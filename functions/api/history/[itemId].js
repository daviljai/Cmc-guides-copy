export async function onRequest({ params, env }) {
    try {
        const itemId = params.itemId

        const result = await env.DB.prepare(
            `
            SELECT fetched_at, buy_price, sell_price, buy_volume, sell_volume, avg_7d_price
            FROM bazaar_prices
            WHERE item_id = ?
            ORDER BY fetched_at ASC
            `
        )
        .bind(itemId)
        .all()

        return new Response(JSON.stringify({
            itemId,
            history: result.results
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        })

    } catch (err) {
        return new Response(JSON.stringify({
            error: err.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
