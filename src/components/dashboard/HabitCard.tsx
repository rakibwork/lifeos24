import type { Habit } from "@/lib/types";

interface Props {
  habits: Habit[];
  onHabitsChange: (habits: Habit[]) => void;
}

const HabitCard = ({ habits, onHabitsChange }: Props) => {
  const toggle = (id: number) => {
    onHabitsChange(habits.map(h => h.id === id ? { ...h, checked: !h.checked } : h));
  };

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-life-orange shadow-sm">
      <h3 className="text-sm font-bold mb-3 text-life-orange">📋 রুটিন</h3>
      {habits.length === 0 && <p className="text-xs text-muted-foreground">সেটিংস থেকে রুটিন যোগ করুন</p>}
      <div className="space-y-2">
        {habits.map(h => (
          <label key={h.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition cursor-pointer">
            <input type="checkbox" checked={h.checked} onChange={() => toggle(h.id)} className="w-4 h-4 accent-life-orange rounded" />
            <span className={`text-sm font-bold ${h.checked ? 'line-through opacity-50' : ''}`}>{h.title}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default HabitCard;
