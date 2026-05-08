import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(cors());

  // API Proxy for OpenRouter
  app.post("/api/openrouter", async (req, res) => {
    const { model, messages, response_format, tools, tool_choice } = req.body;
    
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "OPENROUTER_API_KEY is not configured in environment variables." });
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://ai.studio.build", // Optional, for OpenRouter rankings
          "X-Title": "Agence Astromedia", // Optional, for OpenRouter rankings
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model || "google/gemini-2.0-pro-exp-02-05:free", // Default model
          messages,
          response_format,
          tools,
          tool_choice
        })
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("OpenRouter API Error:", error);
      res.status(500).json({ error: "Failed to communicate with OpenRouter" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Fix for Express 5 wildcard syntax
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
