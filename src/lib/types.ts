export interface Task {
  id: number;
  text: string;
  time: string;
  done: boolean;
}

export interface Expense {
  id: number;
  note: string;
  amt: number;
  category?: 'বাজার' | 'ফ্যামেলি' | 'ব্যাক্তিগত';
}

export interface Goal {
  id: number;
  title: string;
  target: string;
}

export interface Notebook {
  id: number;
  title: string;
  content: string;
}

export interface PermNote {
  id: number;
  title: string;
  desc: string;
}

export interface Transaction {
  type: 'pawa' | 'dena';
  amount: number;
  note: string;
}

export interface Habit {
  id: number;
  title: string;
  checked: boolean;
}

export interface Medicine {
  id: number;
  name: string;
  dose: string;
  times: string[];
  totalPills: number;
  remainingPills: number;
  totalDays: number;
  remainingDays: number;
  startDate: string;
}

export interface MedicineDose {
  medId: number;
  time: string;
  taken: boolean;
}

export interface DayData {
  mood: string;
  water: number;
  tasks: Task[];
  expenses: Expense[];
  habits: Habit[];
  notebooks: Notebook[];
  activeNoteId: number;
  namaz: Record<string, boolean>;
  sleepStart: string;
  sleepEnd: string;
  sleepHours: number;
  medicineDoses?: MedicineDose[];
}

export interface ExtraSettings {
  dailyLimit: number;
  monthlyLimit: number;
  sleepTime: string;
  medicines?: Medicine[];
}

export interface NamazTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export interface AccountPerson {
  trans: Transaction[];
}
