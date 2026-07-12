import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { loadDayData } from "@/lib/dataStore";

interface WeekDay {
  date: string;
  label: string;
  mood: number;
  water: number;
  tasksDone: number;
  sleep: number;
  namazDone: number;
  habitsDone: number;
}

const DAYS_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
const MOOD_EMOJI = ['😐', '😢', '😐', '😊', '🤩'];

type TabKey = 'summary' | 'mood' | 'productivity' | 'health';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'summary', label: 'সারাংশ', icon: '📊' },
  { key: 'mood', label: 'মুড', icon: '😊' },
  { key: 'productivity', label: 'প্রোডাক্টিভিটি', icon: '🎯' },
  { key: 'health', label: 'স্বাস্থ্য', icon: '💚' },
];

const toBn = (n: number | string) => String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[+d]);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-semibold">
          {p.name}: {toBn(p.value)}
        </p>
      ))}
    </div>
  );
};

const WeeklyAnalytics = () => {
  const [weekData, setWeekData] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('summary');

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
        result.push({
          date: dateStr,
          label: DAYS_BN[d.getDay()],
          mood: dayData ? (moodMap[dayData.mood] || 0) : 0,
          water: dayData?.water || 0,
          tasksDone: dayData?.tasks?.filter(t => t.done).length || 0,
          sleep: dayData?.sleepHours || 0,
          namazDone: dayData ? Object.values(dayData.namaz).filter(Boolean).length : 0,
          habitsDone: dayData?.habits?.filter(h => h.checked).length || 0,
        });
      }
      setWeekData(result);
      setLoading(false);
    };
    loadWeekData();
  }, []);

  if (loading) return <div className="animate-pulse h-48 bg-secondary rounded-2xl" />;

  const avgMood = weekData.reduce((s, d) => s + d.mood, 0) / (weekData.filter(d => d.mood > 0).length || 1);
  const avgWater = weekData.reduce((s, d) => s + d.water, 0) / weekData.length;
  const avgSleep = weekData.reduce((s, d) => s + d.sleep, 0) / weekData.length;
  const totalTasks = weekData.reduce((s, d) => s + d.tasksDone, 0);
  const totalNamaz = weekData.reduce((s, d) => s + d.namazDone, 0);
  const totalHabits = weekData.reduce((s, d) => s + d.habitsDone, 0);

  // Card definitions per tab (2 cards each)
  const cardsByTab: Record<TabKey, { icon: string; label: string; value: string; bg: string }[]> = {
    summary: [
      { icon: '😊', label: 'গড় মুড', value: `${toBn(avgMood.toFixed(1))} ঘণ্টা`, bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
      { icon: '💧', label: 'দৈনিক গড় পানি', value: `${toBn(avgWater.toFixed(1))} গ্লাস`, bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    ],
    mood: [
      { icon: '😊', label: 'গড় মুড', value: toBn(avgMood.toFixed(1)), bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
      { icon: '🏆', label: 'সেরা দিন', value: (weekData.reduce((b, d) => d.mood > b.mood ? d : b, weekData[0]).label) || '—', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    ],
    productivity: [
      { icon: '✅', label: 'মোট কাজ', value: `${toBn(totalTasks)} টি`, bg: 'bg-blue-50 dark:bg-blue-950/30' },
      { icon: '🔥', label: 'মোট অভ্যাস', value: `${toBn(totalHabits)} টি`, bg: 'bg-orange-50 dark:bg-orange-950/30' },
    ],
    health: [
      { icon: '💧', label: 'দৈনিক গড় পানি', value: `${toBn(avgWater.toFixed(1))} গ্লাস`, bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
      { icon: '😴', label: 'দৈনিক গড় ঘুম', value: `${toBn(avgSleep.toFixed(1))} ঘণ্টা`, bg: 'bg-violet-50 dark:bg-violet-950/30' },
    ],
  };

  const chartByTab: Record<TabKey, { title: string; render: () => JSX.Element }> = {
    summary: {
      title: 'মুড ও কাজ',
      render: () => (
        <LineChart data={weekData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} dy={6} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={24} domain={[0, 4]} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="mood" name="মুড" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="tasksDone" name="কাজ" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      ),
    },
    mood: {
      title: 'সাপ্তাহিক মুড',
      render: () => (
        <LineChart data={weekData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} dy={6} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={24} domain={[0, 4]} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="mood" name="মুড" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
        </LineChart>
      ),
    },
    productivity: {
      title: 'কাজ ও অভ্যাস',
      render: () => (
        <BarChart data={weekData} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} dy={6} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="tasksDone" name="কাজ" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="habitsDone" name="অভ্যাস" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      ),
    },
    health: {
      title: 'পানি, ঘুম ও নামাজ',
      render: () => (
        <LineChart data={weekData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} dy={6} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="water" name="পানি" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="sleep" name="ঘুম" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="namazDone" name="নামাজ" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      ),
    },
  };

  const cards = cardsByTab[activeTab];
  const chart = chartByTab[activeTab];

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-primary/30 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-1.5">📊 সাপ্তাহিক বিশ্লেষণ</h3>
        <span className="text-xs text-muted-foreground font-medium">গত ৭ দিন</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              activeTab === t.key
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-secondary/70 text-muted-foreground hover:bg-secondary'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* 2 large soft cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {cards.map((c, i) => (
          <div key={i} className={`${c.bg} rounded-2xl p-4 text-center`}>
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-xs text-muted-foreground font-medium mb-1">{c.label}</div>
            <div className="text-lg font-bold text-foreground">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Chart title */}
      <div className="text-xs text-muted-foreground font-medium mb-2">{chart.title}</div>

      {/* Chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          {chart.render()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyAnalytics;
