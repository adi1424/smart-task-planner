// createEngine.js

// ---- HOLIDAYS ----
const HOLIDAYS = [
  "2025-01-01",
  "2025-01-26",
  "2025-03-08",
  "2025-08-15",
  "2025-10-02",
  "2025-10-20",
  "2025-12-25",
];

// ---- DATE HELPERS ----
function toDateOnlyString(date) {
  return date.toISOString().slice(0, 10);
}
function isWeekend(date) {
  const d = date.getDay();
  return d === 0 || d === 6;
}
function isHoliday(date) {
  return HOLIDAYS.includes(toDateOnlyString(date));
}
function isWorkingDay(date) {
  return !isWeekend(date) && !isHoliday(date);
}
function nextWorkingDay(date) {
  const d = new Date(date);
  while (!isWorkingDay(d)) d.setDate(d.getDate() + 1);
  return d;
}
function addWorkingDays(start, days) {
  let d = nextWorkingDay(start);
  let used = 1;
  while (used < days) {
    d.setDate(d.getDate() + 1);
    if (isWorkingDay(d)) used++;
  }
  return d;
}

// ---- SMART SCHEDULER ----
function scheduleTasks(tasks, base = new Date()) {
  const startBase = nextWorkingDay(base);
  const scheduled = [];

  tasks.forEach((task) => {
    let earliestStart = new Date(startBase);

    // dependencies respected
    if (task.depends_on?.length) {
      let maxEnd = null;
      for (let id of task.depends_on) {
        const dep = scheduled.find((t) => t.task_id === id);
        if (dep) {
          const end = new Date(dep.end_date);
          if (!maxEnd || end > maxEnd) maxEnd = end;
        }
      }
      if (maxEnd) {
        maxEnd.setDate(maxEnd.getDate() + 1);
        earliestStart = nextWorkingDay(maxEnd);
      }
    }

    const duration = Number(task.estimated_days) || 1;
    const end = addWorkingDays(earliestStart, duration);

    scheduled.push({
      ...task,
      start_date: toDateOnlyString(earliestStart),
      end_date: toDateOnlyString(end),
      dueDate: toDateOnlyString(end),
      isHoliday: isHoliday(end),
    });
  });

  return scheduled;
}

// ---- CATEGORY DETECT ----
function detectCategory(task) {
  const name = task.name.toLowerCase();

  if (name.includes("design") || name.includes("ui") || name.includes("figma"))
    return "Design";

  if (
    name.includes("api") ||
    name.includes("backend") ||
    name.includes("auth") ||
    name.includes("server")
  )
    return "Development";

  if (name.includes("test") || name.includes("qa")) return "Testing";

  if (
    name.includes("plan") ||
    name.includes("analysis") ||
    name.includes("requirement")
  )
    return "Planning";

  if (name.includes("deploy") || name.includes("release"))
    return "Deployment";

  return "General";
}

// ---- SUBTASK GENERATOR ----
function generateSubtasks(task) {
  const name = task.name.toLowerCase();

  if (name.includes("design"))
    return [
      "Create wireframes",
      "Choose color palette",
      "Design components",
      "Review final UI",
    ];

  if (name.includes("api"))
    return [
      "Define API endpoints",
      "Implement routes",
      "Connect database",
      "Write tests",
    ];

  if (name.includes("auth"))
    return [
      "Create user schema",
      "Build signup",
      "Build login",
      "Add JWT",
      "Test with Postman",
    ];

  if (name.includes("research") || name.includes("plan"))
    return [
      "Gather requirements",
      "Identify constraints",
      "Prepare plan draft",
      "Review plan",
    ];

  return [
    "Understand requirements",
    "Implement core logic",
    "Review output",
    "Finalize task",
  ];
}

// ---- CLARITY ENGINE ----
function applyClarity(task) {
  const category = detectCategory(task);
  const subtasks = generateSubtasks(task);

  return {
    ...task,
    category,
    explanation: `This task is important because it ensures "${task.name}" is completed in a structured way.`,
    expected_output: `A completed and functional "${task.name}" ready for integration.`,
    subtasks: subtasks.map((title) => ({
      title,
      done: false,
    })),
  };
}

// ---- MAIN: SMART SCHEDULING + CLARITY ----
export function runClarityEngine(plan) {
  if (!plan?.tasks) return plan;

  const scheduled = scheduleTasks(plan.tasks);
  const enhanced = scheduled.map((t) => applyClarity(t));

  return { ...plan, tasks: enhanced };
}
