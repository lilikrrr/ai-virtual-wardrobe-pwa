
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", app: "AI Virtual Wardrobe" });
});

app.post("/api/generate", upload.single("photo"), async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "AI belum dikonfigurasi"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Foto model belum diunggah"
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const prompt = req.body.prompt ||
      "Change the clothing to an elegant modest outfit. Preserve the person's identity and face.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: req.file.mimetype,
              data: req.file.buffer.toString("base64")
            }
          }
        ]
      }]
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    const result = parts.find(p => p.inlineData?.data);

    if (!result) {
      throw new Error("Model tidak mengembalikan gambar");
    }

    res.json({
      image: `data:${result.inlineData.mimeType};base64,${result.inlineData.data}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Gagal menghasilkan gambar AI"
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
