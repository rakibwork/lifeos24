import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { isAdmin, getAllUsers, getAdminStats, getActivityLogs, updateUserStatus, toggleVerified, sendAdminNotification, deleteUserAccount, type AdminUser, type ActivityLog } from "@/lib/adminStore";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, UserCheck, UserX, Lock, Unlock, Eye, Bell, Activity, Search, ArrowLeft, BadgeCheck, Ban, Clock, Send, Trash2, LogIn } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { toast } from "sonner";
import DeleteConfirmDialog from "@/components/dashboard/DeleteConfirmDialog";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  blocked: "bg-red-500/15 text-red-600 border-red-500/30",
  suspended: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  locked: "bg-purple-500/15 text-purple-600 border-purple-500/30",
};

const statusLabels: Record<string, string> = {
  active: "সক্রিয়",
  blocked: "ব্লক",
  suspended: "সাসপেন্ড",
  locked: "লক",
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"dashboard" | "users" | "logs">("dashboard");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0, suspended: 0, locked: 0, verified: 0, online: 0 });
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionModal, setActionModal] = useState<{ type: string; user: AdminUser } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string; desc: string; onConfirm: () => void } | null>(null);
  const [reason, setReason] = useState("");
  const [lockDays, setLockDays] = useState(7);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      const admin = await isAdmin();
      if (!admin) {
        toast.error("আপনার এডমিন অ্যাক্সেস নেই!");
        navigate("/dashboard");
        return;
      }
      setAuthorized(true);
      await refresh();
      setLoading(false);
    };
    check();
  }, [navigate]);

  const refresh = useCallback(async () => {
    const [u, s, l] = await Promise.all([getAllUsers(), getAdminStats(), getActivityLogs()]);
    setUsers(u);
    setStats(s);
    setLogs(l);
  }, []);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.mobile || "").includes(search) ||
    u.status === search
  );

  const showConfirm = (title: string, desc: string, onConfirm: () => void) => {
    setConfirmModal({ title, desc, onConfirm });
  };

  const handleAction = async () => {
    if (!actionModal) return;
    const { type, user } = actionModal;

    const doAction = async () => {
      setActionLoading(true);
      try {
        if (type === "block") {
          await updateUserStatus(user.user_id, "blocked", reason);
          toast.success(`${user.name} ব্লক করা হয়েছে`);
        } else if (type === "suspend") {
          await updateUserStatus(user.user_id, "suspended", reason);
          toast.success(`${user.name} সাসপেন্ড করা হয়েছে`);
        } else if (type === "lock") {
          await updateUserStatus(user.user_id, "locked", reason, lockDays);
          toast.success(`${user.name} ${lockDays} দিনের জন্য লক করা হয়েছে`);
        } else if (type === "activate") {
          await updateUserStatus(user.user_id, "active");
          toast.success(`${user.name} সক্রিয় করা হয়েছে`);
        } else if (type === "verify") {
          await toggleVerified(user.user_id, !user.is_verified);
          toast.success(user.is_verified ? "ভেরিফিকেশন সরানো হয়েছে" : "ভেরিফাই করা হয়েছে");
        } else if (type === "notify") {
          if (!notifTitle.trim() || !notifMessage.trim()) {
            toast.error("টাইটেল ও মেসেজ দিন");
            setActionLoading(false);
            return;
          }
          await sendAdminNotification(user.user_id, notifTitle, notifMessage, "info");
          toast.success("নোটিফিকেশন পাঠানো হয়েছে");
        } else if (type === "delete") {
          await deleteUserAccount(user.user_id);
          toast.success(`${user.name}-এর অ্যাকাউন্ট ডিলেট করা হয়েছে`);
        }
        await refresh();
      } catch (e: any) {
        toast.error(e.message || "কিছু ভুল হয়েছে!");
      }
      setActionLoading(false);
      setActionModal(null);
      setReason("");
      setNotifTitle("");
      setNotifMessage("");
    };

    if (["block", "suspend", "lock", "delete"].includes(type)) {
      const labels: Record<string, string> = {
        block: `${user.name}-কে ব্লক করতে চান?`,
        suspend: `${user.name}-কে সাসপেন্ড করতে চান?`,
        lock: `${user.name}-কে লক করতে চান?`,
        delete: `${user.name}-এর অ্যাকাউন্ট সম্পূর্ণ ডিলেট করতে চান?`,
      };
      showConfirm("⚠️ নিশ্চিত করুন", labels[type] || "এই কাজ করতে চান?", doAction);
    } else {
      doAction();
    }
  };

  const timeAgo = (d: string) => { try { return formatDistanceToNow(new Date(d), { addSuffix: true, locale: bn }); } catch { return ""; } };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Shield className="w-10 h-10 mx-auto text-primary animate-pulse mb-3" />
        <div className="font-bold text-muted-foreground">এডমিন প্যানেল লোড হচ্ছে...</div>
      </div>
    </div>
  );

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border p-3 md:p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary border border-border hover:border-primary transition">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-lg md:text-xl font-black text-foreground">এডমিন প্যানেল</h1>
            </div>
          </div>
          <button onClick={refresh} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition">
            রিফ্রেশ
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-3 md:p-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: "dashboard", icon: Activity, label: "ড্যাশবোর্ড" },
            { key: "users", icon: Users, label: "ইউজার" },
            { key: "logs", icon: Clock, label: "লগ" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition whitespace-nowrap ${tab === t.key ? "bg-primary text-primary-foreground shadow-lg" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {tab === "dashboard" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: "মোট ইউজার", value: stats.total, icon: Users, color: "text-blue-500" },
              { label: "সক্রিয়", value: stats.active, icon: UserCheck, color: "text-emerald-500" },
              { label: "ব্লক", value: stats.blocked, icon: Ban, color: "text-red-500" },
              { label: "সাসপেন্ড", value: stats.suspended, icon: UserX, color: "text-amber-500" },
              { label: "লক", value: stats.locked, icon: Lock, color: "text-purple-500" },
              { label: "ভেরিফাইড", value: stats.verified, icon: BadgeCheck, color: "text-blue-600" },
              { label: "অনলাইন", value: stats.online, icon: Activity, color: "text-green-500" },
            ].map(s => (
              <div key={s.label} className="bg-card rounded-2xl border border-border p-4 text-center">
                <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                <div className="text-2xl font-black text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground font-bold mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="নাম, মোবাইল বা স্ট্যাটাস দিয়ে খুঁজুন..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>

            <div className="space-y-2">
              {filteredUsers.map(u => (
                <div key={u.user_id} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-black shrink-0">
                        {u.name.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground truncate">{u.name || "নামহীন"}</span>
                          {u.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />}
                        </div>
                        <div className="text-xs text-muted-foreground">{u.mobile || "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full border font-bold ${statusColors[u.status] || statusColors.active}`}>
                        {statusLabels[u.status] || "সক্রিয়"}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                    {u.status !== 'active' && (
                      <button onClick={() => { setActionModal({ type: 'activate', user: u }); handleAction(); }} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 font-bold hover:bg-emerald-500/20 transition flex items-center gap-1">
                        <Unlock className="w-3 h-3" /> সক্রিয়
                      </button>
                    )}
                    {u.status === 'active' && (
                      <>
                        <button onClick={() => setActionModal({ type: 'block', user: u })} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 font-bold hover:bg-red-500/20 transition flex items-center gap-1">
                          <Ban className="w-3 h-3" /> ব্লক
                        </button>
                        <button onClick={() => setActionModal({ type: 'suspend', user: u })} className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 font-bold hover:bg-amber-500/20 transition flex items-center gap-1">
                          <UserX className="w-3 h-3" /> সাসপেন্ড
                        </button>
                        <button onClick={() => setActionModal({ type: 'lock', user: u })} className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-600 font-bold hover:bg-purple-500/20 transition flex items-center gap-1">
                          <Lock className="w-3 h-3" /> লক
                        </button>
                      </>
                    )}
                    <button onClick={() => { setActionModal({ type: 'verify', user: u }); }} className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 font-bold hover:bg-blue-500/20 transition flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" /> {u.is_verified ? "আনভেরিফাই" : "ভেরিফাই"}
                    </button>
                    <button onClick={() => setActionModal({ type: 'notify', user: u })} className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition flex items-center gap-1">
                      <Bell className="w-3 h-3" /> নোটিফাই
                    </button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">কোনো ইউজার পাওয়া যায়নি</div>
              )}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {tab === "logs" && (
          <div className="space-y-2">
            {logs.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">কোনো লগ নেই</div>}
            {logs.map(log => (
              <div key={log.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                <Activity className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{log.action}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(log.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Action Modal */}
      {actionModal && actionModal.type === 'notify' && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setActionModal(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black mb-4">📩 নোটিফিকেশন পাঠান</h3>
            <p className="text-sm text-muted-foreground mb-3">প্রাপক: <span className="font-bold text-foreground">{actionModal.user.name}</span></p>
            <input value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="টাইটেল" className="w-full p-3 rounded-xl bg-secondary border border-border text-sm mb-3 outline-none focus:ring-2 focus:ring-primary/50" />
            <textarea value={notifMessage} onChange={e => setNotifMessage(e.target.value)} placeholder="মেসেজ" rows={3} className="w-full p-3 rounded-xl bg-secondary border border-border text-sm mb-4 outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
            <div className="flex gap-2">
              <button onClick={() => setActionModal(null)} className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground font-bold text-sm">বাতিল</button>
              <button onClick={handleAction} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> পাঠান
              </button>
            </div>
          </div>
        </div>
      )}

      {actionModal && ['block', 'suspend', 'lock'].includes(actionModal.type) && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setActionModal(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black mb-4">⚠️ {actionModal.type === 'block' ? 'ব্লক' : actionModal.type === 'suspend' ? 'সাসপেন্ড' : 'লক'} করুন</h3>
            <p className="text-sm text-muted-foreground mb-3">ইউজার: <span className="font-bold text-foreground">{actionModal.user.name}</span></p>
            <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="কারণ লিখুন (ঐচ্ছিক)" rows={2} className="w-full p-3 rounded-xl bg-secondary border border-border text-sm mb-3 outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
            {actionModal.type === 'lock' && (
              <div className="mb-4">
                <label className="text-xs font-bold text-foreground">লক সময়কাল (দিন)</label>
                <input type="number" value={lockDays} onChange={e => setLockDays(Number(e.target.value))} min={1} className="w-full p-3 rounded-xl bg-secondary border border-border text-sm mt-1 outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setActionModal(null)} className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground font-bold text-sm">বাতিল</button>
              <button onClick={handleAction} disabled={actionLoading} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm disabled:opacity-50">
                নিশ্চিত
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <DeleteConfirmDialog
        open={!!confirmModal}
        onOpenChange={(open) => !open && setConfirmModal(null)}
        onConfirm={() => { confirmModal?.onConfirm(); setConfirmModal(null); }}
        title={confirmModal?.title || ""}
        description={confirmModal?.desc || ""}
      />
    </div>
  );
};

export default AdminPage;
