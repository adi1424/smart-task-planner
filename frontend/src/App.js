import CalendarPage from "./CalendarPage";
import { useState, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FiCalendar, FiLink, FiClipboard, FiMoon, FiSun } from "react-icons/fi";

/* --------------------------------------------------------------------
   ⭐ SMART SCHEDULER (FINAL VERSION — with consistent field names)
   -------------------------------------------------------------------- */

const HOLIDAYS = [
  "2025-01-01",
  "2025-01-26",
  "2025-03-08",
  "2025-08-15",
  "2025-10-02",
  "2025-10-20",
  "2025-12-25",
];

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function isNonWorkingDay(date) {
  const day = date.getDay();
  const formatted = formatDate(date);
  return day === 0 || day === 6 || HOLIDAYS.includes(formatted);
}

function nextWorkingDay(date) {
  const d = new Date(date);
  while (isNonWorkingDay(d)) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function addDaysSkipping(date, days) {
  let d = new Date(date);
  let remaining = days;

  // If estimated_days = 1 → finish same day unless holiday/weekend
  while (remaining > 1) {
    d.setDate(d.getDate() + 1);
    if (!isNonWorkingDay(d)) {
      remaining--;
    }
  }
  return d;
}

function scheduleTasks(tasks, planStartDate) {
  const startBase = new Date(planStartDate);
  const map = {};

  tasks.forEach((t) => (map[t.task_id] = t));

  tasks.forEach((task) => {
    let start = new Date(startBase);

    if (task.depends_on && task.depends_on.length > 0) {
      let maxEnd = new Date(startBase);

      task.depends_on.forEach((id) => {
        const dep = map[id];
        if (dep?.dueDate) {
          const depEnd = new Date(dep.dueDate);
          if (depEnd > maxEnd) maxEnd = depEnd;
        }
      });

      maxEnd.setDate(maxEnd.getDate() + 1);
      start = nextWorkingDay(maxEnd);
    } else {
      start = nextWorkingDay(start);
    }

    const end = addDaysSkipping(start, task.estimated_days);

    task.start_date = formatDate(start);
    task.end_date = formatDate(end);
    task.dueDate = formatDate(end);
    task.isHoliday = HOLIDAYS.includes(task.dueDate);
  });

  return tasks;
}

/* --------------------------------------------------------------------
   ⭐ MAIN APP COMPONENT
   -------------------------------------------------------------------- */

function App() {
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    if (dark) {
      document.documentElement.classList.add("dark");
      document.body.style.background =
        "linear-gradient(180deg, #0b0b0b, #000000)";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.background =
        "linear-gradient(180deg, #f7fafc, #ffffff)";
    }
  }, [dark]);

  /* --------------------------------------------------------------------
     ⭐ Generate Plan → Backend → Then Apply Frontend Scheduling
     -------------------------------------------------------------------- */
  const generatePlan = async () => {
    if (!goal.trim()) return;

    setLoading(true);
    setPlan(null);
    setShowCalendar(false);

    try {
      const res = await axios.post("http://localhost:4000/api/generate-plan", {
        goal,
      });

      let tasks = res.data.plan.tasks || [];

      // Add a random progress bar if missing
      tasks = tasks.map((t) => ({
        ...t,
        progress:
          typeof t.progress === "number"
            ? t.progress
            : Math.floor(Math.random() * 101),
      }));

      // Determine plan start date
      const startDate =
        res.data.plan.start_date ||
        new Date().toISOString().split("T")[0];

      // Apply scheduler
      const finalTasks = scheduleTasks(tasks, startDate);

      setPlan({
        ...res.data.plan,
        start_date: startDate,
        tasks: finalTasks,
      });
    } catch (err) {
      console.error(err);
      alert("Error generating plan");
    } finally {
      setLoading(false);
    }
  };

  const Spinner = () => (
    <div className="flex justify-center my-6">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-neon-500 border-t-transparent"></div>
    </div>
  );

  /* --------------------------------------------------------------------
     UI RENDER
     -------------------------------------------------------------------- */
  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 transition-colors">
      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-black/30 border border-white/5 glass">
            <FiClipboard className="text-neon-500 text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Smart Task Planner</h1>
            <p className="text-dim text-sm">AI Project Planner</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg glass flex items-center gap-2 border border-white/6"
          >
            {dark ? <FiMoon className="text-white" /> : <FiSun className="text-white" />}
            <span className="text-sm text-dim">{dark ? "Dark" : "Light"}</span>
          </button>

          <button
            onClick={() => setGoal("Build an e-commerce website in 14 days")}
            className="px-4 py-2 rounded-lg btn-neon text-white"
          >
            Quick example
          </button>
        </div>
      </header>

      {/* Input */}
      <div className="w-full max-w-3xl glass p-6 rounded-2xl border border-white/6 shadow-neon-lg">
        <textarea
          className="w-full h-36 p-4 bg-transparent border border-white/6 rounded-lg text-white"
          placeholder="Describe your goal…"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <div className="mt-4 flex gap-3 items-center">
          <button
            onClick={generatePlan}
            className="px-5 py-3 rounded-lg btn-neon text-white font-semibold"
          >
            {loading ? "Generating…" : "Generate Plan"}
          </button>

          <button
            onClick={() => {
              setGoal("");
              setPlan(null);
              setShowCalendar(false);
            }}
            className="px-4 py-2 rounded-lg btn-neon-soft text-white/90"
          >
            Reset
          </button>

          {loading && <Spinner />}
        </div>
      </div>

      {/* Output */}
      {plan && (
        <main className="w-full max-w-5xl mt-8">
          <section className="glass p-6 rounded-2xl border border-white/6 shadow-neon-lg">
            {/* Plan header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">Generated Plan</h2>
                <p className="text-dim mt-1">
                  Goal: <span className="text-white">{plan.goal}</span>
                </p>
                <p className="text-dim text-xs">
                  Start date: <span className="text-white">{plan.start_date}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCalendar((prev) => !prev)}
                  className="px-3 py-2 rounded-lg btn-neon-soft flex items-center gap-2 text-sm"
                >
                  <FiCalendar /> {showCalendar ? "Show Task List" : "Show Calendar"}
                </button>

                <button
                  onClick={() =>
                    navigator.clipboard.writeText(JSON.stringify(plan, null, 2))
                  }
                  className="px-3 py-2 rounded-lg btn-neon-soft text-sm"
                >
                  Copy JSON
                </button>

                <button
                  onClick={() => downloadPlanPDF(plan)}
                  className="px-3 py-2 rounded-lg btn-neon text-sm"
                >
                  Download Plan (PDF)
                </button>
              </div>
            </div>

            {/* Calendar or list */}
            {showCalendar ? (
              <CalendarPage tasks={plan.tasks} holidays={HOLIDAYS} />
            ) : (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.tasks.map((task) => (
                  <div
                    key={task.task_id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 glass text-sm"
                  >
                    {/* Title */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-base">
                          {task.task_id}. {task.name}
                        </h4>
                        <p className="text-dim text-xs">{task.description}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="px-2 py-1 rounded-full bg-blue-500/15 text-blue-300 text-[11px] border border-blue-700/40">
                          {task.category}
                        </span>

                        <span
                          className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                            task.priority === "High"
                              ? "bg-red-600/20 text-red-300"
                              : task.priority === "Medium"
                              ? "bg-amber-600/20 text-amber-300"
                              : "bg-green-600/20 text-green-300"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="mt-3 text-[11px] text-dim space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white/80">
                          {task.estimated_days} days
                        </span>

                        <span className="flex items-center gap-1">
                          <FiLink className="text-[12px]" />
                          Depends on:
                          <span className="text-white/80 ml-1">
                            {task.depends_on?.length
                              ? task.depends_on.join(", ")
                              : "None"}
                          </span>
                        </span>
                      </div>

                      {task.start_date && (
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-[12px]" />
                          <span className="text-white/80">
                            {task.start_date} → {task.dueDate}
                          </span>

                          <span
                            className={`px-2 py-1 rounded-full text-[10px] ${
                              task.isHoliday
                                ? "bg-red-600/20 text-red-300"
                                : "bg-green-600/20 text-green-300"
                            }`}
                          >
                            {task.isHoliday ? "Holiday" : "Working Day"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expected Output */}
                    {task.expected_output && (
                      <div className="mt-3">
                        <p className="text-[11px] text-dim font-semibold mb-1">
                          Expected Output
                        </p>
                        <div className="text-white/80 text-[11px] bg-black/30 border border-white/10 rounded-lg p-2">
                          {task.expected_output}
                        </div>
                      </div>
                    )}

                    {/* Subtasks */}
                    {task.subtasks?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[11px] text-dim font-semibold mb-1">
                          Subtasks
                        </p>
                        <ul className="space-y-1">
                          {task.subtasks.map((st, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-white/80 text-[11px]"
                            >
                              <input type="checkbox" className="w-3 h-3" readOnly />
                              {st.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Explanation */}
                    {task.explanation && (
                      <div className="mt-3">
                        <p className="text-[11px] text-dim font-semibold mb-1">
                          Why this task matters
                        </p>
                        <p className="text-white/75 text-[11px]">{task.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------
   ⭐ PDF EXPORT
   -------------------------------------------------------------------- */
async function downloadPlanPDF(plan) {
  try {
    const element = document.createElement("div");
    element.style.padding = "20px";
    element.style.color = "#fff";
    element.style.background = "#000";

    element.innerHTML = `
      <h1 style="font-size:18px;">Plan: ${plan.goal}</h1>
      <pre style="font-size:11px;">${JSON.stringify(plan, null, 2)}</pre>
    `;

    document.body.appendChild(element);

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("plan.pdf");

    document.body.removeChild(element);
  } catch (error) {
    alert("Error generating PDF");
  }
}

export default App;
