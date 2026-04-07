import { useState, useEffect } from "react";
import type { Medicine, MedicineDose } from "@/lib/types";

interface Props {
  medicines: Medicine[];
  doses: MedicineDose[];
  onMedicinesChange: (medicines: Medicine[]) => void;
  onDosesChange: (doses: MedicineDose[]) => void;
}

const MedicineCard = ({ medicines, doses, onMedicinesChange, onDosesChange }: Props) => {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState("");
  const [times, setTimes] = useState<string[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const addTime = () => {
    if (time && !times.includes(time)) {
      setTimes([...times, time].sort());
      setTime("");
    }
  };

  const addMedicine = () => {
    if (!name.trim() || times.length === 0) return;
    const newMed: Medicine = { id: Date.now(), name, dose, times };
    onMedicinesChange([...medicines, newMed]);
    const newDoses = times.map(t => ({ medId: newMed.id, time: t, taken: false }));
    onDosesChange([...doses, ...newDoses]);
    setName(""); setDose(""); setTimes([]);
  };

  const toggleDose = (medId: number, doseTime: string) => {
    const existing = doses.find(d => d.medId === medId && d.time === doseTime);
    if (existing) {
      onDosesChange(doses.map(d => d.medId === medId && d.time === doseTime ? { ...d, taken: !d.taken } : d));
    } else {
      onDosesChange([...doses, { medId, time: doseTime, taken: true }]);
    }
  };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const getDoseStatus = (medId: number, t: string) => {
    const d = doses.find(dd => dd.medId === medId && dd.time === t);
    const [h, m] = t.split(':').map(Number);
    const doseMin = h * 60 + m;
    if (d?.taken) return 'taken';
    if (currentMinutes > doseMin) return 'missed';
    if (currentMinutes >= doseMin - 30) return 'upcoming';
    return 'pending';
  };

  return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-2xl p-4 border-2 border-rose-300 dark:border-rose-700 shadow-sm">
      <h3 className="text-sm font-bold mb-3 text-rose-600 dark:text-rose-400 flex items-center gap-2">
        💊 ওষুধ রিমাইন্ডার
      </h3>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="ওষুধের নাম..."
          className="p-2.5 rounded-xl bg-white/70 dark:bg-card border border-rose-200 dark:border-rose-700 outline-none text-sm font-bold text-foreground focus:ring-2 focus:ring-rose-300" />
        <div className="flex gap-1">
          <input type="time" value={time} onChange={e => setTime(e.target.value)}
            className="flex-1 p-2.5 rounded-xl bg-white/70 dark:bg-card border border-rose-200 dark:border-rose-700 outline-none text-sm font-bold text-foreground focus:ring-2 focus:ring-rose-300" />
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        <input value={dose} onChange={e => setDose(e.target.value)} placeholder="ডোজ (যেমন: ১টা)"
          className="flex-1 p-2.5 rounded-xl bg-white/70 dark:bg-card border border-rose-200 dark:border-rose-700 outline-none text-sm font-bold text-foreground focus:ring-2 focus:ring-rose-300" />
        <button onClick={addTime} className="bg-amber-400 hover:bg-amber-500 text-foreground px-3 py-1 rounded-xl text-sm font-bold transition">+ সময়</button>
      </div>
      {times.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-2">
          {times.map(t => (
            <span key={t} className="px-2.5 py-1 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 rounded-lg text-xs font-bold flex items-center gap-1">
              ⏰ {t}
              <button onClick={() => setTimes(times.filter(x => x !== t))} className="text-rose-400 hover:text-rose-600 ml-0.5">×</button>
            </span>
          ))}
        </div>
      )}
      <button onClick={addMedicine} className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl font-bold text-sm transition mb-3 shadow-sm">
        💊 ওষুধ যোগ করুন
      </button>

      {medicines.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">কোনো ওষুধ যোগ করা হয়নি</p>}
      <div className="space-y-2.5">
        {medicines.map(med => (
          <div key={med.id} className="p-3 rounded-xl bg-white/60 dark:bg-card border border-rose-200 dark:border-rose-700/50 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-bold text-sm text-foreground">{med.name}</span>
                {med.dose && <span className="text-xs text-muted-foreground ml-1.5">({med.dose})</span>}
              </div>
              <button onClick={() => {
                onMedicinesChange(medicines.filter(m => m.id !== med.id));
                onDosesChange(doses.filter(d => d.medId !== med.id));
              }} className="text-rose-300 hover:text-destructive text-xs transition">🗑️</button>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {med.times.map(t => {
                const status = getDoseStatus(med.id, t);
                const statusStyles = {
                  taken: 'bg-emerald-500 border-emerald-500 text-white',
                  missed: 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-600 dark:text-red-300',
                  upcoming: 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 animate-pulse',
                  pending: 'bg-white dark:bg-card border-rose-200 dark:border-rose-700 hover:border-emerald-400 text-foreground',
                };
                return (
                  <button key={t} onClick={() => toggleDose(med.id, t)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${statusStyles[status]}`}>
                    {status === 'taken' ? '✅' : status === 'missed' ? '❌' : '⏰'} {t}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicineCard;
