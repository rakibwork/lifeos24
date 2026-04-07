import { useState, useEffect, useRef } from "react";
import type { DayData, NamazTimes, ExtraSettings, Goal } from "@/lib/types";

interface ToastNotification {
  id: string;
  icon: string;
  message: string;
  timestamp: number;
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

const NotificationToast = ({ data, namazTimes, extraSettings, goals }: Props) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const prevNotifIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    const generateIds = (): Set<string> => {
      const ids = new Set<string>();
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Namaz
      for (const key of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const) {
        const time = namazTimes[key];
        if (time) {
          const [h, m] = time.split(':').map(Number);
          if (currentMinutes > h * 60 + m && !data.namaz[key]) {
            ids.add(`namaz-${key}`);
          }
        }
      }

      // Tasks
      for (const task of data.tasks) {
        if (task.done || !task.time) continue;
        const [h, m] = task.time.split(':').map(Number);
        const taskMin = h * 60 + m;
        if (currentMinutes >= taskMin - 20 && currentMinutes < taskMin) {
          ids.add(`task-soon-${task.id}`);
        } else if (currentMinutes >= taskMin) {
          ids.add(`task-overdue-${task.id}`);
        }
      }

      // Goals
      for (const goal of goals) {
        if (!goal.target) continue;
        const targetDate = new Date(goal.target);
        const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 5 && diffDays >= 0) ids.add(`goal-${goal.id}`);
        else if (diffDays < 0) ids.add(`goal-expired-${goal.id}`);
      }

      if (!data.mood) ids.add('mood');
      if (data.water < 4) ids.add('water');
      
      const pendingCount = data.tasks.filter(t => !t.done).length;
      if (pendingCount > 0) ids.add('tasks-total');

      if (data.habits.length > 0 && data.habits.filter(h => !h.checked).length > 0) ids.add('habits');

      if (data.medicineDoses) {
        const missed = data.medicineDoses.filter(d => !d.taken).filter(d => {
          const [h, m] = d.time.split(':').map(Number);
          return currentMinutes > h * 60 + m;
        });
        if (missed.length > 0) ids.add('medicine');
      }

      return ids;
    };

    const getNotifMessage = (id: string): { icon: string; message: string } | null => {
      if (id.startsWith('namaz-')) {
        const key = id.replace('namaz-', '');
        return { icon: '🕌', message: `${prayerNames[key]} নামাজের সময় হয়েছে` };
      }
      if (id.startsWith('task-soon-')) return { icon: '⏰', message: 'কাজের সময় আসছে!' };
      if (id.startsWith('task-overdue-')) return { icon: '⚠️', message: 'কাজের সময় পার হয়ে গেছে!' };
      if (id.startsWith('goal-expired-')) return { icon: '🎯', message: 'লক্ষ্যের সময় শেষ!' };
      if (id.startsWith('goal-')) return { icon: '🎯', message: 'লক্ষ্যের সময় ঘনিয়ে আসছে!' };
      if (id === 'mood') return { icon: '😶', message: 'আজকের অনুভূতি সেট করুন' };
      if (id === 'water') return { icon: '💧', message: 'পানি পান করুন!' };
      if (id === 'tasks-total') return { icon: '📋', message: 'বাকি কাজ আছে' };
      if (id === 'habits') return { icon: '🔄', message: 'রুটিনের কাজ বাকি' };
      if (id === 'medicine') return { icon: '💊', message: 'ওষুধ খাওয়া মিস!' };
      return null;
    };

    const currentIds = generateIds();

    if (!initializedRef.current) {
      prevNotifIdsRef.current = currentIds;
      initializedRef.current = true;
      return;
    }

    // Find new notifications
    const newIds = [...currentIds].filter(id => !prevNotifIdsRef.current.has(id));
    prevNotifIdsRef.current = currentIds;

    if (newIds.length > 0) {
      const newToasts: ToastNotification[] = [];
      for (const id of newIds) {
        const msg = getNotifMessage(id);
        if (msg) {
          newToasts.push({ id: `${id}-${Date.now()}`, ...msg, timestamp: Date.now() });
        }
      }
      if (newToasts.length > 0) {
        setToasts(prev => [...prev, ...newToasts]);
      }
    }
  }, [data, namazTimes, extraSettings, goals]);

  // Auto-remove toasts after 5 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => Date.now() - t.timestamp < 5000));
    }, 1000);
    return () => clearTimeout(timer);
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      {toasts.slice(-3).map((toast) => (
        <div
          key={toast.id}
          className="bg-card border-2 border-primary/30 rounded-2xl p-4 shadow-2xl flex items-center gap-3 animate-fade-in-up"
        >
          <span className="text-2xl">{toast.icon}</span>
          <p className="text-sm font-bold text-foreground flex-1">{toast.message}</p>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="text-muted-foreground hover:text-destructive text-xs shrink-0"
          >✕</button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
