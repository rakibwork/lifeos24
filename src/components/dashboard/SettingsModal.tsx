import { useState } from "react";
import type { Habit, NamazTimes, ExtraSettings } from "@/lib/types";
import { saveNamazTimes, saveExtraSettings, saveHabitDefinitions } from "@/lib/dataStore";

interface Props {
  namazTimes: NamazTimes;
  extraSettings: ExtraSettings;
  habitDefs: Habit[];
  onClose: () => void;
}

const SettingsModal = ({ namazTimes, extraSettings, habitDefs, onClose }: Props) => {
  const [nt, setNt] = useState(namazTimes);
  const [es, setEs] = useState(extraSettings);
  const [habits, setHabits] = useState(habitDefs);
  const [newHabit, setNewHabit] = useState("");

  const addHabit = () => {
    if (!newHabit.trim()) return;
    setHabits([...habits, { id: Date.now(), title: newHabit, checked: false }]);
    setNewHabit("");
  };

  const save = () => {
    saveNamazTimes(nt);
    saveExtraSettings(es);
    saveHabitDefinitions(habits);
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">⚙️ সেটিংস</h2>

        <h3 className="text-sm font-bold mb-2 text-life-orange">🕌 নামাজের সময়</h3>
        {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map(key => (
          <div key={key} className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold w-20 capitalize">{key}</span>
            <input type="time" value={nt[key]} onChange={e => setNt({ ...nt, [key]: e.target.value })} className="flex-1 p-2 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground" />
          </div>
        ))}

        <h3 className="text-sm font-bold mb-2 mt-4 text-life-emerald">📋 রুটিন / অভ্যাস</h3>
        <div className="flex gap-2 mb-2">
          <input value={newHabit} onChange={e => setNewHabit(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHabit()} placeholder="নতুন অভ্যাস..." className="flex-1 p-2 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground" />
          <button onClick={addHabit} className="bg-life-emerald text-primary-foreground px-3 py-1 rounded-xl text-sm font-bold">+</button>
        </div>
        <div className="space-y-1 mb-4">
          {habits.map(h => (
            <div key={h.id} className="flex items-center justify-between p-2 rounded-xl bg-secondary">
              <span className="text-sm font-bold">{h.title}</span>
              <button onClick={() => setHabits(habits.filter(x => x.id !== h.id))} className="text-destructive text-xs">🗑️</button>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-bold mb-2 text-primary">💰 বাজেট</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground">দৈনিক লিমিট</label>
            <input type="number" value={es.dailyLimit} onChange={e => setEs({ ...es, dailyLimit: parseInt(e.target.value) || 0 })} className="w-full p-2 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground">মাসিক লিমিট</label>
            <input type="number" value={es.monthlyLimit} onChange={e => setEs({ ...es, monthlyLimit: parseInt(e.target.value) || 0 })} className="w-full p-2 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground" />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={save} className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm">সংরক্ষণ করুন</button>
          <button onClick={onClose} className="flex-1 bg-secondary text-foreground py-3 rounded-xl font-bold text-sm">বাতিল</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
