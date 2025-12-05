import { useState, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FiCalendar, FiLink, FiFlag, FiClipboard, FiMoon, FiSun } from "react-icons/fi";

function App() {
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    if (dark) {
      document.documentElement.classList.add("dark");
      document.body.style.background = "linear-gradient(180deg, #0b0b0b, #000000)";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.background = "linear-gradient(180deg, #f7fafc, #ffffff)";
    }
  }, [dark]);

  const generatePlan = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setPlan(null);

    try {
      const res = await axios.post("http://localhost:4000/api/generate-plan", { goal });

      // ensure tasks have progress (if backend doesn't provide)
      const tasksWithProgress = res.data.plan.tasks.map((t) => ({
        ...t,
        progress: typeof t.progress === "number" ? t.progress : Math.floor(Math.random() * 101),
      }));

      setPlan({ ...res.data.plan, tasks: tasksWithProgress });
    } catch (err) {
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
            <p className="text-dim text-sm">AI planner · beautiful timeline · export ready</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg glass flex items-center gap-2 border border-white/6"
            title="Toggle light / dark"
          >
            {dark ? <FiMoon className="text-white" /> : <FiSun className="text-white" />}
            <span className="text-sm text-dim">{dark ? "Dark" : "Light"}</span>
          </button>

          <button
            onClick={() => {
              setGoal("Build an e-commerce website in 14 days");
            }}
            className="px-4 py-2 rounded-lg btn-neon text-white font-medium hover:opacity-95 transition"
            title="Example goal"
          >
            Quick example
          </button>
        </div>
      </header>

      {/* Input card */}
      <div className="w-full max-w-3xl glass p-6 rounded-2xl border border-white/6 shadow-neon-lg">
        <textarea
          className="w-full h-36 p-4 bg-transparent border border-white/6 rounded-lg focus:ring-2 focus:ring-neon-500 outline-none text-white placeholder:text-dim"
          placeholder="Describe your goal (Example: Build an e-commerce website in 14 days)"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <div className="mt-4 flex gap-3 items-center">
          <button
            onClick={generatePlan}
            className="px-5 py-3 rounded-lg btn-neon text-white font-semibold shadow-neon-lg hover:brightness-95 transition"
          >
            {loading ? "Generating..." : "Generate Plan"}
          </button>

          <button
            onClick={() => { setGoal(""); setPlan(null); }}
            className="px-4 py-2 rounded-lg btn-neon-soft text-white/90 font-medium hover:opacity-90 transition"
          >
            Reset
          </button>

          {loading && <Spinner />}
        </div>
      </div>

      {/* Result */}
      {plan && (
        <main className="w-full max-w-5xl mt-8">
          <section className="glass p-6 rounded-2xl border border-white/6 shadow-neon-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">Generated Plan</h2>
                <p className="text-dim mt-1">Goal: <span className="text-white">{plan.goal}</span></p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(plan, null, 2))}
                  className="px-3 py-2 rounded-lg btn-neon-soft"
                >
                  Copy JSON
                </button>
                <button
                  onClick={() => downloadPlanPDF(plan)}
                  className="px-3 py-2 rounded-lg btn-neon"
                >
                  Download Plan (PDF)
                </button>
              </div>
            </div>

            {/* tasks list */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.tasks.map((task) => (
                <div key={task.task_id} className="p-4 rounded-xl bg-black/30 border border-white/6 glass">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{task.task_id}. {task.name}</h4>
                      <p className="text-dim text-sm mt-1">{task.description}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${task.priority === "High" ? "bg-red-600/20 text-red-400 border border-red-800/20" : task.priority === "Medium" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-800/20" : "bg-green-600/20 text-green-300 border border-green-800/20"}`}>
                        {task.priority}
                      </span>
                      <div className="text-dim text-sm">{task.estimated_days} days</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-dim text-sm">
                    <FiCalendar className="text-dim" /> <div>Est: <span className="text-white ml-1">{task.estimated_days}</span></div>
                    <FiLink className="text-dim" /> <div>Depends: <span className="text-white ml-1">{task.depends_on.length ? task.depends_on.join(", ") : "None"}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Gantt: dark styled container */}
          <div className="mt-8 glass p-6 rounded-2xl border border-white/6 shadow-neon-lg">
            <GanttChart tasks={plan.tasks} />
          </div>
        </main>
      )}
    </div>
  );
}

