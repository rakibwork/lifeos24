import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { loadDayData } from "@/lib/dataStore";
import type { DayData } from "@/lib/types";

interface WeekDay {
  date: string;
  label: string;
  mood: number;
  water: number;
  tasksDone: number;
  tasksTotal: number;
  sleep: number;
  expense: number;
  namazDone: number;
  habitsDone: number;
}

const DAYS_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

const WeeklyAnalytics = () => {
  const [weekData, setWeekData] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'mood' | 'productivity' | 'health'>('overview');

  useEffect(() => {
    const loadWeekData = async () => {
      const dates: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
      }

      const result: WeekDay[] = [];
      for (const dateStr of dates) {
        const d = new Date(dateStr);
        const dayData = await loadDayData(dateStr);
        const moodMap: Record<string, number> = { sad: 1, neutral: 2, happy: 3, amazing: 4 };
        result.push({
          date: dateStr,
          label: DAYS_BN[d.getDay()],
          mood: dayData ? (moodMap[dayData.mood] || 0) : 0,
          water: dayData?.water || 0,
          tasksDone: dayData?.tasks?.filter(t => t.done).length || 0,
          tasksTotal: dayData?.tasks?.length || 0,
          sleep: dayData?.sleepHours || 0,
          expense: dayData?.expenses?.reduce((s, e) => s + e.amt, 0) || 0,
          namazDone: dayData ? Object.values(dayData.namaz).filter(Boolean).length : 0,
          habitsDone: dayData?.habits?.filter(h => h.checked).length || 0,
        });
      }
      setWeekData(result);
      setLoading(false);
    };
    loadWeekData();
  }, []);

  const totalSleep = weekData.reduce((s, d) => s + d.sleep, 0);
  const avgSleep = weekData.length > 0 ? (totalSleep / weekData.length).toFixed(1) : '0';
  const totalExpense = weekData.reduce((s, d) => s + d.expense, 0);

  const tabs = [
    { key: 'overview', label: '📊 সারাংশ', color: 'bg-primary' },
    { key: 'mood', label: '😊 মুড', color: 'bg-life-yellow' },
    { key: 'productivity', label: '🎯 প্রোডাক্টিভিটি', color: 'bg-life-emerald' },
    { key: 'health', label: '💚 স্বাস্থ্য', color: 'bg-life-teal' },
  ] as const;

  if (loading) return <div className="animate-pulse h-40 bg-secondary rounded-2xl" />;

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-primary shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">📊 সাপ্তাহিক বিশ্লেষণ</h3>
        <span className="text-[10px] text-muted-foreground font-bold">গত ৭ দিন</span>
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition ${activeTab === t.key ? `${t.color} text-primary-foreground` : 'bg-secondary text-muted-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-life-blue-light rounded-2xl p-3 text-center">
          <div className="text-2xl">😊</div>
          <div className="text-[10px] text-muted-foreground font-bold">গড় মুড</div>
          <div className="font-bold">{(weekData.reduce((s, d) => s + d.mood, 0) / weekData.length).toFixed(1)} ঘণ্টা</div>
        </div>
        <div className="bg-life-emerald-light rounded-2xl p-3 text-center">
          <div className="text-2xl">💧</div>
          <div className="text-[10px] text-muted-foreground font-bold">দৈনিক গড় পানি</div>
          <div className="font-bold">{(weekData.reduce((s, d) => s + d.water, 0) / weekData.length).toFixed(1)} গ্লাস</div>
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground font-bold mb-1">মুড ও কাজ</div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekData}>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="tasksDone" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="water" fill="hsl(var(--emerald))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyAnalytics;
