import { useState, useRef, useEffect } from "react";
import type { DayData, NamazTimes, ExtraSettings, Goal } from "@/lib/types";

interface Notification {
  id: string;
  icon: string;
  message: string;
  type: 'warning' | 'info';
}

interface Props {
  data: DayData;
  namazTimes: NamazTimes;
  extraSettings: ExtraSettings;
  goals: Goal[];
}

const prayerNames: Record<string, string> = {
  fajr: 'ফজর', dhuhr: 'যোহর', asr: 'আসর', maghrib: 'মাগরিব', isha: 'এশা'
};

function generateNotifications(data: DayData, namazTimes: NamazTimes, extraSettings: ExtraSettings, goals: Goal[]): Notification[] {
  const notifs: Notification[] = [];
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Missed namaz
  const prayerOrder = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
  for (const key of prayerOrder) {
    const time = namazTimes[key];
    if (time) {
      const [h, m] = time.split(':').map(Number);
      const prayerMin = h * 60 + m;
      if (currentMinutes > prayerMin && !data.namaz[key]) {
        notifs.push({ id: `namaz-${key}`, icon: '🕌', message: `${prayerNames[key]} নামাজ এখনো পড়া হয়নি`, type: 'warning' });
      }
    }
  }

  // Task notifications
  for (const task of data.tasks) {
    if (task.done || !task.time) continue;
    const [h, m] = task.time.split(':').map(Number);
    const taskMin = h * 60 + m;
    if (currentMinutes >= taskMin - 20 && currentMinutes < taskMin) {
      notifs.push({ id: `task-soon-${task.id}`, icon: '⏰', message: `"${task.text}" কাজের সময় আসছে! দ্রুত শেষ করুন`, type: 'warning' });
    } else if (currentMinutes >= taskMin) {
      notifs.push({ id: `task-overdue-${task.id}`, icon: '⚠️', message: `"${task.text}" কাজ করা হয়নি, টাইম অনুযায়ী। কাজ শেষ করুন`, type: 'warning' });
    }
  }

  // Goal notifications
  for (const goal of goals) {
    if (!goal.target) continue;
    const targetDate = new Date(goal.target);
    const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 5 && diffDays >= 0) {
      notifs.push({ id: `goal-${goal.id}`, icon: '🎯', message: `"${goal.title}" লক্ষ্যের আর ${diffDays} দিন বাকি!`, type: 'warning' });
    } else if (diffDays < 0) {
      notifs.push({ id: `goal-expired-${goal.id}`, icon: '🎯', message: `"${goal.title}" লক্ষ্যের সময় শেষ হয়ে গেছে!`, type: 'warning' });
    }
  }

  if (!data.mood) {
    notifs.push({ id: 'mood', icon: '😶', message: 'আজকের অনুভূতি সেট করা হয়নি', type: 'info' });
  }

  if (data.water < 4) {
    notifs.push({ id: 'water', icon: '💧', message: `পানি পান মাত্র ${data.water}/৮ গ্লাস হয়েছে`, type: 'warning' });
  }

  const pendingCount = data.tasks.filter(t => !t.done).length;
  if (pendingCount > 0) {
    notifs.push({ id: 'tasks-total', icon: '📋', message: `${pendingCount}টি কাজ বাকি আছে`, type: 'warning' });
  }

  if (data.habits.length > 0) {
    const unchecked = data.habits.filter(h => !h.checked).length;
    if (unchecked > 0) {
      notifs.push({ id: 'habits', icon: '🔄', message: `${unchecked}টি রুটিন বাকি আছে`, type: 'info' });
    }
  }

  if (extraSettings.sleepTime) {
    const [sh, sm] = extraSettings.sleepTime.split(':').map(Number);
    if (currentMinutes > sh * 60 + sm && !data.sleepStart) {
      notifs.push({ id: 'sleep', icon: '🛌', message: `ঘুমের সময় পার হয়ে গেছে (${extraSettings.sleepTime})`, type: 'warning' });
    }
  }

  if (data.notebooks.every(n => !n.content.trim())) {
    notifs.push({ id: 'diary', icon: '📝', message: 'আজ ডায়েরিতে কিছু লেখা হয়নি', type: 'info' });
  }

  if (data.medicineDoses) {
    const missed = data.medicineDoses.filter(d => !d.taken).filter(d => {
      const [h, m] = d.time.split(':').map(Number);
      return currentMinutes > h * 60 + m;
    });
    if (missed.length > 0) {
      notifs.push({ id: 'medicine', icon: '💊', message: `${missed.length}টি ওষুধ খাওয়া মিস হয়েছে!`, type: 'warning' });
    }
  }

  return notifs;
}

const NotificationBell = ({ data, namazTimes, extraSettings, goals }: Props) => {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const allNotifications = generateNotifications(data, namazTimes, extraSettings, goals);
  const notifications = allNotifications.filter(n => !dismissed.has(n.id));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dismissNotif = (id: string) => {
    setDismissed(prev => new Set(prev).add(id));
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full bg-secondary border border-border hover:border-primary transition text-foreground"
      >
        🔔
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-card border border-border rounded-2xl shadow-xl z-50 animate-fade-in-up">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h4 className="font-black text-sm text-foreground">🔔 নোটিফিকেশন</h4>
            {notifications.length > 0 && (
              <button onClick={() => setDismissed(new Set(allNotifications.map(n => n.id)))} className="text-[10px] font-bold text-primary hover:underline">সব মুছুন</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              ✅ সব কিছু ঠিক আছে!
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(n => (
                <div key={n.id} className={`px-4 py-3 flex items-start gap-3 hover:bg-secondary/50 transition ${n.type === 'warning' ? 'bg-destructive/5' : ''}`}>
                  <span className="text-xl mt-0.5">{n.icon}</span>
                  <p className="text-sm font-semibold text-foreground leading-snug flex-1">{n.message}</p>
                  <button onClick={() => dismissNotif(n.id)} className="text-muted-foreground hover:text-destructive text-xs shrink-0 mt-0.5">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
