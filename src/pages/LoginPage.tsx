import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("ইমেইল ও পাসওয়ার্ড দিন"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="bg-card rounded-3xl shadow-xl p-8 w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-lg">⚡</div>
          <h1 className="text-2xl font-black text-primary">Life OS</h1>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-6">আপনার জীবন পরিচালনার সহচর</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="আপনার ইমেইল"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="password"
            placeholder="পাসওয়ার্ড"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "লোড হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>

        <div className="text-center mt-4 space-y-2">
          <button onClick={() => navigate("/forgot-password")} className="text-sm text-primary font-bold hover:underline">
            পাসওয়ার্ড ভুলে গেছেন?
          </button>
          <div>
            <button onClick={() => navigate("/register")} className="text-sm text-primary font-bold hover:underline">
              নতুন অ্যাকাউন্ট তৈরি করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
