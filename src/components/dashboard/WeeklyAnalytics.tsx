import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { loadDayData } from "@/lib/dataStore";

interface WeekDay {
  date: string;
  label: string;
  mood: number;
  water: number;
  tasksDone: number;
  tasksTotal: number;
  sleep: number;
  namazDone: number;
  habitsDone: number;
  expense: number;
  bazar: number;
  personal: number;
}

const DAYS_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

type TabKey = 'summary' | 'mood' | 'productivity' | 'health' | 'water' | 'sleep' | 'namaz' | 'expense' | 'habits' | 'tasks';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'summary', label: 'সারাংশ', icon: '📊' },
  { key: 'mood', label: 'মুড', icon: '😊' },
  { key: 'productivity', label: 'প্রোডাক্টিভিটি', icon: '🎯' },
  { key: 'health', label: 'স্বাস্থ্য', icon: '💚' },
  { key: 'water', label: 'পানি', icon: '💧' },
  { key: 'sleep', label: 'ঘুম', icon: '😴' },
  { key: 'namaz', label: 'নামাজ', icon: '🕌' },
  { key: 'expense', label: 'খরচ', icon: '💰' },
  { key: 'tasks', label: 'কাজ', icon: '✅' },
  { key: 'habits', label: 'অভ্যাস', icon: '🔥' },
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
        const expenses = dayData?.expenses || [];
        result.push({
          date: dateStr,
          label: DAYS_BN[d.getDay()],
          mood: dayData ? (moodMap[dayData.mood] || 0) : 0,
          water: dayData?.water || 0,
          tasksDone: dayData?.tasks?.filter(t => t.done).length || 0,
          tasksTotal: dayData?.tasks?.length || 0,
          sleep: dayData?.sleepHours || 0,
          namazDone: dayData ? Object.values(dayData.namaz).filter(Boolean).length : 0,
          habitsDone: dayData?.habits?.filter(h => h.checked).length || 0,
          expense: expenses.reduce((s, e) => s + e.amt, 0),
          bazar: expenses.filter(e => e.category === 'বাজার').reduce((s, e) => s + e.amt, 0),
          personal: expenses.filter(e => e.category === 'ব্যাক্তিগত').reduce((s, e) => s + e.amt, 0),
        });
      }
      setWeekData(result);
      setLoading(false);
    };
    loadWeekData();
  }, []);

  if (loading) return <div className="animate-pulse h-48 bg-secondary rounded-2xl" />;

  const nz = (arr: number[]) => arr.filter(v => v > 0);
  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

  const avgMood = avg(nz(weekData.map(d => d.mood)));
  const avgWater = avg(weekData.map(d => d.water));
  const avgSleep = avg(weekData.map(d => d.sleep));
  const totalTasks = sum(weekData.map(d => d.tasksDone));
  const totalTasksAll = sum(weekData.map(d => d.tasksTotal));
  const totalNamaz = sum(weekData.map(d => d.namazDone));
  const totalHabits = sum(weekData.map(d => d.habitsDone));
  const totalExpense = sum(weekData.map(d => d.expense));
  const totalBazar = sum(weekData.map(d => d.bazar));
  const totalPersonal = sum(weekData.map(d => d.personal));
  const bestMoodDay = weekData.reduce((b, d) => d.mood > b.mood ? d : b, weekData[0]);
  const bestNamazDay = weekData.reduce((b, d) => d.namazDone > b.namazDone ? d : b, weekData[0]);

  const cardsByTab: Record<TabKey, { icon: string; label: string; value: string; bg: string }[]> = {
    summary: [
      { icon: '😊', label: 'গড় মুড', value: toBn(avgMood.toFixed(1)), bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
      { icon: '💧', label: 'দৈনিক গড় পানি', value: `${toBn(avgWater.toFixed(1))} গ্লাস`, bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    ],
    mood: [
      { icon: '😊', label: 'গড় মুড', value: toBn(avgMood.toFixed(1)), bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
      { icon: '🏆', label: 'সেরা দিন', value: bestMoodDay?.label || '—', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    ],
    productivity: [
      { icon: '✅', label: 'মোট কাজ', value: `${toBn(totalTasks)} টি`, bg: 'bg-blue-50 dark:bg-blue-950/30' },
      { icon: '🔥', label: 'মোট অভ্যাস', value: `${toBn(totalHabits)} টি`, bg: 'bg-orange-50 dark:bg-orange-950/30' },
    ],
    health: [
      { icon: '💧', label: 'দৈনিক গড় পানি', value: `${toBn(avgWater.toFixed(1))} গ্লাস`, bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
      { icon: '😴', label: 'দৈনিক গড় ঘুম', value: `${toBn(avgSleep.toFixed(1))} ঘণ্টা`, bg: 'bg-violet-50 dark:bg-violet-950/30' },
    ],
    water: [
      { icon: '💧', label: 'দৈনিক গড়', value: `${toBn(avgWater.toFixed(1))} গ্লাস`, bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
      { icon: '🌊', label: 'সাপ্তাহিক মোট', value: `${toBn(sum(weekData.map(d => d.water)))} গ্লাস`, bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
    ],
    sleep: [
      { icon: '😴', label: 'দৈনিক গড় ঘুম', value: `${toBn(avgSleep.toFixed(1))} ঘণ্টা`, bg: 'bg-violet-50 dark:bg-violet-950/30' },
      { icon: '🛏️', label: 'সাপ্তাহিক মোট', value: `${toBn(sum(weekData.map(d => d.sleep)).toFixed(0))} ঘণ্টা`, bg: 'bg-purple-50 dark:bg-purple-950/30' },
    ],
    namaz: [
      { icon: '🕌', label: 'মোট নামাজ', value: `${toBn(totalNamaz)} ওয়াক্ত`, bg: 'bg-teal-50 dark:bg-teal-950/30' },
      { icon: '🏆', label: 'সেরা দিন', value: bestNamazDay?.label || '—', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    ],
    expense: [
      { icon: '💰', label: 'মোট খরচ', value: `৳${toBn(totalExpense)}`, bg: 'bg-rose-50 dark:bg-rose-950/30' },
      { icon: '📊', label: 'দৈনিক গড়', value: `৳${toBn((totalExpense / 7).toFixed(0))}`, bg: 'bg-orange-50 dark:bg-orange-950/30' },
    ],
    tasks: [
      { icon: '✅', label: 'সম্পন্ন কাজ', value: `${toBn(totalTasks)} টি`, bg: 'bg-blue-50 dark:bg-blue-950/30' },
      { icon: '📋', label: 'মোট কাজ', value: `${toBn(totalTasksAll)} টি`, bg: 'bg-sky-50 dark:bg-sky-950/30' },
    ],
    habits: [
      { icon: '🔥', label: 'মোট অভ্যাস', value: `${toBn(totalHabits)} বার`, bg: 'bg-orange-50 dark:bg-orange-950/30' },
      { icon: '📈', label: 'দৈনিক গড়', value: `${toBn((totalHabits / 7).toFixed(1))} টি`, bg: 'bg-amber-50 dark:bg-amber-950/30' },
    ],
  };

  const axisProps = {
    tick: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' },
    axisLine: false as const,
    tickLine: false as const,
  };

  const chartByTab: Record<TabKey, { title: string; render: () => JSX.Element }> = {
    summary: {
      title: 'মুড ও কাজ',
      render: () => (
        <LineChart data={weekData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis dataKey="label" {...axisProps} dy={6} />
          <YAxis {...axisProps} width={24} domain={[0, 4]} allowDecimals={false} />
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
          <XAxis dataKey="label" {...axisProps} dy={6} />
          <YAxis {...axisProps} width={24} domain={[0, 4]} />
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
          <XAxis dataKey="label" {...axisProps} dy={6} />
          <YAxis {...axisProps} width={24} allowDecimals={false} />
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
          <XAxis dataKey="label" {...axisProps} dy={6} />
          <YAxis {...axisProps} width={24} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="water" name="পানি" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="sleep" name="ঘুম" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="namazDone" name="নামাজ" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      ),
    },
    water: {
      title: 'দৈনিক পানি (গ্লাস)',
      render: () => (
        <AreaChart data={weekData}>
          <defs>
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis dataKey="label" {...axisProps} dy={6} />
          <YAxis {...axisProps} width={24} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="water" name="পানি" stroke="#10b981" strokeWidth={2.5} fill="url(#waterGrad)" />
        </AreaChart>
      ),
    },
    sleep: {
      title: 'দৈনিক ঘুম (ঘণ্টা)',
      render: () => (
        <BarChart data={weekData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis dataKey="label" {...axisProps} dy={6} />
          <YAxis {...axisProps} width={24} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="sleep" name="ঘুম" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      ),
    },
    namaz: {
      title: 'দৈনিক নামাজ (ওয়াক্ত)',
      render: () => (
        <BarChart data={weekData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis dataKey="label" {...axisProps} dy={6} />
          <YAxis {...axisProps} width={24} domain={[0, 5]} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="namazDone" name="নামাজ" fill="#06b6d4" radius={[4, 4, 0, 0]} />
        </BarChart>
      ),
    },
    expense: {
      title: 'দৈনিক খরচ (৳)',
      render: () => (
        <BarChart data={weekData} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis dataKey="label" {...axisProps} dy={6} />
          <YAxis {...axisProps} width={30} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="bazar" name="বাজার" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} />
          <Bar dataKey="personal" name="ব্যাক্তিগত" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      ),
    },
    tasks: {
      title: 'দৈনিক কাজ',
      render: () => (
        <BarChart data={weekData} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis dataKey="label" {...axisProps} dy={6} />
          <YAxis {...axisProps} width={24} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="tasksDone" name="সম্পন্ন" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="tasksTotal" name="মোট" fill="#93c5fd" radius={[4, 4, 0, 0]} />
        </BarChart>
      ),
    },
    habits: {
      title: 'দৈনিক অভ্যাস',
      render: () => (
        <AreaChart data={weekData}>
          <defs>
            <linearGradient id="habitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <XAxis dataKey="label" {...axisProps} dy={6} />
          <YAxis {...axisProps} width={24} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="habitsDone" name="অভ্যাস" stroke="#f97316" strokeWidth={2.5} fill="url(#habitGrad)" />
        </AreaChart>
      ),
    },
  };

  const cards = cardsByTab[activeTab];
  const chart = chartByTab[activeTab];

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-primary/30 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-1.5">📊 সাপ্তাহিক বিশ্লেষণ</h3>
        <span className="text-xs text-muted-foreground font-medium">গত ৭ দিন</span>
      </div>

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

      <div className="grid grid-cols-2 gap-3 mb-5">
        {cards.map((c, i) => (
          <div key={i} className={`${c.bg} rounded-2xl p-4 text-center`}>
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-xs text-muted-foreground font-medium mb-1">{c.label}</div>
            <div className="text-lg font-bold text-foreground">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground font-medium mb-2">{chart.title}</div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          {chart.render()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyAnalytics;
