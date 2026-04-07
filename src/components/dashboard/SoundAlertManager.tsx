import { useEffect, useRef } from "react";
import type { DayData, NamazTimes, ExtraSettings, Medicine } from "@/lib/types";
import { getSoundSettings, playNotificationSound } from "@/lib/soundManager";

interface Props {
  data: DayData;
  namazTimes: NamazTimes;
  extraSettings: ExtraSettings;
}

/**
 * Invisible component that checks every minute and plays sounds
 * when it's time for namaz, medicine, tasks, sleep, or water.
 */
const SoundAlertManager = ({ data, namazTimes, extraSettings }: Props) => {
  const alertedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const check = () => {
      const settings = getSoundSettings();
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Namaz alerts
      if (settings.namaz) {
        const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
        for (const key of prayers) {
          const pTime = namazTimes[key];
          if (pTime && currentTime === pTime && !data.namaz[key] && !alertedRef.current.has(`namaz-${key}-${pTime}`)) {
            alertedRef.current.add(`namaz-${key}-${pTime}`);
            playNotificationSound('alert');
          }
        }
      }

      // Medicine alerts
      if (settings.medicine) {
        const medicines: Medicine[] = extraSettings.medicines || [];
        for (const med of medicines) {
          for (const t of med.times) {
            const taken = data.medicineDoses?.find(d => d.medId === med.id && d.time === t)?.taken;
            if (currentTime === t && !taken && !alertedRef.current.has(`med-${med.id}-${t}`)) {
              alertedRef.current.add(`med-${med.id}-${t}`);
              playNotificationSound('alert');
            }
          }
        }
      }

      // Task time alerts
      if (settings.task) {
        for (const task of data.tasks) {
          if (task.time && currentTime === task.time && !task.done && !alertedRef.current.has(`task-${task.id}-${task.time}`)) {
            alertedRef.current.add(`task-${task.id}-${task.time}`);
            playNotificationSound('gentle');
          }
        }
      }

      // Sleep time alert
      if (settings.sleep && extraSettings.sleepTime) {
        if (currentTime === extraSettings.sleepTime && !data.sleepStart && !alertedRef.current.has(`sleep-${extraSettings.sleepTime}`)) {
          alertedRef.current.add(`sleep-${extraSettings.sleepTime}`);
          playNotificationSound('reminder');
        }
      }

      // Water reminder every hour
      if (settings.water && now.getMinutes() === 0 && data.water < 8) {
        const hourKey = `water-${now.getHours()}`;
        if (!alertedRef.current.has(hourKey)) {
          alertedRef.current.add(hourKey);
          playNotificationSound('reminder');
        }
      }
    };

    check();
    const interval = setInterval(check, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [data, namazTimes, extraSettings]);

  return null; // This component renders nothing
};

export default SoundAlertManager;
