import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldAlert, Lock, Ban } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [blockInfo, setBlockInfo] = useState<{ type: string; reason?: string; lockUntil?: string } | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("ইমেইল ও পাসওয়ার্ড দিন"); return; }
    setLoading(true);
    setBlockInfo(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setLoading(false); toast.error("ভুল ইমেইল বা পাসওয়ার্ড!"); return; }

    const userId = data?.user?.id;
    if (userId) {
      const { data: profile } = await supabase.from('profiles').select('status, lock_until, suspend_reason').eq('user_id', userId).single();
      if (profile) {
        const status = (profile as any).status;
        const lockUntil = (profile as any).lock_until;
        const reason = (profile as any).suspend_reason;

        if (status === 'blocked') {
          await supabase.auth.signOut();
          setLoading(false);
          setBlockInfo({ type: 'blocked', reason: reason || undefined });
          return;
        }
        if (status === 'suspended') {
          await supabase.auth.signOut();
          setLoading(false);
          setBlockInfo({ type: 'suspended', reason: reason || undefined });
          return;
        }
        if (status === 'locked' && lockUntil) {
          const lockDate = new Date(lockUntil);
          if (lockDate > new Date()) {
            // Allow login but will be restricted in dashboard
            setLoading(false);
            toast.success("সফলভাবে লগইন হয়েছে!");
            navigate("/dashboard");
            return;
          }
        }
      }
    }

    setLoading(false);
    toast.success("সফলভাবে লগইন হয়েছে!");
    navigate("/dashboard");
  };

  const formatDate = (d: string) => {
    try {
      const date = new Date(d);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch { return d; }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="bg-card p-8 rounded-3xl shadow-xl w-full max-w-sm border border-border animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg text-xl">⚡</div>
          <h2 className="text-3xl font-black text-primary">Life OS</h2>
        </div>
        <p className="text-center text-muted-foreground text-sm mb-6">আপনার জীবন পরিচালনার সহচর</p>

        {/* Block/Suspend Info */}
        {blockInfo && (
          <div className={`mb-6 p-5 rounded-2xl border-2 text-center space-y-3 animate-fade-in-up ${
            blockInfo.type === 'blocked' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'
          }`}>
            <div className="flex justify-center">
              {blockInfo.type === 'blocked' ? (
                <Ban className="w-12 h-12 text-red-500" />
              ) : (
                <ShieldAlert className="w-12 h-12 text-amber-500" />
              )}
            </div>
            <h3 className={`text-lg font-black ${blockInfo.type === 'blocked' ? 'text-red-600' : 'text-amber-600'}`}>
              {blockInfo.type === 'blocked' ? '🚫 অ্যাকাউন্ট ব্লক করা হয়েছে' : '⚠️ অ্যাকাউন্ট সাসপেন্ড করা হয়েছে'}
            </h3>
            {blockInfo.reason && (
              <div className="bg-card/80 rounded-xl p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">কারণ:</p>
                <p className="text-sm font-bold text-foreground">{blockInfo.reason}</p>
              </div>
            )}
            {blockInfo.type === 'suspended' && (
              <p className="text-sm font-bold text-amber-700">আপনার অ্যাকাউন্ট আর ফিরে পাওয়া যাবে না।</p>
            )}
            {blockInfo.type === 'blocked' && (
              <p className="text-xs text-muted-foreground">সমস্যা থাকলে অ্যাডমিনের সাথে যোগাযোগ করুন।</p>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="আপনার ইমেইল" required className="w-full p-4 bg-secondary rounded-2xl outline-none border border-border focus:border-primary transition text-foreground" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="পাসওয়ার্ড" required className="w-full p-4 bg-secondary rounded-2xl outline-none border border-border focus:border-primary transition text-foreground" />
          <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 transition active:scale-95 disabled:opacity-50">
            {loading ? "লোড হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-sm font-bold text-primary hover:underline transition">পাসওয়ার্ড ভুলে গেছেন?</Link>
        </div>
        <div className="mt-3 text-center">
          <Link to="/register" className="text-sm font-bold text-muted-foreground hover:text-primary transition">নতুন অ্যাকাউন্ট তৈরি করুন</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
