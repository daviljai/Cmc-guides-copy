// /functions/leaderboard-submission-api.js
export async function onRequestPost(context) {
  try {
    console.log('Pages Function: Request received');
    
    const incomingFormData = await context.request.formData();
    console.log('Pages Function: FormData parsed');

    // Debug: Check what's in the form data
    for (const [key, value] of incomingFormData.entries()) {
      console.log(`Pages Function: ${key}:`, value);
    }

    const WORKER_URL = "https://webhook-manager.craftersmcguides.workers.dev/leaderboard";
    console.log('Pages Function: Forwarding to Worker:', WORKER_URL);

    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "X-Internal-Auth": context.env.INTERNAL_KEY
      },
      body: incomingFormData
    });

    console.log('Pages Function: Worker response status:', response.status);
    
    // Return the response with CORS headers
    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": "https://craftersmc-guides.pages.dev",
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error('Pages Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://craftersmc-guides.pages.dev",
        "Content-Type": "application/json"
      }
    });
  }
}

// Also handle OPTIONS for CORS preflight
export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "https://craftersmc-guides.pages.dev",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}