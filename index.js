require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const Groq = require("groq-sdk");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;

// Load prompt template
let PROMPT_TEMPLATE = "";
if (fs.existsSync("prompt_template.txt")) {
  PROMPT_TEMPLATE = fs.readFileSync("prompt_template.txt", "utf8");
} else {
  console.log("WARNING: prompt_template.txt not found!");
}

// Initialize Groq Client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// MAIN ENDPOINT
app.post("/api/generate-plan", async (req, res) => {
  try {
    const { goal } = req.body;

    if (!goal) {
      return res.status(400).json({ error: "Goal is required" });
    }

    const prompt = PROMPT_TEMPLATE.replace("{{goal}}", goal);

    // Use the CURRENT Groq model
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Return ONLY valid JSON for the task plan." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    });

    const aiText = completion.choices[0].message.content.trim();

    // --- JSON CLEANING FIX ---
    let parsed;
    try {
      // Remove AI formatting like ```json and ```
      let cleanText = aiText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleanText);
    } catch (err) {
      console.log("RAW AI TEXT:", aiText);
      throw new Error("AI did not return valid JSON");
    }

    res.json({ plan: parsed });

  } catch (err) {
    console.error("Groq Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Test Route
app.get("/", (req, res) => {
  res.send("Groq Smart Task Planner backend is running on llama-3.1-8b-instant!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
