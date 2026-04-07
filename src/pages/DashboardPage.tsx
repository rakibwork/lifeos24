import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getTodayStr, loadDayData, saveDayData, getGoals, saveGoals, getPermNotes, savePermNotes, getAccounts, saveAccounts, getQuickNotes, saveQuickNotes, getHabitDefinitions, saveHabitDefinitions, getNamazTimes, getExtraSettings, saveExtraSettings, getMonthlyExpenses } from "@/lib/dataStore";
import type { DayData, Goal, PermNote, ExtraSettings, NamazTimes, Habit, UserProfile, AccountPerson, Medicine } from "@/lib/types";
import { isAdmin } from "@/lib/adminStore";
import NavBar from "@/components/dashboard/NavBar";
import NotificationBell from "@/components/dashboard/NotificationBell";
import AdminNotifBanner from "@/components/dashboard/AdminNotifBanner";
import SummaryCards from "@/components/dashboard/SummaryCards";
import MoodTracker from "@/components/dashboard/MoodTracker";
import WaterTracker from "@/components/dashboard/WaterTracker";
import ProgressCard from "@/components/dashboard/ProgressCard";
import TaskCard from "@/components/dashboard/TaskCard";
import GoalCard from "@/components/dashboard/GoalCard";
import ExpenseCard from "@/components/dashboard/ExpenseCard";
import NamazTracker from "@/components/dashboard/NamazTracker";
import HabitCard from "@/components/dashboard/HabitCard";
import DiaryCard from "@/components/dashboard/DiaryCard";
import QuickNoteCard from "@/components/dashboard/QuickNoteCard";
import SleepTracker from "@/components/dashboard/SleepTracker";
import PermNoteCard from "@/components/dashboard/PermNoteCard";
import AccountCard from "@/components/dashboard/AccountCard";
import AIAssistant from "@/components/dashboard/AIAssistant";
import MedicineCard from "@/components/dashboard/MedicineCard";
import DailySummary from "@/components/dashboard/DailySummary";
import WeeklyAnalytics from "@/components/dashboard/WeeklyAnalytics";
import SettingsModal from "@/components/dashboard/SettingsModal";
import ProfileModal from "@/components/dashboard/ProfileModal";
import NewDayDialog from "@/components/dashboard/NewDayDialog";
import NoDataDialog from "@/components/dashboard/NoDataDialog";
import SoundAlertManager from "@/components/dashboard/SoundAlertManager";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";

