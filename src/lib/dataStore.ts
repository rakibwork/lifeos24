import { supabase } from "@/integrations/supabase/client";
import type { DayData, Goal, PermNote, ExtraSettings, NamazTimes, Habit, UserProfile, AccountPerson } from './types';
import { defaultSoundSettings, type SoundSettings } from './soundManager';

export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ========== ASYNC SUPABASE DATA LAYER ==========

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}

// Day data
export async function loadDayData(date: string): Promise<DayData | null> {
  const userId = await getUserId();
  if (!userId) return null;
  const { data } = await supabase
    .from('user_day_data')
    .select('data')
    .eq('user_id', userId)
    .eq('date', date)
    .single();
  return (data?.data as unknown as DayData) ?? null;
}

export async function saveDayData(date: string, dayData: DayData): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  await supabase
    .from('user_day_data')
    .upsert(
      { user_id: userId, date, data: dayData as any, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date' }
    );
}

// Generic app data helpers
async function loadAppData<T>(key: string, fallback: T): Promise<T> {
  const userId = await getUserId();
  if (!userId) return fallback;
  const { data } = await supabase
    .from('user_app_data')
    .select('data_value')
    .eq('user_id', userId)
    .eq('data_key', key)
    .single();
  return (data?.data_value as T) ?? fallback;
}

async function saveAppData(key: string, value: unknown): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  await supabase
    .from('user_app_data')
    .upsert(
      { user_id: userId, data_key: key, data_value: value as any, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,data_key' }
    );
}

// Goals
export async function getGoals(): Promise<Goal[]> { return loadAppData<Goal[]>('goals', []); }
export async function saveGoals(g: Goal[]): Promise<void> { return saveAppData('goals', g); }

// Perm notes
export async function getPermNotes(): Promise<PermNote[]> { return loadAppData<PermNote[]>('permNotes', []); }
export async function savePermNotes(n: PermNote[]): Promise<void> { return saveAppData('permNotes', n); }

// Accounts
export async function getAccounts(): Promise<Record<string, AccountPerson>> { return loadAppData('accounts', {}); }
export async function saveAccounts(a: Record<string, AccountPerson>): Promise<void> { return saveAppData('accounts', a); }

// Quick notes
export async function getQuickNotes(): Promise<string[]> { return loadAppData<string[]>('quickNotes', ['']); }
export async function saveQuickNotes(n: string[]): Promise<void> { return saveAppData('quickNotes', n); }

// Habit definitions
export async function getHabitDefinitions(): Promise<Habit[]> { return loadAppData<Habit[]>('habitDefs', []); }
export async function saveHabitDefinitions(h: Habit[]): Promise<void> { return saveAppData('habitDefs', h); }

// Namaz times
export async function getNamazTimes(): Promise<NamazTimes> {
  return loadAppData<NamazTimes>('namazTimes', { fajr: "05:30", dhuhr: "13:30", asr: "16:45", maghrib: "18:20", isha: "20:00" });
}
export async function saveNamazTimes(t: NamazTimes): Promise<void> { return saveAppData('namazTimes', t); }

// Extra settings
export async function getExtraSettings(): Promise<ExtraSettings> {
  return loadAppData<ExtraSettings>('extraSettings', { dailyLimit: 500, monthlyLimit: 15000, sleepTime: "22:00" });
}
export async function saveExtraSettings(s: ExtraSettings): Promise<void> { return saveAppData('extraSettings', s); }

// Sound settings
export async function getSoundSettings(): Promise<SoundSettings> {
  const saved = await loadAppData<Partial<SoundSettings>>('soundSettings', {});
  return { ...defaultSoundSettings, ...saved };
}
export async function saveSoundSettings(s: SoundSettings): Promise<void> { return saveAppData('soundSettings', s); }

// Monthly expenses
export async function getMonthlyExpenses(): Promise<number> {
  const userId = await getUserId();
  if (!userId) return 0;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const datePrefix = `${year}-${month}`;
  
  const { data } = await supabase
    .from('user_day_data')
    .select('data')
    .eq('user_id', userId)
    .like('date', `${datePrefix}%`);
  
  let total = 0;
  if (data) {
    for (const row of data) {
      const dayData = row.data as unknown as DayData;
      if (dayData?.expenses) {
        total += dayData.expenses.reduce((s, e) => s + e.amt, 0);
      }
    }
  }
  return total;
}

// Profile (still uses Supabase profiles table)
export async function getProfile(): Promise<UserProfile> {
  const userId = await getUserId();
  if (!userId) return { name: 'ব্যবহারকারী', email: '' };
  const { data } = await supabase.from('profiles').select('full_name').eq('user_id', userId).single();
  return { name: data?.full_name || 'ব্যবহারকারী', email: '' };
}

export async function saveProfile(p: UserProfile): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;
  await supabase.from('profiles').update({ full_name: p.name }).eq('user_id', userId);
}

// Realtime subscription helper
export function subscribeToUserData(
  userId: string,
  onDayDataChange: (date: string, data: DayData) => void,
  onAppDataChange: (key: string, value: any) => void
) {
  const channel = supabase
    .channel(`user-data-${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'user_day_data', filter: `user_id=eq.${userId}` },
      (payload) => {
        const row = payload.new as any;
        if (row?.date && row?.data) {
          onDayDataChange(row.date, row.data as DayData);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'user_app_data', filter: `user_id=eq.${userId}` },
      (payload) => {
        const row = payload.new as any;
        if (row?.data_key && row?.data_value !== undefined) {
          onAppDataChange(row.data_key, row.data_value);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
