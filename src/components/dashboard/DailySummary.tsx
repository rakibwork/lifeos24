import { useState, useCallback } from "react";
import type { DayData, Goal, NamazTimes, ExtraSettings } from "@/lib/types";

interface Props {
  data: DayData;
  goals: Goal[];
  namazTimes: NamazTimes;
  extraSettings: ExtraSettings;
}

const DailySummary = ({ data, goals, namazTimes, extraSettings }: Props) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateSummary = useCallback(() => {
    setLoading(true);
    setSummary(null);

    setTimeout(() => {
      const now = new Date();
      const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

      const tasksDone = data.tasks.filter(t => t.done).length;
      const tasksTotal = data.tasks.length;
      const namazDone = Object.values(data.namaz).filter(Boolean).length;
      const todayExp = data.expenses.reduce((s, e) => s + e.amt, 0);
      const habitsDone = data.habits.filter(h => h.checked).length;
      const habitsTotal = data.habits.length;

      // Calculate score
      const namazP = namazDone * 5;
      const waterP = Math.min(data.water * 2, 16);
      const total = tasksTotal + habitsTotal;
      const done = tasksDone + habitsDone;
      const workP = total > 0 ? (done / total) * 59 : 0;
      const score = Math.min(100, Math.round(namazP + waterP + workP));

      let grade = 'F';
      if (score >= 90) grade = 'A+';
      else if (score >= 80) grade = 'A';
      else if (score >= 70) grade = 'B';
      else if (score >= 60) grade = 'C';
      else if (score >= 40) grade = 'D';

      let gradeMsg = '';
      if (score >= 80) gradeMsg = 'অসাধারণ! আপনি দারুণ করছেন! 🎉';
      else if (score >= 60) gradeMsg = 'ভালো চলছে, আরেকটু চেষ্টা করুন! 💪';
      else if (score >= 40) gradeMsg = 'আজ অনেক কিছু বাকি আছে। এখনো সময় আছে, শুরু করুন! ⏳';
      else gradeMsg = 'আজ অনেক কিছু বাকি আছে। এখনো সময় আছে, শুরু করুন! ⏳';

      // Missing items
      const prayerNames: Record<string, string> = { fajr: 'ফজর', dhuhr: 'যোহর', asr: 'আসর', maghrib: 'মাগরিব', isha: 'এশা' };
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const missedNamaz: string[] = [];
      for (const key of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
        const time = namazTimes[key as keyof NamazTimes];
        if (time && currentTime > time && !data.namaz[key]) {
          missedNamaz.push(prayerNames[key]);
        }
      }

      const missing: string[] = [];
      if (missedNamaz.length > 0) missing.push(`🕌 ${missedNamaz.length}টি নামাজ বাকি: ${missedNamaz.join(', ')}`);
      if (data.water < 8) missing.push(`💧 পানি: আরো ${8 - data.water} গ্লাস পানি পান করা দরকার (লক্ষ্য: ৮ গ্লাস)`);
      if (!data.sleepStart && !data.sleepEnd) missing.push(`😴 ঘুমের রেকর্ড: আজ ঘুমের তথ্য রেকর্ড করা হয়নি`);
      if (!data.mood) missing.push(`😊 মেজাজ: আজকের মেজাজ নির্ধারণ করা হয়নি`);

      // Suggestions
      const suggestions: string[] = [];
      if (missedNamaz.length > 0) suggestions.push(`🕌 ${missedNamaz.join(', ')} নামাজ আদায় করুন। আলার্ম সেট করে রাখুন!`);
      if (data.water < 4) suggestions.push(`💧 খুব কম পানি পান করেছেন! এখনই এক গ্লাস পানি পান করুন এবং প্রতি ঘন্টায় পানি খাওয়ার অভ্যাস করুন।`);
      if (tasksTotal === 0) suggestions.push(`📋 আজ কোনো কাজ যোগ করেননি। দিনের শুরুতে কাজের তালিকা তৈরি করুন।`);

      // Action items
      const actions: string[] = [];
      if (tasksDone === tasksTotal && tasksTotal > 0) actions.push(`✅ সব কাজ শেষ! নতুন লক্ষ্য সেট করুন`);
      if (missedNamaz.length > 0) actions.push(`🕌 ${missedNamaz.join(' ও ')} নামাজ পড়ুন`);
      if (data.water < 8) actions.push(`💧 আরো ${8 - data.water} গ্লাস পানি পান করুন`);
      if (!data.sleepStart) actions.push(`😴 আজ রাতে ঘুমের সময় রেকর্ড করুন`);
      actions.push(`📖 দিনের শেষে কুরআন তিলাওয়াত করুন`);
      actions.push(`🤲 সকাল-সন্ধ্যার দোয়া পড়ুন`);

      const result = JSON.stringify({
        dateStr, score, grade, gradeMsg,
        tasksDone, tasksTotal, namazDone, water: data.water,
        missing, suggestions, actions
      });

      setSummary(result);
      setLoading(false);
    }, 1000);
  }, [data, goals, namazTimes, extraSettings]);

  const parsed = summary ? JSON.parse(summary) : null;

  return (
    <div className="bg-card rounded-2xl p-5 border-2 border-primary shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black text-primary flex items-center gap-2">
          🤖 AI দৈনিক সারাংশ
        </h3>
        <button
          onClick={generateSummary}
          disabled={loading}
          className="bg-primary text-primary-foreground px-5 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition flex items-center gap-2"
        >
          ✏️ {loading ? "তৈরি হচ্ছে..." : parsed ? "আবার তৈরি করুন" : "সারাংশ তৈরি"}
        </button>
      </div>

      {loading && !parsed && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-3xl mb-2 animate-pulse">🔄</div>
          <p className="text-sm font-bold">AI আপনার দিন বিশ্লেষণ করছে...</p>
        </div>
      )}

      {parsed && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Header */}
          <div className="bg-secondary/50 rounded-xl p-4 text-center border border-border">
            <p className="font-bold text-sm mb-1">📅 আজকের সারাংশ — {parsed.dateStr}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-black text-primary">{parsed.grade}</span>
              <div className="text-left">
                <p className="text-xs font-bold text-muted-foreground">দৈনিক স্কোর: {parsed.score}/100</p>
                <p className="text-sm font-bold text-foreground">{parsed.gradeMsg}</p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary/30 rounded-xl p-3 text-center border border-border">
              <p className="text-lg font-black">{parsed.tasksDone}/{parsed.tasksTotal}</p>
              <p className="text-[10px] font-bold text-muted-foreground">কাজ</p>
            </div>
            <div className="bg-secondary/30 rounded-xl p-3 text-center border border-border">
              <p className="text-lg font-black">{parsed.namazDone}/5</p>
              <p className="text-[10px] font-bold text-muted-foreground">নামাজ</p>
            </div>
            <div className="bg-secondary/30 rounded-xl p-3 text-center border border-border">
              <p className="text-lg font-black">{parsed.water}</p>
              <p className="text-[10px] font-bold text-muted-foreground">পানি 💧</p>
            </div>
          </div>

          {/* Missing section */}
          {parsed.missing.length > 0 && (
            <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/20">
              <h4 className="text-sm font-black text-destructive mb-2">❌ ✗ যা করেননি / বাকি আছে</h4>
              <div className="space-y-1.5">
                {parsed.missing.map((m: string, i: number) => (
                  <p key={i} className="text-sm font-semibold text-foreground">{m}</p>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {parsed.suggestions.length > 0 && (
            <div className="bg-life-yellow/10 rounded-xl p-4 border border-life-yellow/30">
              <h4 className="text-sm font-black text-life-yellow mb-2">💡 🤔 কি করলে ভালো হবে</h4>
              <div className="space-y-1.5">
                {parsed.suggestions.map((s: string, i: number) => (
                  <p key={i} className="text-sm font-semibold text-foreground">{s}</p>
                ))}
              </div>
            </div>
          )}

          {/* Action items */}
          <div className="bg-life-emerald/5 rounded-xl p-4 border border-life-emerald/30">
            <h4 className="text-sm font-black text-life-emerald mb-2">☰ 📊 আপনার করণীয়</h4>
            <div className="space-y-1.5">
              {parsed.actions.map((a: string, i: number) => (
                <p key={i} className="text-sm font-semibold text-foreground">{a}</p>
              ))}
            </div>
          </div>

          {/* Timestamp */}
          <p className="text-center text-[10px] text-muted-foreground font-bold">
            ⓘ সারাংশ তৈরি সময়ঃ {new Date().toLocaleTimeString('bn-BD')}
          </p>
        </div>
      )}

      {!parsed && !loading && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm font-bold text-muted-foreground">বাটন ক্লিক করে আজকের দিনের AI সারাংশ তৈরি করুন</p>
        </div>
      )}
    </div>
  );
};

export default DailySummary;