const defaultDayData: DayData = {
  mood: '', water: 0, tasks: [], expenses: [],
  habits: [], notebooks: [{ id: 1, title: 'নোট ১', content: '' }],
  activeNoteId: 1, namaz: {},
  sleepStart: '', sleepEnd: '', sleepHours: 0,
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [userName, setUserName] = useState("ব্যবহারকারী");
  const [data, setData] = useState<DayData>(defaultDayData);
  const [goals, setGoalsState] = useState<Goal[]>([]);
  const [permNotes, setPermNotesState] = useState<PermNote[]>([]);
  const [accounts, setAccountsState] = useState<Record<string, AccountPerson>>({});
  const [quickNotes, setQuickNotesState] = useState<string[]>(['']);
  const [habitDefs, setHabitDefs] = useState<Habit[]>([]);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [namazTimes, setNamazTimes] = useState<NamazTimes>({ fajr: "05:30", dhuhr: "13:30", asr: "16:45", maghrib: "18:20", isha: "20:00" });
  const [extraSettings, setExtraSettings] = useState<ExtraSettings>({ dailyLimit: 500, monthlyLimit: 15000, sleepTime: "22:00" });
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [showNewDay, setShowNewDay] = useState(false);
  const [noDataDate, setNoDataDate] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState("home");

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).single();
        if (profile?.full_name) setUserName(profile.full_name);
      }
      const admin = await isAdmin();
      setUserIsAdmin(admin);
    };
    loadUser();
  }, [showProfile]);

  useEffect(() => {
    const lastShown = localStorage.getItem('lifeos_newday_shown');
    const today = getTodayStr();
    if (lastShown !== today) {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() < 5) {
        setShowNewDay(true);
        localStorage.setItem('lifeos_newday_shown', today);
      }
    }
    const interval = setInterval(() => {
      const now = new Date();
      const today = getTodayStr();
      const lastShownNow = localStorage.getItem('lifeos_newday_shown');
      if (lastShownNow !== today && now.getHours() === 0 && now.getMinutes() < 5) {
        setShowNewDay(true);
        localStorage.setItem('lifeos_newday_shown', today);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = loadDayData(selectedDate);
    if (saved) {
      setData(saved);
    } else {
      const today = getTodayStr();
      if (selectedDate !== today) setNoDataDate(selectedDate);
      const defs = getHabitDefinitions();
      const freshHabits = defs.map(h => ({ ...h, checked: false }));
      setData({ ...defaultDayData, habits: freshHabits });
    }
  }, [selectedDate]);

  useEffect(() => {
    setGoalsState(getGoals());
    setPermNotesState(getPermNotes());
    setAccountsState(getAccounts());
    setQuickNotesState(getQuickNotes());
    setHabitDefs(getHabitDefinitions());
    setNamazTimes(getNamazTimes());
    setExtraSettings(getExtraSettings());
    setMonthlyExpense(getMonthlyExpenses());
    setLoading(false);
  }, []);

  useEffect(() => {
    setMonthlyExpense(getMonthlyExpenses());
  }, [data.expenses]);

  const updateData = useCallback((partial: Partial<DayData>) => {
    setData(prev => {
      const next = { ...prev, ...partial };
      saveDayData(selectedDate, next);
      return next;
    });
  }, [selectedDate]);

  const updateGoals = useCallback((newGoals: Goal[]) => {
    setGoalsState(newGoals);
    saveGoals(newGoals);
  }, []);

  const updatePermNotes = useCallback((notes: PermNote[]) => {
    setPermNotesState(notes);
    savePermNotes(notes);
  }, []);

  const updateAccounts = useCallback((accs: Record<string, AccountPerson>) => {
    setAccountsState(accs);
    saveAccounts(accs);
  }, []);

  const updateQuickNotes = useCallback((notes: string[]) => {
    setQuickNotesState(notes);
    saveQuickNotes(notes);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const progress = (() => {
    const namazP = Object.values(data.namaz).filter(Boolean).length * 5;
    const waterP = Math.min(data.water * 2, 16);
    const total = data.tasks.length + data.habits.length;
    const done = data.tasks.filter(t => t.done).length + data.habits.filter(h => h.checked).length;
    const workP = total > 0 ? (done / total) * 59 : 0;
    return Math.min(100, Math.round(namazP + waterP + workP));
  })();

  // Mobile section visibility
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const showInMobile = (section: string) => !isMobile || mobileSection === section;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">⚡</div>
        <div className="font-bold text-muted-foreground">লোড হচ্ছে...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <NavBar
        userName={userName}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onSettings={() => setShowSettings(true)}
        onProfile={() => setShowProfile(true)}
        onLogout={handleLogout}
        isAdmin={userIsAdmin}
        onAdmin={() => navigate("/admin")}
        notificationSlot={
          <NotificationBell data={data} namazTimes={namazTimes} extraSettings={extraSettings} />
        }
      />

      <main className="max-w-6xl mx-auto p-2 md:p-8 space-y-3 md:space-y-6">
        {/* Home section - always visible on desktop, conditional on mobile */}
        {showInMobile("home") && (
          <>
            <AdminNotifBanner />
            <AIAssistant data={data} goals={goals} />
            <SummaryCards data={data} accounts={accounts} monthlyExpense={monthlyExpense} extraSettings={extraSettings} />
            <div className="hidden md:grid grid-cols-3 gap-4">
              <MoodTracker mood={data.mood} onMoodChange={m => updateData({ mood: m })} />
              <WaterTracker water={data.water} onWaterChange={w => updateData({ water: w })} />
              <ProgressCard progress={progress} />
            </div>
            <div className="md:hidden space-y-3">
              <MoodTracker mood={data.mood} onMoodChange={m => updateData({ mood: m })} />
              <WaterTracker water={data.water} onWaterChange={w => updateData({ water: w })} />
              <ProgressCard progress={progress} />
              <DailySummary data={data} goals={goals} namazTimes={namazTimes} extraSettings={extraSettings} />
            </div>
          </>
        )}

        {/* Desktop: full layout, Mobile: section-based */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 md:gap-6">
          <div className="md:col-span-8 space-y-4 md:space-y-6">
            <TaskCard tasks={data.tasks} onTasksChange={tasks => updateData({ tasks })} />
            <GoalCard goals={goals} onGoalsChange={updateGoals} />
            <AccountCard accounts={accounts} onAccountsChange={updateAccounts} />
            <PermNoteCard notes={permNotes} onNotesChange={updatePermNotes} />
            <DiaryCard notebooks={data.notebooks} activeNoteId={data.activeNoteId} onUpdate={(notebooks, activeNoteId) => updateData({ notebooks, activeNoteId })} />
            <DailySummary data={data} goals={goals} namazTimes={namazTimes} extraSettings={extraSettings} />
            <WeeklyAnalytics />
          </div>
          <div className="md:col-span-4 space-y-4 md:space-y-6">
            <NamazTracker namaz={data.namaz} onNamazChange={namaz => updateData({ namaz })} />
            <MedicineCard
              medicines={extraSettings.medicines || []}
              doses={data.medicineDoses || []}
              onMedicinesChange={(medicines: Medicine[]) => {
                const newSettings = { ...extraSettings, medicines };
                setExtraSettings(newSettings);
                saveExtraSettings(newSettings);
              }}
              onDosesChange={medicineDoses => updateData({ medicineDoses })}
            />
            <ExpenseCard expenses={data.expenses} onExpensesChange={expenses => updateData({ expenses })} />
            <HabitCard habits={data.habits} onHabitsChange={habits => updateData({ habits })} />
            <QuickNoteCard notes={quickNotes} onNotesChange={updateQuickNotes} />
            <SleepTracker sleepStart={data.sleepStart} sleepEnd={data.sleepEnd} sleepHours={data.sleepHours} onUpdate={(sleepStart, sleepEnd, sleepHours) => updateData({ sleepStart, sleepEnd, sleepHours })} />
          </div>
        </div>

        {/* Mobile sections */}
        <div className="md:hidden space-y-3">
          {showInMobile("tasks") && (
            <>
              <TaskCard tasks={data.tasks} onTasksChange={tasks => updateData({ tasks })} />
              <GoalCard goals={goals} onGoalsChange={updateGoals} />
              <AccountCard accounts={accounts} onAccountsChange={updateAccounts} />
              <ExpenseCard expenses={data.expenses} onExpensesChange={expenses => updateData({ expenses })} />
            </>
          )}

          {showInMobile("health") && (
            <>
              <NamazTracker namaz={data.namaz} onNamazChange={namaz => updateData({ namaz })} />
              <MedicineCard
                medicines={extraSettings.medicines || []}
                doses={data.medicineDoses || []}
                onMedicinesChange={(medicines: Medicine[]) => {
                  const newSettings = { ...extraSettings, medicines };
                  setExtraSettings(newSettings);
                  saveExtraSettings(newSettings);
                }}
                onDosesChange={medicineDoses => updateData({ medicineDoses })}
              />
              <HabitCard habits={data.habits} onHabitsChange={habits => updateData({ habits })} />
              <SleepTracker sleepStart={data.sleepStart} sleepEnd={data.sleepEnd} sleepHours={data.sleepHours} onUpdate={(sleepStart, sleepEnd, sleepHours) => updateData({ sleepStart, sleepEnd, sleepHours })} />
            </>
          )}

          {showInMobile("notes") && (
            <>
              <DiaryCard notebooks={data.notebooks} activeNoteId={data.activeNoteId} onUpdate={(notebooks, activeNoteId) => updateData({ notebooks, activeNoteId })} />
              <QuickNoteCard notes={quickNotes} onNotesChange={updateQuickNotes} />
              <PermNoteCard notes={permNotes} onNotesChange={updatePermNotes} />
            </>
          )}

          {showInMobile("more") && (
            <>
              <WeeklyAnalytics />
            </>
          )}
        </div>
      </main>

      <MobileBottomNav activeSection={mobileSection} onSectionChange={setMobileSection} />
      <SoundAlertManager data={data} namazTimes={namazTimes} extraSettings={extraSettings} />
      <NewDayDialog open={showNewDay} onClose={() => setShowNewDay(false)} userName={userName} />
      <NoDataDialog open={!!noDataDate} onOpenChange={(open) => !open && setNoDataDate(null)} date={noDataDate || getTodayStr()} />

      {showSettings && (
        <SettingsModal
          namazTimes={namazTimes}
          extraSettings={extraSettings}
          habitDefs={habitDefs}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default DashboardPage;