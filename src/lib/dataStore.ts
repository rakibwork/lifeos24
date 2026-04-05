import type { DayData, Goal, PermNote, ExtraSettings, NamazTimes, Habit, UserProfile, AccountPerson } from './types';

const KEY_PREFIX = 'lifeos_';

function getKey(key: string) { return KEY_PREFIX + key; }

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(getKey(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveJSON(key: string, data: unknown) {
  localStorage.setItem(getKey(key), JSON.stringify(data));
}

export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Day data
export function loadDayData(date: string): DayData | null {
  return loadJSON<DayData | null>(`day_${date}`, null);
}

export function saveDayData(date: string, data: DayData) {
  saveJSON(`day_${date}`, data);
}

// Profile
export function getProfile(): UserProfile {
  return loadJSON<UserProfile>('profile', { name: 'ব্যবহারকারী', email: '' });
}

export function saveProfile(p: UserProfile) { saveJSON('profile', p); }

// Goals
export function getGoals(): Goal[] { return loadJSON<Goal[]>('goals', []); }
export function saveGoals(g: Goal[]) { saveJSON('goals', g); }

// Perm notes
export function getPermNotes(): PermNote[] { return loadJSON<PermNote[]>('permNotes', []); }
export function savePermNotes(n: PermNote[]) { saveJSON('permNotes', n); }

// Accounts
export function getAccounts(): Record<string, AccountPerson> { return loadJSON('accounts', {}); }
export function saveAccounts(a: Record<string, AccountPerson>) { saveJSON('accounts', a); }

// Quick notes
export function getQuickNotes(): string[] { return loadJSON<string[]>('quickNotes', ['']); }
export function saveQuickNotes(n: string[]) { saveJSON('quickNotes', n); }

// Habit definitions
export function getHabitDefinitions(): Habit[] { return loadJSON<Habit[]>('habitDefs', []); }
export function saveHabitDefinitions(h: Habit[]) { saveJSON('habitDefs', h); }

// Namaz times
export function getNamazTimes(): NamazTimes {
  return loadJSON<NamazTimes>('namazTimes', { fajr: "05:30", dhuhr: "13:30", asr: "16:45", maghrib: "18:20", isha: "20:00" });
}
export function saveNamazTimes(t: NamazTimes) { saveJSON('namazTimes', t); }

// Extra settings
export function getExtraSettings(): ExtraSettings {
  return loadJSON<ExtraSettings>('extraSettings', { dailyLimit: 500, monthlyLimit: 15000, sleepTime: "22:00" });
}
export function saveExtraSettings(s: ExtraSettings) { saveJSON('extraSettings', s); }

// Monthly expenses
export function getMonthlyExpenses(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  let total = 0;
  for (let d = 1; d <= 31; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayData = loadDayData(dateStr);
    if (dayData?.expenses) {
      total += dayData.expenses.reduce((s, e) => s + e.amt, 0);
    }
  }
  return total;
}
