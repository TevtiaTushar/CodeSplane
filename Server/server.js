import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { Ollama } from "ollama";

const ollama = new Ollama({
  host: "https://ollama.com",
  headers: {
    Authorization: "Bearer " + process.env.OLLAMA_API_KEY,
  },
});

const PORT = process.env.PORT || 3002;

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins session window
  max: 15, // max 15 requests allowed during this 15 mins session window
  message:
    "Too many requests from this IP, please try again after some time...",
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));

app.post("/api/explain-code", async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    const messages = [
      { role: "system", content: "You are a professional coding assistant." },
      {
        role: "user",
        content: `Please explain this ${language || ""} code snippet in simple terms: \n\n\`\`\`${language || ""}\n${code}\n\`\`\``,
      },
    ];

    const response = await ollama.chat({
      model: "deepseek-v3.1:671b-cloud",
      messages,
      options: {
        temperature: 0.5,
        num_predict: 1000,
      },
      stream: false,
    });

    const explaination = response?.message?.content;

    if (!explaination) {
      return res.status(500).json({ error: "Failed to explain code" });
    }

    res.json({ explaination, language: language || "" });
  } catch (err) {
    console.error("Code Explain API error: ", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API server is running on http://localhost:${PORT}`);
});
