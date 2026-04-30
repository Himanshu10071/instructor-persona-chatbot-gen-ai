// ============================================================================
// Local Development Server
// ============================================================================
// This file is NOT used in production (Vercel handles everything).
// It mimics the Vercel serverless function locally for testing.
// ============================================================================

import "dotenv/config";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { personas } from "./lib/personas.js";
import { OpenAI } from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  // API: POST /api/chat
  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { persona, messages } = JSON.parse(body);

        if (!persona || !personas[persona]) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Invalid persona." }));
        }

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Messages required." }));
        }

        const fullMessages = [
          { role: "system", content: personas[persona].systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ];

        const response = await client.chat.completions.create({
          model: "meta-llama/llama-3.3-70b-instruct",
          messages: fullMessages,
          temperature: 0.8,
          max_tokens: 500,
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ reply: response.choices[0].message.content }));
      } catch (error) {
        console.error("API Error:", error.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Something went wrong. Please try again.",
          })
        );
      }
    });
    return;
  }

  // Static files from /public
  let filePath = req.url === "/" ? "/index.html" : req.url;
  const fullPath = path.join(__dirname, "public", filePath);
  const ext = path.extname(fullPath);

  try {
    const content = fs.readFileSync(fullPath);
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "text/plain" });
    res.end(content);
  } catch {
    // Fallback to index.html
    const html = fs.readFileSync(path.join(__dirname, "public", "index.html"));
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Scaler Persona Chat running at http://localhost:${PORT}\n`);
});
