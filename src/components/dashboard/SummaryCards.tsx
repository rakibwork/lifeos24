import type { DayData, ExtraSettings, AccountPerson } from "@/lib/types";

interface Props {
  data: DayData;
  accounts: Record<string, AccountPerson>;
  monthlyExpense: number;
  extraSettings: ExtraSettings;
}

const SummaryCards = ({ data, accounts, monthlyExpense, extraSettings }: Props) => {
  const tasksDone = data.tasks.filter(t => t.done).length;
  const todayExp = data.expenses.reduce((s, e) => s + e.amt, 0);
  const totalPawa = Object.values(accounts).reduce((sum, person) =>
    sum + person.trans.filter(t => t.type === 'pawa').reduce((s, t) => s + t.amount, 0), 0);
  const totalDena = Object.values(accounts).reduce((sum, person) =>
    sum + person.trans.filter(t => t.type === 'dena').reduce((s, t) => s + t.amount, 0), 0);

  const cards = [
    { icon: "✅", label: "কাজ সম্পন্ন", value: `${tasksDone} টি`, color: "border-b-life-emerald bg-life-emerald-light" },
    { icon: "💰", label: "আজকের খরচ", value: `৳${todayExp}`, color: "border-b-primary bg-life-blue-light" },
    { icon: "📊", label: "মাসিক খরচ", value: `৳${monthlyExpense}`, sub: extraSettings.monthlyLimit ? `/ ৳${extraSettings.monthlyLimit}` : undefined, color: "border-b-life-orange bg-life-orange-light" },
    { icon: "🛌", label: "মোট ঘুম", value: `${data.sleepHours || 0} ঘণ্টা`, color: "border-b-life-indigo bg-life-indigo-light" },
    { icon: "📗", label: "মোট পাওনা", value: `৳${totalPawa}`, color: "border-b-life-emerald bg-life-emerald-light" },
    { icon: "📕", label: "মোট দেনা", value: `৳${totalDena}`, color: "border-b-destructive bg-life-red-light" },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {cards.map((c, i) => (
        <div key={i} className={`rounded-2xl p-3 text-center border-b-4 shadow-sm ${c.color}`}>
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
