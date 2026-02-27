// helper for calling AI summarization API (Groq Generative)
// you need to set the following env var in your .env (it must start
// with VITE_ so Vite will expose it to the client):
//
//   VITE_GROQ_API_KEY   – Groq API key (gsk_...)

export async function generateAISummary(content: string): Promise<string> {
  if (!content) return "";

  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!groqKey) {
    console.warn("Groq API key not configured");
    return "(no summary - API key missing)";
  }

  try {
    return await generateGroqSummary(content, groqKey);
  } catch (err) {
    console.error("Error fetching AI summary", err);
    return "(failed to generate summary)";
  }
}

async function generateGroqSummary(content: string, apiKey: string): Promise<string> {
  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates concise summaries and formats them as bullet points.",
          },
          {
            role: "user",
            content: `Provide a brief summary in 2-3 bullet points:\n\n${content.substring(0, 2000)}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 200,
      }),
    });

    const data = await resp.json();
    
    if (!resp.ok) {
      console.error("Groq API error:", data);
      return "(Summary generation unavailable - check your API key)";
    }
    
    const summary =
      data?.choices?.[0]?.message?.content ||
      "(Unable to generate summary)";
    return summary.trim();
  } catch (err) {
    console.error("Groq API request failed:", err);
    return "(Summary temporarily unavailable)";
  }
}
