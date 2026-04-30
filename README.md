# Scaler Persona Chat 🎓

![Scaler Persona Chat](https://img.shields.io/badge/Status-Live-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![Groq](https://img.shields.io/badge/Groq-Llama--3.3--70b-blue) ![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

A persona-based AI chatbot that lets you have real conversations with three Scaler/InterviewBit personalities — **Anshuman Singh**, **Abhimanyu Saxena**, and **Kshitij Mishra**.

Each persona is powered by a deeply researched system prompt with few-shot examples, chain-of-thought reasoning, and output formatting constraints. The LLM backend uses Groq's ultra-fast inference API with `llama-3.3-70b-versatile`.

## 🔗 Live Demo

**[→ Open the live app](YOUR_VERCEL_URL_HERE)**

## ✨ Features

- 🎭 **Three distinct personas** — each with unique communication style, background, and expertise
- 💬 **Real-time chat** — powered by Groq's high-speed LLM API
- 🔄 **Persona switcher** — tabs that reset conversation and change system prompt
- 💡 **Suggestion chips** — quick-start questions tailored to each persona
- ⏳ **Typing indicator** — animated dots while the API processes
- 📱 **Mobile responsive** — works seamlessly on all screen sizes
- 🌙 **Premium dark mode** — glassmorphism design with gradient accents
- ⚠️ **Error handling** — graceful messages for API failures, rate limits, etc.

## 🚀 Setup & Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- A [Groq API key](https://console.groq.com/) (free tier available)
- [Vercel CLI](https://vercel.com/docs/cli) (optional, for local dev)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/GenAI-Project.git
   cd GenAI-Project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create your `.env` file**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Groq API key:
   ```
   GROQ_API_KEY=your_actual_groq_api_key
   ```

4. **Run locally with Vercel CLI**
   ```bash
   npx vercel dev
   ```

5. **Open** `http://localhost:3000` in your browser

### Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel Dashboard](https://vercel.com/new)
3. Add `GROQ_API_KEY` as an environment variable in Vercel project settings
4. Deploy — done!

## 📁 Project Structure

```
GenAI-Project/
├── api/
│   └── chat.js           ← Vercel serverless function (Groq API proxy)
├── lib/
│   └── personas.js       ← 3 persona system prompts (shared)
├── public/
│   ├── index.html        ← Chat UI
│   ├── style.css         ← Premium dark-mode styles
│   └── app.js            ← Frontend logic
├── .env.example          ← Environment variable template
├── .gitignore            ← Protects API keys
├── vercel.json           ← Vercel routing config
├── package.json          ← Dependencies
├── prompts.md            ← Annotated system prompts
├── reflection.md         ← 300-500 word reflection
└── README.md             ← This file
```

## 🔒 Security

- API key is stored as an **environment variable** — never hardcoded
- `.env` is **gitignored** — real keys never reach the repository
- `.env.example` contains only a placeholder value
- Serverless function acts as a **proxy** — the API key is never exposed to the client

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS, Inter font, glassmorphism design |
| Backend | Vercel Serverless Functions (Node.js) |
| LLM API | Groq (llama-3.3-70b-versatile) via OpenAI-compatible SDK |
| Deployment | Vercel |

## 📝 Documentation

- **[prompts.md](./prompts.md)** — All three system prompts with inline annotations
- **[reflection.md](./reflection.md)** — 300–500 word reflection on the process

## 📜 License

MIT
