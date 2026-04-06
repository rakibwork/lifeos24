import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("ইমেইল দিন"); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success("পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="bg-card rounded-3xl shadow-xl p-8 w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-lg">⚡</div>
          <h1 className="text-2xl font-black text-primary">Life OS</h1>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-6">পাসওয়ার্ড রিসেট করুন</p>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-foreground font-medium">আপনার ইমেইলে রিসেট লিংক পাঠানো হয়েছে। চেক করুন।</p>
            <button onClick={() => navigate("/login")} className="text-sm text-primary font-bold hover:underline">
              লগইনে ফিরে যান
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="email"
              placeholder="আপনার ইমেইল"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান"}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <button onClick={() => navigate("/login")} className="text-sm text-primary font-bold hover:underline">
            লগইনে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
