import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
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
  bazar: number;
  personal: number;
  namazDone: number;
  habitsDone: number;
}

const DAYS_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

type TabKey = 'tasks' | 'expense' | 'water' | 'bazar' | 'personal' | 'namaz' | 'sleep' | 'habits';

const TABS: { key: TabKey; label: string; icon: string; dataKey: keyof WeekDay; unit: string; color: string }[] = [
  { key: 'tasks', label: 'কাজ', icon: '✅', dataKey: 'tasksDone', unit: 'টি', color: 'hsl(var(--primary))' },
  { key: 'expense', label: 'ব্যয়', icon: '💰', dataKey: 'expense', unit: '৳', color: '#f59e0b' },
  { key: 'water', label: 'পানি', icon: '💧', dataKey: 'water', unit: 'গ্লাস', color: '#3b82f6' },
  { key: 'bazar', label: 'বাজার', icon: '🛒', dataKey: 'bazar', unit: '৳', color: '#10b981' },
  { key: 'personal', label: 'ব্যক্তিগত', icon: '👤', dataKey: 'personal', unit: '৳', color: '#8b5cf6' },
  { key: 'namaz', label: 'নামাজ', icon: '🕌', dataKey: 'namazDone', unit: 'ওয়াক্ত', color: '#06b6d4' },
  { key: 'sleep', label: 'ঘুম', icon: '😴', dataKey: 'sleep', unit: 'ঘণ্টা', color: '#6366f1' },
  { key: 'habits', label: 'অভ্যাস', icon: '🔥', dataKey: 'habitsDone', unit: 'টি', color: '#ef4444' },
];

const toBn = (n: number | string) => String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[+d]);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill }} className="font-semibold">
          {toBn(p.value)}
        </p>
      ))}
    </div>
  );
};

const WeeklyAnalytics = () => {
  const [weekData, setWeekData] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('tasks');

  useEffect(() => {
    const loadWeekData = async () => {
      const dates: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      }

      const result: WeekDay[] = [];
      for (const dateStr of dates) {
        const d = new Date(dateStr);
        const dayData = await loadDayData(dateStr);
        const moodMap: Record<string, number> = { sad: 1, neutral: 2, happy: 3, amazing: 4 };
        const expenses = dayData?.expenses || [];
        result.push({
          date: dateStr,
          label: DAYS_BN[d.getDay()],
          mood: dayData ? (moodMap[dayData.mood] || 0) : 0,
          water: dayData?.water || 0,
          tasksDone: dayData?.tasks?.filter(t => t.done).length || 0,
          tasksTotal: dayData?.tasks?.length || 0,
          sleep: dayData?.sleepHours || 0,
          expense: expenses.reduce((s, e) => s + e.amt, 0),
          bazar: expenses.filter(e => e.category === 'বাজার').reduce((s, e) => s + e.amt, 0),
          personal: expenses.filter(e => e.category === 'ব্যাক্তিগত').reduce((s, e) => s + e.amt, 0),
          namazDone: dayData ? Object.values(dayData.namaz).filter(Boolean).length : 0,
          habitsDone: dayData?.habits?.filter(h => h.checked).length || 0,
        });
      }
      setWeekData(result);
      setLoading(false);
    };
    loadWeekData();
  }, []);

  const currentTab = TABS.find(t => t.key === activeTab)!;
  const total = weekData.reduce((s, d) => s + (d[currentTab.dataKey] as number), 0);
  const avg = weekData.length > 0 ? total / weekData.length : 0;
  const max = Math.max(...weekData.map(d => d[currentTab.dataKey] as number), 0);
  const bestDay = weekData.find(d => (d[currentTab.dataKey] as number) === max && max > 0);

  const isMoneyTab = ['expense', 'bazar', 'personal'].includes(activeTab);
  const formatVal = (v: number) => isMoneyTab ? `${toBn(v)}৳` : toBn(v);

  if (loading) return <div className="animate-pulse h-48 bg-secondary rounded-2xl" />;

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-primary/30 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-1.5">📊 সাপ্তাহিক বিশ্লেষণ</h3>
        <span className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded-full">গত ৭ দিন</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar pb-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              activeTab === t.key
                ? 'text-primary-foreground shadow-md scale-[1.02]'
                : 'bg-secondary/80 text-muted-foreground hover:bg-secondary'
            }`}
            style={activeTab === t.key ? { backgroundColor: t.color } : {}}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-secondary/50 rounded-xl p-2.5 text-center">
          <div className="text-lg">{currentTab.icon}</div>
          <div className="text-[11px] text-muted-foreground font-medium">মোট</div>
          <div className="text-sm font-bold" style={{ color: currentTab.color }}>
            {formatVal(Math.round(total * 10) / 10)} {!isMoneyTab && currentTab.unit}
          </div>
        </div>
        <div className="bg-secondary/50 rounded-xl p-2.5 text-center">
          <div className="text-lg">📈</div>
          <div className="text-[11px] text-muted-foreground font-medium">দৈনিক গড়</div>
          <div className="text-sm font-bold" style={{ color: currentTab.color }}>
            {formatVal(Math.round(avg * 10) / 10)} {!isMoneyTab && currentTab.unit}
          </div>
        </div>
        <div className="bg-secondary/50 rounded-xl p-2.5 text-center">
          <div className="text-lg">🏆</div>
          <div className="text-[11px] text-muted-foreground font-medium">সেরা দিন</div>
          <div className="text-sm font-bold" style={{ color: currentTab.color }}>
            {bestDay ? bestDay.label : '—'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="text-xs text-muted-foreground font-medium mb-1.5 flex items-center gap-1">
        {currentTab.icon} প্রতিদিনের {currentTab.label}
      </div>
      <div className="h-52 rounded-xl p-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.3} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} axisLine={false} tickLine={false} dy={6} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.1)' }} />
            <Bar dataKey={currentTab.dataKey as string} radius={[6, 6, 0, 0]} maxBarSize={38} animationDuration={600}>
              {weekData.map((entry, i) => {
                const val = entry[currentTab.dataKey] as number;
                return <Cell key={i} fill={currentTab.color} fillOpacity={max > 0 ? 0.4 + (val / max) * 0.6 : 0.3} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default WeeklyAnalytics;
