import { useEffect, useRef } from "react";
import type { DayData, NamazTimes, ExtraSettings, Medicine } from "@/lib/types";
import { getSoundSettings, playNotificationSound, speakBengali } from "@/lib/soundManager";

interface Props {
  data: DayData;
  namazTimes: NamazTimes;
  extraSettings: ExtraSettings;
}

const namazNames: Record<string, string> = {
  fajr: 'ফজর',
  dhuhr: 'যোহর',
  asr: 'আসর',
  maghrib: 'মাগরিব',
  isha: 'এশা',
};

const SoundAlertManager = ({ data, namazTimes, extraSettings }: Props) => {
  const alertedRef = useRef<Set<string>>(new Set());

  // Load voices on mount (needed for some browsers)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

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
            setTimeout(() => {
              speakBengali(`আসসালামু আলাইকুম। এখন ${namazNames[key]} নামাজের সময় হয়েছে। অনুগ্রহ করে নামাজ পড়ুন। আল্লাহ আপনার নামাজ কবুল করুন।`);
            }, 1500);
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
              setTimeout(() => {
                speakBengali(`ওষুধ খাওয়ার সময় হয়েছে। ${med.name} ওষুধটি এখন খেয়ে নিন। সুস্থ থাকুন।`);
              }, 1500);
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
            setTimeout(() => {
              speakBengali(`আপনার একটি কাজের সময় হয়েছে। ${task.text} কাজটি এখন শুরু করুন।`);
            }, 1500);
          }
        }
      }

      // Sleep time alert
      if (settings.sleep && extraSettings.sleepTime) {
        if (currentTime === extraSettings.sleepTime && !data.sleepStart && !alertedRef.current.has(`sleep-${extraSettings.sleepTime}`)) {
          alertedRef.current.add(`sleep-${extraSettings.sleepTime}`);
          playNotificationSound('reminder');
          setTimeout(() => {
            speakBengali(`ঘুমানোর সময় হয়ে গেছে। পর্যাপ্ত ঘুম আপনার শরীর ও মনের জন্য খুবই জরুরি। এখন বিশ্রাম নিন এবং ভালো ঘুম হোক।`);
          }, 1500);
        }
      }

      // Water reminder every hour
      if (settings.water && now.getMinutes() === 0 && data.water < 8) {
        const hourKey = `water-${now.getHours()}`;
        if (!alertedRef.current.has(hourKey)) {
          alertedRef.current.add(hourKey);
          playNotificationSound('reminder');
          const remaining = 8 - data.water;
          setTimeout(() => {
            speakBengali(`পানি পান করার সময়। আজ আপনি ${data.water} গ্লাস পানি খেয়েছেন। আরো ${remaining} গ্লাস বাকি আছে। সুস্থ থাকতে পর্যাপ্ত পানি পান করুন।`);
          }, 1500);
        }
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [data, namazTimes, extraSettings]);

  return null;
};

export default SoundAlertManager;
