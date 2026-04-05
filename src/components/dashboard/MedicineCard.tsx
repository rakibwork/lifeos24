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

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-life-red shadow-sm">
      <h3 className="text-sm font-bold mb-3 text-life-red">💊 ওষুধ রিমাইন্ডার</h3>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="ওষুধের নাম..." className="p-2 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground" />
        <div className="flex gap-1">
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="flex-1 p-2 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground" />
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        <input value={dose} onChange={e => setDose(e.target.value)} placeholder="ডোজ" className="flex-1 p-2 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground" />
        <button onClick={addTime} className="bg-life-yellow text-foreground px-3 py-1 rounded-xl text-sm font-bold">+ সময়</button>
      </div>
      {times.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {times.map(t => <span key={t} className="px-2 py-0.5 bg-life-red-light text-life-red rounded-lg text-xs font-bold">{t}</span>)}
        </div>
      )}
      <button onClick={addMedicine} className="w-full bg-life-red text-primary-foreground py-2 rounded-xl font-bold text-sm hover:opacity-90 transition mb-3">ওষুধ যোগ করুন</button>

      {medicines.length === 0 && <p className="text-xs text-muted-foreground text-center">কোনো ওষুধ যোগ করা হয়নি</p>}
      <div className="space-y-2">
        {medicines.map(med => (
          <div key={med.id} className="p-3 rounded-xl bg-life-red-light border border-life-red/20">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm">{med.name} {med.dose && `(${med.dose})`}</span>
              <button onClick={() => {
                onMedicinesChange(medicines.filter(m => m.id !== med.id));
                onDosesChange(doses.filter(d => d.medId !== med.id));
              }} className="text-destructive/40 hover:text-destructive text-xs">🗑️</button>
            </div>
            <div className="flex gap-1 flex-wrap">
              {med.times.map(t => {
                const d = doses.find(dd => dd.medId === med.id && dd.time === t);
                return (
                  <button key={t} onClick={() => toggleDose(med.id, t)} className={`px-2 py-1 rounded-lg text-xs font-bold border transition ${d?.taken ? 'bg-life-emerald border-life-emerald text-primary-foreground' : 'bg-card border-border hover:border-life-emerald/50'}`}>
                    {t} {d?.taken && '✓'}
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
