import { useState, useEffect } from "react";
import type { DayData, Goal } from "@/lib/types";
import { getNamazTimes } from "@/lib/dataStore";

interface Props {
  data: DayData;
  goals: Goal[];
}

const AIAssistant = ({ data, goals }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    const buildInsights = async () => {
      const msgs: string[] = [];
      const now = new Date();
      const namazTimes = getNamazTimes();

      const prayerNames: Record<string, string> = { fajr: "ফজর", dhuhr: "যোহর", asr: "আসর", maghrib: "মাগরিব", isha: "এশা" };
      const missed: string[] = [];
      for (const k in namazTimes) {
        const [h, m] = (namazTimes as unknown as Record<string, string>)[k].split(':').map(Number);
        if ((now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)) && !data.namaz[k]) {
          missed.push(prayerNames[k]);
        }
      }
      if (missed.length > 0) msgs.push(`🕌 আজকে ${missed.join(", ")} নামাজ এখনো আদায় হয়নি।`);
      if (data.water < 8) msgs.push(`💧 পানি কম পান হচ্ছে। এখন পর্যন্ত ${data.water} গ্লাস।`);

      const overdue = data.tasks.filter(t => !t.done && t.time).filter(t => {
        const [h, m] = t.time.split(':').map(Number);
        return now.getHours() * 60 + now.getMinutes() > h * 60 + m;
      });
      if (overdue.length > 0) msgs.push(`⚠️ "${overdue[0].text}" কাজটি সময়সীমা পেরিয়ে গেছে!`);

      const todayExp = data.expenses.reduce((s, e) => s + e.amt, 0);
      if (todayExp > 0) msgs.push(`💸 আজকের খরচ ৳${todayExp}।`);

      if (goals.length > 0) {
        const nearGoal = goals.find(g => {
          const diff = new Date(g.target).getTime() - Date.now();
          return diff > 0 && diff < 86400000;
        });
        if (nearGoal) msgs.push(`🎯 "${nearGoal.title}" লক্ষ্যটি আগামীকালের মধ্যে শেষ!`);
      }

      if (msgs.length === 0) msgs.push("✅ সব ঠিক আছে! চালিয়ে যান। 🎉");
      setInsights(msgs);
    };
    buildInsights();
  }, [data, goals]);

  useEffect(() => {
    if (insights.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % insights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [insights.length]);

  return (
    <div className="bg-gradient-to-r from-primary/10 to-life-indigo-light rounded-2xl p-4 flex items-center gap-3 shadow-sm">
      <div className="text-3xl">🤖</div>
      <div>
        <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">AI Assistant</div>
        <div className="text-sm font-bold text-foreground animate-fade-in-up">{insights[currentIndex] || "বিশ্লেষণ হচ্ছে..."}</div>
      </div>
    </div>
  );
};

export default AIAssistant;
