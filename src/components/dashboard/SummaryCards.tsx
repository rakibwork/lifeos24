import type { DayData, ExtraSettings, AccountPerson } from "@/lib/types";
import { loadDayData } from "@/lib/dataStore";

interface Props {
  data: DayData;
  accounts: Record<string, AccountPerson>;
  monthlyExpense: number;
  extraSettings: ExtraSettings;
}

function getMonthlyByCategory(category: string): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  let total = 0;
  for (let d = 1; d <= 31; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayData = loadDayData(dateStr);
    if (dayData?.expenses) {
      total += dayData.expenses.filter(e => (e.category || 'ব্যাক্তিগত') === category).reduce((s, e) => s + e.amt, 0);
    }
  }
  return total;
}

const SummaryCards = ({ data, accounts, monthlyExpense, extraSettings }: Props) => {
  const todayExp = data.expenses.reduce((s, e) => s + e.amt, 0);
  const todayBazar = data.expenses.filter(e => e.category === 'বাজার').reduce((s, e) => s + e.amt, 0);
  const todayPersonal = data.expenses.filter(e => (e.category || 'ব্যাক্তিগত') === 'ব্যাক্তিগত').reduce((s, e) => s + e.amt, 0);
  const monthlyBazar = getMonthlyByCategory('বাজার');
  const monthlyPersonal = getMonthlyByCategory('ব্যাক্তিগত');
  const totalPawa = Object.values(accounts).reduce((sum, person) =>
    sum + person.trans.filter(t => t.type === 'pawa').reduce((s, t) => s + t.amount, 0), 0);
  const totalDena = Object.values(accounts).reduce((sum, person) =>
    sum + person.trans.filter(t => t.type === 'dena').reduce((s, t) => s + t.amount, 0), 0);

  const cards = [
    { icon: "💰", label: "আজকের খরচ", value: `৳${todayExp}`, color: "border-b-primary bg-life-blue-light" },
    { icon: "📊", label: "মাসিক খরচ", value: `৳${monthlyExpense}`, sub: extraSettings.monthlyLimit ? `/ ৳${extraSettings.monthlyLimit}` : undefined, color: "border-b-life-orange bg-life-orange-light" },
    { icon: "🛒", label: "বাজার", value: `৳${todayBazar}`, sub: `মাসিক: ৳${monthlyBazar}`, color: "border-b-life-emerald bg-life-emerald-light" },
    { icon: "👤", label: "ব্যাক্তিগত", value: `৳${todayPersonal}`, sub: `মাসিক: ৳${monthlyPersonal}`, color: "border-b-life-indigo bg-life-indigo-light" },
    { icon: "🛌", label: "মোট ঘুম", value: `${data.sleepHours || 0} ঘণ্টা`, color: "border-b-life-indigo bg-life-indigo-light" },
    { icon: "📗", label: "মোট পাওনা", value: `৳${totalPawa}`, color: "border-b-life-emerald bg-life-emerald-light" },
    { icon: "📕", label: "মোট দেনা", value: `৳${totalDena}`, color: "border-b-destructive bg-life-red-light" },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
      {cards.map((c, i) => (
        <div key={i} className={`rounded-2xl p-3 text-center border-b-4 border-2 shadow-md relative ${c.color}`}>
          <div className="text-2xl mb-1">{c.icon}</div>
          <div className="text-[10px] font-bold text-muted-foreground">{c.label}</div>
          <div className="text-lg font-bold text-foreground">{c.value}</div>
          {c.sub && <div className="text-[10px] text-muted-foreground">{c.sub}</div>}
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
