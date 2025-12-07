require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const Groq = require("groq-sdk");

const app = express();
app.use(express.json());
app.use(cors());

// ---------------------------------------------------------
// ⭐ HOLIDAY LIST
// ---------------------------------------------------------
const holidays = [
  "2025-01-01",
  "2025-01-26",
  "2025-03-08",
  "2025-08-15",
  "2025-10-02",
  "2025-10-20",
  "2025-12-25"
];

function isHoliday(dateString) {
  return holidays.includes(dateString);
}

const PORT = process.env.PORT || 4000;

// ---------------------------------------------------------
// ⭐ LOAD PROMPT TEMPLATE
// ---------------------------------------------------------
let PROMPT_TEMPLATE = "";
if (fs.existsSync("prompt_template.txt")) {
  PROMPT_TEMPLATE = fs.readFileSync("prompt_template.txt", "utf8");
} else {
  console.log("WARNING: prompt_template.txt not found!");
}

// ---------------------------------------------------------
// ⭐ INITIALIZE GROQ CLIENT
// ---------------------------------------------------------
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ---------------------------------------------------------
// ⭐ Extract duration from user goal (e.g. “30 days”, “2 months”)
// ---------------------------------------------------------
function extractDuration(goal) {
  const match = goal.match(/(\d+)\s*(day|days|week|weeks|month|months)/i);
  if (!match) return null;

  let value = parseInt(match[1]);
  let unit = match[2].toLowerCase();

  if (unit.includes("week")) value *= 7;
  if (unit.includes("month")) value *= 30;

  return value; // duration in days
}

// ---------------------------------------------------------
// ⭐ MAIN ENDPOINT — GENERATE PLAN
// ---------------------------------------------------------
app.post("/api/generate-plan", async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ error: "Goal is required" });

    // ⭐ NEW — detect duration from user sentence
    const duration = extractDuration(goal);
    console.log("Detected Duration:", duration);

    // start_date for JSON output
    const today = new Date().toISOString().split("T")[0];

    // ⭐ Build prompt: insert goal, duration, and start date
    let prompt = PROMPT_TEMPLATE
      .replace("{{goal}}", goal)
      .replace("{{duration}}", duration ? duration.toString() : "auto")
      .replace("YYYY-MM-DD", today);

    // ⭐ Call Groq Model (strict JSON)
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Return ONLY valid JSON. No markdown, no explanation." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 3000,
    });

    let aiText = completion.choices[0].message.content.trim();

    // Remove markdown (just in case)
    aiText = aiText.replace(/```json/gi, "").replace(/```/g, "").trim();

    // ⭐ Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (e) {
      console.log("RAW AI:", aiText);
      throw new Error("AI did not return valid JSON");
    }

    // ⭐ Mark holidays inside tasks (if dueDate is given)
    if (Array.isArray(parsed.tasks)) {
      parsed.tasks = parsed.tasks.map((task) => {
        if (!task.dueDate) return task;

        const formatted = new Date(task.dueDate)
          .toISOString()
          .split("T")[0];

        return {
          ...task,
          dueDate: formatted,
          isHoliday: isHoliday(formatted),
        };
      });
    }

    // Return final JSON plan
    res.json({ plan: parsed });

  } catch (err) {
    console.error("Groq Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// ⭐ TEST ROUTE
// ---------------------------------------------------------
app.get("/", (req, res) => {
  res.send("Smart Task Planner backend running with duration + holiday support!");
});

// ---------------------------------------------------------
// ⭐ START SERVER
// ---------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