/* Download plan PDF - exports tasks + goal as simple PDF */
async function downloadPlanPDF(plan) {
  try {
    const element = document.createElement("div");
    element.style.padding = "20px";
    element.style.background = "#0b0b0b";
    element.style.color = "#fff";
    element.innerHTML = `<h1 style="font-size:18px">Plan: ${plan.goal}</h1><pre style="font-size:12px">${JSON.stringify(plan, null, 2)}</pre>`;
    document.body.appendChild(element);
    const canvas = await html2canvas(element, { backgroundColor: "#0b0b0b" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("plan.pdf");
    document.body.removeChild(element);
  } catch (e) {
    alert("Could not generate PDF");
  }
}

/* GanttChart component - dark theme, day header, dependency info, progress colors, pdf download button included above */
function GanttChart({ tasks }) {
  if (!tasks || tasks.length === 0) return null;

  const SCALE = 26; // px per day (wider for dark design)

  // calculate start offset recursively
  const calculateStartDay = (task) => {
    if (!task.depends_on || task.depends_on.length === 0) return 0;
    let maxEnd = 0;
    task.depends_on.forEach((depId) => {
      const dep = tasks.find((t) => t.task_id === depId);
      if (dep) {
        const depStart = calculateStartDay(dep);
        const depEnd = depStart + dep.estimated_days;
        if (depEnd > maxEnd) maxEnd = depEnd;
      }
    });
    return maxEnd;
  };

  const maxEndDay = Math.max(
    ...tasks.map((t) => {
      const s = calculateStartDay(t);
      return s + t.estimated_days;
    })
  );

  // pdf export for the gantt only
  const downloadGanttPDF = async () => {
    const element = document.getElementById("gantt-export");
    if (!element) return;
    const canvas = await html2canvas(element, { backgroundColor: "#000" });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape");
    pdf.addImage(img, "PNG", 10, 10, 280, 150);
    pdf.save("timeline.pdf");
  };

  return (
    <div id="gantt-export" className="text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Timeline (Gantt)</h3>
        <div className="flex items-center gap-2">
          <button onClick={downloadGanttPDF} className="px-3 py-1 rounded-md btn-neon">Download Timeline as PDF</button>
        </div>
      </div>

      {/* day header */}
      <div className="flex items-center text-sm text-dim mb-2 pl-28">
        <div style={{ width: "200px" }} className="text-right pr-4">Task / Day</div>
        <div className="flex gap-0 items-center">
          {Array.from({ length: maxEndDay + 1 }).map((_, day) => (
            <div key={day} style={{ width: `${SCALE}px` }} className="text-center border-l border-white/3">
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {tasks.map((task) => {
          const start = calculateStartDay(task);
          const width = task.estimated_days * SCALE;
          const left = start * SCALE;
          const colorClass =
            task.progress >= 100 ? "bg-green-500" : task.progress >= 50 ? "bg-yellow-500" : "bg-red-500";

          return (
            <div key={task.task_id} className="flex items-center">
              <div style={{ width: "200px" }} className="text-right pr-4 text-dim">
                <div className="text-white font-medium">{task.task_id}. {task.name}</div>
              </div>

              <div className="flex-1">
                <div className="relative h-5 bg-white/5 rounded-full overflow-visible">
                  <div
                    className={`absolute top-0 h-5 rounded-full transition-all duration-700 ease-out ${colorClass}`}
                    style={{
                      width: `${width}px`,
                      left: `${left}px`,
                      boxShadow: "0 6px 20px rgba(59,130,246,0.12)",
                    }}
                  />
                </div>

                {/* dependency label (small arrow text) */}
                {task.depends_on && task.depends_on.length > 0 && (
                  <div className="text-xs text-dim mt-1">
                    ↳ Depends on: {task.depends_on.join(", ")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
