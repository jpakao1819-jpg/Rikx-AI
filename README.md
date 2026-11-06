# Rikx-AI

Rikx-AI is a browser-based forex learning program with a study tracker and an AI chat layer.

## What this version includes

- 12-week forex curriculum
- Browser-based progress tracking
- Local memory notes for the learner
- Real conversational AI backend using OpenAI / OpenRouter / Gemini
- Safe educational guardrails for trading instruction

## Run locally

1. Install Node.js 18+
2. In the project folder, install dependencies:

```bash
npm install
```

3. Copy the example environment file:

```bash
cp .env.example .env
```

4. Open `.env` and add your API key.

For OpenAI:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

For Gemini:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash
```

For OpenRouter:

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

5. Start the app:

```bash
npm start
```

6. Open your browser at:

```text
http://localhost:3000
```

## Notes

- The app serves the static pages and also exposes the AI chat API at `/api/chat`.
- If no AI key is configured, the app falls back to a local educational demo response.
- This project is for education only and does not provide financial advice.
