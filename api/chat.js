// ============================================================================
// Vercel Serverless Function — POST /api/chat
// ============================================================================
// Proxies chat requests to OpenRouter's LLM API using the OpenAI-compatible SDK.
// API key is read from Vercel environment variables — never hardcoded.
// ============================================================================

import { OpenAI } from "openai";
import { personas } from "../lib/personas.js";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { persona, messages } = req.body;

    // Validate persona
    if (!persona || !personas[persona]) {
      return res.status(400).json({
        error: "Invalid persona. Choose from: anshuman, abhimanyu, kshitij",
      });
    }

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Messages array is required and must not be empty.",
      });
    }

    const selectedPersona = personas[persona];

    // Build the full message array: system prompt + conversation history
    const fullMessages = [
      {
        role: "system",
        content: selectedPersona.systemPrompt,
      },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Call OpenRouter API (OpenAI-compatible)
    const response = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-70b-instruct",
      messages: fullMessages,
      temperature: 0.8,
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenRouter API Error:", error.message || error);

    // Handle specific API errors
    if (error.status === 401) {
      return res.status(500).json({
        error:
          "API authentication failed. Please check the OPENROUTER_API_KEY environment variable.",
      });
    }
    if (error.status === 429) {
      return res.status(500).json({
        error: "Rate limit exceeded. Please wait a moment and try again.",
      });
    }
    if (error.status === 503) {
      return res.status(500).json({
        error:
          "OpenRouter API service is temporarily unavailable. Please try again later.",
      });
    }

    return res.status(500).json({
      error:
        "Something went wrong while generating a response. Please try again.",
    });
  }
}
