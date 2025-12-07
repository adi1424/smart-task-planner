import { useState } from "react";

export default function TaskModal({ date, onClose, onSave }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [days, setDays] = useState(1);

  const handleSave = () => {
    if (!name.trim()) return alert("Task name is required");

    onSave({
      task_id: Date.now(),
      name,
      description: desc,
      priority,
      estimated_days: Number(days),
      dueDate: date,
      depends_on: [],
      progress: 0,
      isHoliday: false
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-black/80 p-6 rounded-xl w-[350px] border border-white/10 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">
          Add Task — {date}
        </h2>

        <input
          className="w-full p-2 mb-3 rounded bg-white/10 text-white"
          placeholder="Task name"
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="w-full p-2 mb-3 rounded bg-white/10 text-white"
          placeholder="Description"
          onChange={(e) => setDesc(e.target.value)}
        />

        <select
          className="w-full p-2 mb-3 rounded bg-white/10 text-white"
          onChange={(e) => setPriority(e.target.value)}
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <input
          type="number"
          min="1"
          className="w-full p-2 mb-4 rounded bg-white/10 text-white"
          placeholder="Estimated days"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500/30 rounded text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500/40 rounded text-white"
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}
