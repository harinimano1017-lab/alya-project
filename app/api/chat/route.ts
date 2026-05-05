export const maxDuration = 30;

export async function POST(req: Request) {
  console.log("-----------------------------------------");
  console.log("[Chat API] Received a POST request for Gemini!");
  
  try {
    const body = await req.json();
    
    if (!body.messages || body.messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Gemini API key is not configured on the server." }), { status: 500 });
    }

    // Convert standard messages format to Gemini format
    const geminiContents = body.messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    console.log("[Chat API] Initiating direct fetch to Gemini API...");
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: geminiContents,
        systemInstruction: {
          parts: [{ text: 'You are an AI Tutor for a visual e-learning platform. Your goal is to help students understand the concepts they are learning. Be encouraging, clear, and concise. Do not give them exact answers to homework, but guide them to find the answer themselves.' }]
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Chat API] Gemini Error:", errorText);
      return new Response(JSON.stringify({ error: `Gemini Error: ${response.status}` }), { status: 500 });
    }

    console.log("[Chat API] Streaming response from Gemini directly to client...");
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      }
    });

  } catch (error: any) {
    console.error("[Chat API] CRITICAL ERROR occurred:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown error occurred" }), { status: 500 });
  }
}
