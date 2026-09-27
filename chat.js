import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Use POST for chat." });
  }

  try {
    const messages = request.body?.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return response.status(400).json({ error: "Please enter a message." });
    }

    const safeMessages = messages
      .filter(
        (item) =>
          item &&
          ["user", "assistant"].includes(item.role) &&
          typeof item.content === "string"
      )
      .slice(-12)
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, 4000)
      }));

    const result = await openai.responses.create({
      model: "gpt-5.5",
      instructions:
        "You are Nova, a friendly and helpful AI assistant. " +
        "Explain clearly, be accurate, and use simple language when helpful.",
      input: safeMessages
    });

    return response.status(200).json({
      reply: result.output_text || "I couldn't generate a reply."
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return response.status(500).json({
      error: "The AI request failed. Check your API setup and try again."
    });
  }
}