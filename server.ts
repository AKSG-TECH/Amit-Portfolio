import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for contact form
  app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;
    
    console.log("Contact Form Submission received:");
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    
    // Optional: Forward to Google Sheets Webhook
    const googleSheetUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (googleSheetUrl) {
      try {
        await fetch(googleSheetUrl, {
          method: "POST",
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            name,
            email,
            message
          }),
          headers: { "Content-Type": "application/json" }
        });
        console.log("Forwarded to Google Sheets successfully");
      } catch (error) {
        console.error("Error forwarding to Google Sheets:", error);
      }
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Your message has been processed successfully!" 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
