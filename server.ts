import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
function getAi() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY or API_KEY environment variable is not defined on the server.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware to parse requests
  app.use(express.json({ limit: "15mb" }));

  // API Route: Get file content from disk
  app.get("/api/files", (req, res) => {
    try {
      const filePathParam = req.query.path as string;
      if (!filePathParam) {
        return res.status(400).json({ error: "File path parameter 'path' is required" });
      }

      // Safe path joining (prevent traversal outside workspace)
      const workspaceRoot = process.cwd();
      const targetPath = path.resolve(workspaceRoot, filePathParam);

      if (!targetPath.startsWith(workspaceRoot)) {
        return res.status(403).json({ error: "Access denied: outside workspace bounds" });
      }

      if (!fs.existsSync(targetPath)) {
        return res.status(404).json({ error: `File not found: ${filePathParam}` });
      }

      const stat = fs.statSync(targetPath);
      if (stat.isDirectory()) {
         return res.status(400).json({ error: "Target path is a directory" });
      }

      const content = fs.readFileSync(targetPath, "utf-8");
      return res.json({ path: filePathParam, content });
    } catch (err: any) {
      console.error("Error reading file:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // API Route: Get raw file/image content from disk
  app.get("/api/files/raw", (req, res) => {
    try {
      const filePathParam = req.query.path as string;
      if (!filePathParam) {
        return res.status(400).json({ error: "File path parameter 'path' is required" });
      }

      const workspaceRoot = process.cwd();
      const targetPath = path.resolve(workspaceRoot, filePathParam);

      if (!targetPath.startsWith(workspaceRoot)) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (!fs.existsSync(targetPath)) {
        return res.status(404).json({ error: "File not found" });
      }

      const ext = path.extname(targetPath).toLowerCase();
      let contentType = "application/octet-stream";
      if (ext === ".svg") contentType = "image/svg+xml";
      else if (ext === ".png") contentType = "image/png";
      else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".gif") contentType = "image/gif";
      else if (ext === ".webp") contentType = "image/webp";

      res.setHeader("Content-Type", contentType);
      const stream = fs.createReadStream(targetPath);
      stream.pipe(res);
    } catch (err: any) {
      console.error("Error reading raw file:", err);
      res.status(505).json({ error: err.message });
    }
  });

  // API Route: Save / update file on disk
  app.post("/api/files", (req, res) => {
    try {
      const { path: filePathParam, content } = req.body;
      if (!filePathParam || content === undefined) {
        return res.status(400).json({ error: "Both 'path' and 'content' are required in request body" });
      }

      const workspaceRoot = process.cwd();
      const targetPath = path.resolve(workspaceRoot, filePathParam);

      if (!targetPath.startsWith(workspaceRoot)) {
        return res.status(403).json({ error: "Access denied: outside workspace bounds" });
      }

      // Create parent directories if they do not exist
      const parentDir = path.dirname(targetPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      fs.writeFileSync(targetPath, content, "utf-8");
      return res.json({ success: true, message: `File saved successfully: ${filePathParam}` });
    } catch (err: any) {
      console.error("Error saving file:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // API Route: Secure server-side Gemini Proxy
  app.post("/api/gemini", async (req, res) => {
    try {
      const { prompt, systemInstruction, responseSchema, temperature, model = "gemini-2.5-flash" } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required in request body" });
      }

      const ai = getAi();
      const config: any = {
        temperature: temperature !== undefined ? Number(temperature) : 0.5,
      };

      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      if (responseSchema) {
        config.responseMimeType = "application/json";
        config.responseSchema = responseSchema;
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      const text = response.text;
      if (!text) {
        throw new Error("No text returned from Gemini API");
      }

      if (responseSchema || text.trim().startsWith("{") || text.trim().startsWith("[")) {
        try {
          const parsed = JSON.parse(text);
          return res.json(parsed);
        } catch (e) {
          console.warn("Failed to parse Gemini response as JSON", e);
        }
      }

      return res.json({ text });
    } catch (err: any) {
      console.error("Error calling server-side Gemini SDK:", err);
      return res.status(500).json({ error: err.message || "Failed to process request via Gemini SDK" });
    }
  });

  // Serve static assets or bundle and routing
  if (process.env.NODE_ENV !== "production") {
    // Integrate Vite as a middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-Stack Server] Running on http://localhost:${PORT}`);
    console.log(`[Full-Stack Server] Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
