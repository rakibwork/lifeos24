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
  const [totalPills, setTotalPills] = useState("");
  const [totalDays, setTotalDays] = useState("");
  const [time, setTime] = useState("");
  const [times, setTimes] = useState<string[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-decrement days at midnight
  useEffect(() => {
    const checkDays = () => {
      const today = new Date().toISOString().split('T')[0];
      const updated = medicines.map(med => {
        if (med.startDate && med.remainingDays > 0) {
          const start = new Date(med.startDate);
          const now = new Date(today);
          const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          const remaining = Math.max(0, med.totalDays - diffDays);
          if (remaining !== med.remainingDays) {
            return { ...med, remainingDays: remaining };
          }
        }
        return med;
      });
      if (JSON.stringify(updated) !== JSON.stringify(medicines)) {
        onMedicinesChange(updated);
      }
    };
    checkDays();
    const interval = setInterval(checkDays, 60000);
    return () => clearInterval(interval);
  }, [medicines, onMedicinesChange]);

  const addTime = () => {
    if (time && !times.includes(time)) {
      setTimes([...times, time].sort());
      setTime("");
    }
  };

  const addMedicine = () => {
    if (!name.trim() || times.length === 0) return;
    const pills = parseInt(totalPills) || 0;
    const days = parseInt(totalDays) || 0;
    const today = new Date().toISOString().split('T')[0];
    const newMed: Medicine = {
      id: Date.now(),
      name,
      dose: `${pills}টি ${days}দিন`,
      times,
      totalPills: pills,
      remainingPills: pills,
      totalDays: days,
      remainingDays: days,
      startDate: today,
    };
    onMedicinesChange([...medicines, newMed]);
    const newDoses = times.map(t => ({ medId: newMed.id, time: t, taken: false }));
    onDosesChange([...doses, ...newDoses]);
    setName("");
    setTotalPills("");
    setTotalDays("");
    setTimes([]);
  };

  const toggleDose = (medId: number, doseTime: string) => {
    const existing = doses.find(d => d.medId === medId && d.time === doseTime);
    const med = medicines.find(m => m.id === medId);
    if (!med) return;

    if (existing) {
      const wasTaken = existing.taken;
      onDosesChange(doses.map(d =>
        d.medId === medId && d.time === doseTime ? { ...d, taken: !d.taken } : d
      ));
      // Update remaining pills
      onMedicinesChange(medicines.map(m =>
        m.id === medId
          ? { ...m, remainingPills: Math.max(0, m.remainingPills + (wasTaken ? 1 : -1)) }
          : m
      ));
    } else {
      onDosesChange([...doses, { medId, time: doseTime, taken: true }]);
      onMedicinesChange(medicines.map(m =>
        m.id === medId
          ? { ...m, remainingPills: Math.max(0, m.remainingPills - 1) }
          : m
      ));
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
    <div className="bg-card rounded-2xl p-5 border border-border border-t-4 border-t-pink-400 shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-pink-500 flex items-center gap-2">
        💊 ওষুধ রিমাইন্ডার
      </h3>

      {/* Medicine Name & Time */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="ওষুধের নাম..."
          className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800 outline-none text-sm font-bold text-foreground focus:ring-2 focus:ring-pink-300 placeholder:text-muted-foreground"
        />
        <div className="flex gap-1">
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="flex-1 p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800 outline-none text-sm font-bold text-foreground focus:ring-2 focus:ring-pink-300"
          />
        </div>
      </div>

      {/* Total Pills & Total Days */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <input
          type="number"
          value={totalPills}
          onChange={e => setTotalPills(e.target.value)}
          placeholder="মোট কয়টা"
          className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800 outline-none text-sm font-bold text-foreground focus:ring-2 focus:ring-pink-300 placeholder:text-muted-foreground"
        />
        <input
          type="number"
          value={totalDays}
          onChange={e => setTotalDays(e.target.value)}
          placeholder="কত দিন"
          className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800 outline-none text-sm font-bold text-foreground focus:ring-2 focus:ring-pink-300 placeholder:text-muted-foreground"
        />
        <button
          onClick={addTime}
          className="bg-pink-400 hover:bg-pink-500 text-white px-3 py-1 rounded-xl text-sm font-bold transition"
        >
          + সময়
        </button>
      </div>

      {/* Selected Times */}
      {times.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-2">
          {times.map(t => (
            <span key={t} className="px-2.5 py-1 bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 rounded-lg text-xs font-bold flex items-center gap-1">
              ⏰ {t}
              <button onClick={() => setTimes(times.filter(x => x !== t))} className="text-pink-400 hover:text-pink-600 ml-0.5">×</button>
            </span>
          ))}
        </div>
      )}

      <button
        onClick={addMedicine}
        className="w-full bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white py-2.5 rounded-xl font-bold text-sm transition mb-3 shadow-sm"
      >
        💊 ওষুধ যোগ করুন
      </button>

      {medicines.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">কোনো ওষুধ যুক্ত করা হয়নি</p>
      )}

      <div className="space-y-2.5">
        {medicines.map(med => (
          <div key={med.id} className="p-3 rounded-xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800/50 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">{med.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 px-2 py-0.5 rounded-lg">
                  {med.remainingPills}টি {med.remainingDays}দিন
                </span>
                <button
                  onClick={() => {
                    onMedicinesChange(medicines.filter(m => m.id !== med.id));
                    onDosesChange(doses.filter(d => d.medId !== med.id));
                  }}
                  className="text-pink-300 hover:text-destructive text-xs transition"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {med.times.map(t => {
                const status = getDoseStatus(med.id, t);
                const statusStyles = {
                  taken: 'bg-emerald-500 border-emerald-500 text-white',
                  missed: 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700 text-red-600 dark:text-red-300',
                  upcoming: 'bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 animate-pulse',
                  pending: 'bg-white dark:bg-card border-pink-200 dark:border-pink-700 hover:border-emerald-400 text-foreground',
                };
                return (
                  <button
                    key={t}
                    onClick={() => toggleDose(med.id, t)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${statusStyles[status]}`}
                  >
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
