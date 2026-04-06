import { useState, useEffect } from "react";
import type { Goal } from "@/lib/types";

interface Props {
  goals: Goal[];
  onGoalsChange: (goals: Goal[]) => void;
}

const GoalCard = ({ goals, onGoalsChange }: Props) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const addGoal = () => {
    if (!title || !date) return;
    onGoalsChange([{ id: Date.now(), title, target: date }, ...goals]);
    setTitle(""); setDate("");
  };

  const getTimeLeft = (target: string) => {
    const diff = new Date(target).getTime() - Date.now();
    if (diff < 0) return "সময় শেষ!";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${d} দিন ${h} ঘণ্টা ${m} মি. ${s} সে.`;
  };

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-t-4 border-life-emerald shadow-sm">
      <h3 className="text-sm font-bold mb-3 text-life-emerald">🎯 আমার লক্ষ্য</h3>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="লক্ষ্যের নাম..." className="w-full p-3 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground mb-2" />
      <input value={date} onChange={e => setDate(e.target.value)} placeholder="যেমন: 2025-12-31 23:59" className="w-full p-3 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground mb-2" onFocus={e => { e.target.type = 'datetime-local'; }} onBlur={e => { if (!e.target.value) e.target.type = 'text'; }} />
      <button onClick={addGoal} className="w-full bg-life-emerald text-primary-foreground py-3 rounded-xl font-bold text-sm hover:opacity-90 transition mb-3">সেট</button>
      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
        {goals.map(g => (
          <div key={g.id} className="p-3 rounded-xl bg-life-emerald-light border border-life-emerald/20">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">{g.title}</span>
              <button onClick={() => onGoalsChange(goals.filter(x => x.id !== g.id))} className="text-destructive/40 hover:text-destructive text-xs">🗑️</button>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1 font-bold">{getTimeLeft(g.target)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalCard;
