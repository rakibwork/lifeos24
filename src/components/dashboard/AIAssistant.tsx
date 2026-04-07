import { useState, useEffect } from "react";
import type { DayData, Goal, Medicine } from "@/lib/types";
import { getNamazTimes, getExtraSettings } from "@/lib/dataStore";

interface Props {
  data: DayData;
  goals: Goal[];
}

const AIAssistant = ({ data, goals }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    const buildInsights = () => {
      const msgs: string[] = [];
      const now = new Date();
      const hour = now.getHours();
      const currentMin = hour * 60 + now.getMinutes();
      const namazTimes = getNamazTimes();
      const settings = getExtraSettings();

      // --- নামাজ সংক্রান্ত উপদেশ ---
      const prayerNames: Record<string, string> = { fajr: "ফজর", dhuhr: "যোহর", asr: "আসর", maghrib: "মাগরিব", isha: "এশা" };
      const prayerAdvice: Record<string, string> = {
        fajr: "ফজরের নামাজ দিনের বরকতের চাবি। এখনই আদায় করে নিন! 🌅",
        dhuhr: "যোহরের নামাজ মিস করবেন না, কাজের ফাঁকে সময় বের করুন। ☀️",
        asr: "আসরের নামাজের সময় পার হচ্ছে! দ্রুত আদায় করুন। 🌤️",
        maghrib: "মাগরিবের নামাজ দেরি না করে এখনই পড়ুন। সূর্যাস্তের পর সময় খুব কম! 🌇",
        isha: "এশার নামাজ পড়ে ঘুমান, দিন শেষ হোক ইবাদতে। 🌙",
      };
      const missed: string[] = [];
      for (const k of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']) {
        const timeStr = (namazTimes as unknown as Record<string, string>)[k];
        if (!timeStr) continue;
        const [h, m] = timeStr.split(':').map(Number);
        if (currentMin > h * 60 + m && !data.namaz[k]) {
          missed.push(k);
        }
      }
      if (missed.length >= 3) {
        msgs.push(`🕌 আজ ${missed.length}টি নামাজ মিস! নামাজ ছাড়া দিন অসম্পূর্ণ। এখনই কাজা আদায় করুন।`);
      } else if (missed.length > 0) {
        msgs.push(`🕌 ${prayerAdvice[missed[missed.length - 1]]}`);
      }
      const namazDone = Object.values(data.namaz).filter(Boolean).length;
      if (namazDone === 5) {
        msgs.push(`🕌 মাশাআল্লাহ! আজ ৫ ওয়াক্ত নামাজ সম্পন্ন! আল্লাহ কবুল করুন। 🤲`);
      }

      // --- পানি সংক্রান্ত উপদেশ ---
      if (data.water === 0) {
        msgs.push(`💧 আজ এক গ্লাস পানিও পান করেননি! শরীরে পানি শূন্যতা হতে পারে। এখনই পানি পান করুন!`);
      } else if (data.water < 3) {
        msgs.push(`💧 মাত্র ${data.water} গ্লাস পানি! মাথাব্যথা ও ক্লান্তির কারণ হতে পারে। প্রতি ঘন্টায় ১ গ্লাস পান করুন।`);
      } else if (data.water < 6) {
        msgs.push(`💧 আরো ${8 - data.water} গ্লাস পানি বাকি। সুস্থ থাকতে দৈনিক ৮ গ্লাস পানি পান করা জরুরি!`);
      } else if (data.water >= 8) {
        msgs.push(`💧 চমৎকার! আজ ${data.water} গ্লাস পানি পান করেছেন। শরীর হাইড্রেটেড আছে! 💪`);
      }

      // --- কাজ সংক্রান্ত উপদেশ ---
      const pendingTasks = data.tasks.filter(t => !t.done);
      const doneTasks = data.tasks.filter(t => t.done);
      const overdue = pendingTasks.filter(t => {
        if (!t.time) return false;
        const [h, m] = t.time.split(':').map(Number);
        return currentMin > h * 60 + m;
      });

      if (overdue.length >= 3) {
        msgs.push(`⚠️ ${overdue.length}টি কাজের সময়সীমা পেরিয়ে গেছে! গুরুত্বপূর্ণটি আগে শেষ করুন।`);
      } else if (overdue.length > 0) {
        msgs.push(`⏰ "${overdue[0].text}" কাজটি সময়সীমা পেরিয়ে গেছে! এখনই শুরু করুন, দেরি করবেন না।`);
      }

      if (data.tasks.length > 0 && doneTasks.length === data.tasks.length) {
        msgs.push(`🎉 অসাধারণ! আজকের সব কাজ সম্পন্ন! আপনি সত্যিই দারুণ পরিকল্পনাবিদ!`);
      } else if (pendingTasks.length > 0 && hour >= 18) {
        msgs.push(`📋 সন্ধ্যা হয়ে গেছে, এখনো ${pendingTasks.length}টি কাজ বাকি! রাতের আগে শেষ করার চেষ্টা করুন।`);
      } else if (data.tasks.length === 0 && hour >= 9) {
        msgs.push(`📝 আজ কোনো কাজ যোগ করেননি! পরিকল্পনা ছাড়া দিন অপচয় হয়। এখনই কিছু কাজ যোগ করুন!`);
      }

      // --- খরচ সংক্রান্ত উপদেশ ---
      const todayExp = data.expenses.reduce((s, e) => s + e.amt, 0);
      if (todayExp > settings.dailyLimit * 1.5) {
        msgs.push(`🚨 আজকের খরচ ৳${todayExp}! বাজেটের দেড় গুণেরও বেশি! অপ্রয়োজনীয় খরচ বন্ধ করুন।`);
      } else if (todayExp > settings.dailyLimit) {
        msgs.push(`💸 আজকের খরচ ৳${todayExp}, বাজেট ছিল ৳${settings.dailyLimit}। বাকি দিন সাশ্রয়ী হোন!`);
      } else if (todayExp === 0 && hour >= 12) {
        msgs.push(`💰 আজ কোনো খরচ রেকর্ড করেননি! খরচ ট্র্যাক করলে সঞ্চয় বাড়ে।`);
      }

      // --- রুটিন/অভ্যাস সংক্রান্ত ---
      const habitsDone = data.habits.filter(h => h.checked).length;
      const habitsTotal = data.habits.length;
      if (habitsTotal > 0 && habitsDone === habitsTotal) {
        msgs.push(`✨ আজকের সব রুটিন সম্পন্ন! ধারাবাহিকতা বজায় রাখুন, সাফল্য আসবেই!`);
      } else if (habitsTotal > 0 && habitsDone === 0 && hour >= 14) {
        msgs.push(`📋 আজ কোনো রুটিনের কাজ করেননি! ছোট ছোট অভ্যাসই বড় পরিবর্তন আনে। শুরু করুন!`);
      } else if (habitsTotal > 0 && habitsDone < habitsTotal) {
        msgs.push(`📋 রুটিনের ${habitsTotal - habitsDone}টি কাজ বাকি। ধাপে ধাপে শেষ করুন, তাড়াহুড়ো নয়!`);
      }

      // --- লক্ষ্য সংক্রান্ত ---
      if (goals.length > 0) {
        msgs.push(`🎯 "${goals[0].title}" — আজ এই লক্ষ্যে কী পদক্ষেপ নিয়েছেন? ছোট একটি পদক্ষেপও গুরুত্বপূর্ণ!`);
      }

      // --- মেজাজ সংক্রান্ত ---
      if (!data.mood && hour >= 10) {
        msgs.push(`😊 আজকের মেজাজ এখনো সেট করেননি। নিজের অনুভূতি ট্র্যাক করা মানসিক স্বাস্থ্যের জন্য ভালো!`);
      } else if (data.mood === 'sad') {
        msgs.push(`💛 মন খারাপ লাগছে? একটু হাঁটতে বের হন, প্রিয়জনের সাথে কথা বলুন। এই সময়ও কেটে যাবে। 🤗`);
      } else if (data.mood === 'angry') {
        msgs.push(`😤 রাগ হচ্ছে? গভীর শ্বাস নিন, ওযু করুন। রাসূল (সাঃ) বলেছেন: রাগ এলে বসে পড়ুন। 🕊️`);
      } else if (data.mood === 'amazing') {
        msgs.push(`🔥 মাশাআল্লাহ! আজ দারুণ মেজাজে আছেন! এই এনার্জি কাজে লাগান, সেরাটা দিন!`);
      } else if (data.mood === 'happy') {
        msgs.push(`😄 আলহামদুলিল্লাহ! ভালো মেজাজ ভালো কাজের প্রেরণা। আজকেই কিছু বিশেষ করুন!`);
      }

      // --- ঘুম সংক্রান্ত ---
      if (!data.sleepStart && !data.sleepEnd && hour >= 12) {
        msgs.push(`😴 আজ ঘুমের তথ্য রেকর্ড করেননি। পর্যাপ্ত ঘুম উৎপাদনশীলতার চাবিকাঠি!`);
      }
      if (data.sleepStart && data.sleepEnd) {
        const [sh, sm] = data.sleepStart.split(':').map(Number);
        const [eh, em] = data.sleepEnd.split(':').map(Number);
        let sleepMins = (eh * 60 + em) - (sh * 60 + sm);
        if (sleepMins < 0) sleepMins += 24 * 60;
        const sleepHours = sleepMins / 60;
        if (sleepHours < 6) {
          msgs.push(`😴 মাত্র ${Math.round(sleepHours)} ঘন্টা ঘুম! ৭-৮ ঘন্টা ঘুমান, না হলে স্বাস্থ্য ক্ষতিগ্রস্ত হবে।`);
        } else if (sleepHours >= 7 && sleepHours <= 8) {
          msgs.push(`😴 চমৎকার! ${Math.round(sleepHours)} ঘন্টা ঘুম হয়েছে। পরিমিত ঘুম = সুস্থ শরীর! ✅`);
        }
      }

      // --- ওষুধ সংক্রান্ত ---
      if (data.medicineDoses) {
        const missedMeds = data.medicineDoses.filter(d => {
          if (d.taken) return false;
          const [h, m] = d.time.split(':').map(Number);
          return currentMin > h * 60 + m;
        });
        if (missedMeds.length >= 2) {
          msgs.push(`💊 ${missedMeds.length}টি ওষুধ মিস! ওষুধ সময়মত না খেলে চিকিৎসা কাজ করবে না। এখনই খান!`);
        } else if (missedMeds.length === 1) {
          msgs.push(`💊 একটি ওষুধ খাওয়া মিস হয়েছে! সুস্থ থাকতে সময়মত ওষুধ খান।`);
        }
        const medicines: Medicine[] = settings.medicines || [];
        const lowPills = medicines.filter(m => m.remainingPills <= 3 && m.remainingPills > 0);
        if (lowPills.length > 0) {
          msgs.push(`💊 "${lowPills[0].name}" প্রায় শেষ! মাত্র ${lowPills[0].remainingPills}টি বাকি। দ্রুত কিনে রাখুন!`);
        }
        const emptyPills = medicines.filter(m => m.remainingPills === 0);
        if (emptyPills.length > 0) {
          msgs.push(`🚨 "${emptyPills[0].name}" ওষুধ শেষ! আজই ফার্মেসি থেকে কিনুন।`);
        }
      }

      // --- ডায়েরি সংক্রান্ত ---
      if (!data.diary && hour >= 20) {
        msgs.push(`📖 আজ ডায়েরি লেখেননি! ঘুমানোর আগে দিনের অভিজ্ঞতা লিখে রাখুন, ভবিষ্যতে কাজে আসবে।`);
      }

      // --- সময় ভিত্তিক উপদেশ ---
      if (hour >= 22) {
        msgs.push(`🌙 রাত হয়ে গেছে! মোবাইল রেখে ঘুমিয়ে পড়ুন। ভালো ঘুম আগামীকালের সাফল্যের ভিত্তি।`);
      } else if (hour >= 4 && hour < 6) {
        msgs.push(`🌅 তাহাজ্জুদের সময়! এই মুহূর্তে দোয়া কবুল হয়। নামাজ পড়ুন ও দোয়া করুন। 🤲`);
      } else if (hour >= 6 && hour < 8) {
        msgs.push(`☀️ সুপ্রভাত! নতুন দিনের শুরুতে বিসমিল্লাহ বলুন ও আজকের পরিকল্পনা করুন।`);
      }

      // --- সব ঠিক থাকলে ---
      if (msgs.length === 0) {
        msgs.push(`👍 আলহামদুলিল্লাহ! আপনি আজ সবকিছু দারুণভাবে করছেন! এভাবে চালিয়ে যান। 🌟`);
      }

      setInsights(msgs);
    };

    buildInsights();
    const interval = setInterval(buildInsights, 60000);
    return () => clearInterval(interval);
  }, [data, goals]);

  useEffect(() => {
    if (insights.length <= 1) return;
    const interval = setInterval(() => setCurrentIndex(i => (i + 1) % insights.length), 5000);
    return () => clearInterval(interval);
  }, [insights.length]);

  return (
    <div className="bg-card rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-sm border border-border flex items-center gap-3 md:gap-4 relative overflow-hidden min-h-[80px] md:min-h-[100px]">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl md:text-2xl shadow-lg shrink-0 animate-bounce">🤖</div>
      <div className="z-10 w-full min-w-0">
        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">AI Assistant</p>
        <div className="text-sm md:text-base font-bold text-foreground transition-all duration-500 leading-snug">{insights[currentIndex] || "আপনার ডেটা বিশ্লেষণ করা হচ্ছে..."}</div>
        <p className="text-[9px] text-muted-foreground mt-1">{insights.length > 1 ? `${currentIndex + 1}/${insights.length} পরামর্শ` : ""}</p>
      </div>
    </div>
  );
};

export default AIAssistant;
