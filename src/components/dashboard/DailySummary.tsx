import type { DayData, Goal, NamazTimes, ExtraSettings } from "@/lib/types";

interface Props {
  data: DayData;
  goals: Goal[];
  namazTimes: NamazTimes;
  extraSettings: ExtraSettings;
}

const DailySummary = ({ data }: Props) => {
  const tasksDone = data.tasks.filter(t => t.done).length;
  const namazDone = Object.values(data.namaz).filter(Boolean).length;
  const todayExp = data.expenses.reduce((s, e) => s + e.amt, 0);

  const summary = `আজকে ${tasksDone}টি কাজ সম্পন্ন, ${namazDone}/৫ নামাজ আদায়, ${data.water} গ্লাস পানি পান, ৳${todayExp} খরচ, ${data.sleepHours || 0} ঘণ্টা ঘুম।`;

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-primary shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">🧠 AI দৈনিক সারাংশ</h3>
        <span className="text-xs text-primary font-bold">সারাংশ দেখুন</span>
      </div>
      <div className="p-3 rounded-xl bg-life-blue-light text-sm font-bold text-foreground">
        {summary}
      </div>
    </div>
  );
};

export default DailySummary;
