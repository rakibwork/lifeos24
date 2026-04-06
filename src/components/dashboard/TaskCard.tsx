import { useState, useEffect } from "react";
import type { Task } from "@/lib/types";

interface Props {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

const TaskCard = ({ tasks, onTasksChange }: Props) => {
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const addTask = () => {
    if (!text.trim()) return;
    onTasksChange([{ id: Date.now(), text, time, done: false }, ...tasks]);
    setText(""); setTime("");
  };

  const toggleTask = (id: number) => {
    onTasksChange(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: number) => {
    onTasksChange(tasks.filter(t => t.id !== id));
  };

  const getTimeLeft = (taskTime: string) => {
    if (!taskTime) return null;
    const now = new Date();
    const [h, m] = taskTime.split(':').map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    const diff = target.getTime() - now.getTime();
    if (diff < 0) return "সময় শেষ!";
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}ঘ ${mins}মি বাকি`;
    return `${mins}মি বাকি`;
  };

  const getTaskClass = (task: Task) => {
    if (task.done) return 'completed';
    if (!task.time) return '';
    const now = new Date();
    const [h, m] = task.time.split(':').map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    const diff = target.getTime() - now.getTime();
    if (diff < 0) return 'task-danger';
    if (diff < 1800000) return 'task-warning';
    return '';
  };

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-t-4 border-life-pink shadow-sm">
      <h3 className="text-sm font-bold mb-3 text-life-pink">📅 আজকের কাজ</h3>
      <div className="flex gap-2 mb-3">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="কি কি কাজ করবেন?" className="flex-1 p-3 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground" />
        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-20 p-2 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground" />
        <button onClick={addTask} className="bg-life-pink text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition">যোগ</button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
        {tasks.map(task => (
          <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl border border-border transition-all ${getTaskClass(task)}`}>
            <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} className="w-4 h-4 accent-life-pink rounded" />
            <div className="flex-1">
              <span className={`text-sm font-bold ${task.done ? 'line-through opacity-50' : ''}`}>{task.text}</span>
              {task.time && !task.done && (
                <div className="text-[10px] text-muted-foreground mt-0.5">{task.time} — {getTimeLeft(task.time)}</div>
              )}
            </div>
            <button onClick={() => deleteTask(task.id)} className="text-destructive/40 hover:text-destructive transition text-xs">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskCard;
