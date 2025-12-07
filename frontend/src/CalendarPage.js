// CalendarPage.js

import React, { useState } from "react";

// --- SAME HOLIDAYS USED IN FRONTEND ---
const HOLIDAYS = [
  "2025-01-01",
  "2025-01-26",
  "2025-03-08",
  "2025-08-15",
  "2025-10-02",
  "2025-10-20",
  "2025-12-25",
];

// Convert YYYY-MM-DD → Date object
function toDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Return all dates between start and end (inclusive)
function getRange(start, end) {
  const s = toDate(start);
  const e = toDate(end);
  const list = [];

  let cur = new Date(s);
  while (cur <= e) {
    list.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }

  return list;
}

export default function CalendarPage({ tasks }) {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // New task (for popup)
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    estimated_days: 1,
  });

  // Days in selected month
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const firstDay = monthStart.getDay();

  // Build calendar cells
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Map tasks to calendar dates
  const taskMap = {};

  tasks.forEach((task) => {
    if (!task.startDate || !task.dueDate) return;

    const range = getRange(task.startDate, task.dueDate);

    range.forEach((date) => {
      if (!taskMap[date]) taskMap[date] = [];
      taskMap[date].push(task);
    });
  });

  // Handle clicking date
  function handleDateClick(day) {
    const d = new Date(year, month, day);
    setSelectedDate(d);
    setModalOpen(true);
  }

  function addTaskToDay() {
    alert(
      `Task "${newTask.name}" added on ${selectedDate
        .toISOString()
        .slice(0, 10)}.\n\n(This is UI only, backend scheduling not implemented yet.)`
    );

    setNewTask({ name: "", description: "", estimated_days: 1 });
    setModalOpen(false);
  }

  // Month navigation
  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  return (
    <div className="w-full text-white">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="px-3 py-1 bg-white/10 rounded">
          ←
        </button>

        <h2 className="text-xl font-semibold">
          {monthStart.toLocaleString("default", { month: "long" })} {year}
        </h2>

        <button onClick={nextMonth} className="px-3 py-1 bg-white/10 rounded">
          →
        </button>
      </div>

      {/* Weekday Names */}
      <div className="grid grid-cols-7 gap-2 text-center text-dim mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar Cells */}
      <div className="grid grid-cols-7 gap-2">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;

          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;

          const cellTasks = taskMap[iso] || [];
          const isHoliday = HOLIDAYS.includes(iso);

          return (
            <div
              key={idx}
              onClick={() => handleDateClick(day)}
              className={`min-h-[100px] p-2 rounded-lg border border-white/10 cursor-pointer transition
                ${isHoliday ? "bg-red-600/20" : "bg-white/5"} hover:bg-white/10`}
            >
              <div className="text-sm font-semibold">{day}</div>

              {/* Tasks in the cell */}
              <div className="mt-2 space-y-1">
                {cellTasks.map((t) => (
                  <div
                    key={t.task_id}
                    className="text-xs bg-blue-500/25 border border-blue-400/30 px-2 py-1 rounded"
                  >
                    {t.name}
                  </div>
                ))}
              </div>

              {/* Holiday indicator */}
              {isHoliday && (
                <div className="absolute top-1 right-1 text-[10px] bg-red-500/40 px-1 rounded">
                  Holiday
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-black/80 p-6 rounded-xl border border-white/10 w-80">
            <h3 className="text-lg font-semibold mb-3">Add Task</h3>

            <p className="text-sm text-dim mb-3">
              Date: {selectedDate.toISOString().slice(0, 10)}
            </p>

            <input
              className="w-full px-3 py-2 bg-white/10 text-white rounded mb-3"
              placeholder="Task name"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            />

            <textarea
              className="w-full px-3 py-2 bg-white/10 text-white rounded mb-3"
              placeholder="Description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />

            <input
              type="number"
              className="w-full px-3 py-2 bg-white/10 text-white rounded mb-3"
              placeholder="Estimated days"
              value={newTask.estimated_days}
              onChange={(e) =>
                setNewTask({ ...newTask, estimated_days: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-2 bg-white/10 rounded"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>

              <button
                className="px-3 py-2 bg-blue-500 rounded"
                onClick={addTaskToDay}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
