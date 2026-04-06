import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      // Supabase handles session automatically
    }
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("পাসওয়ার্ড আপডেট হয়েছে!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="bg-card rounded-3xl shadow-xl p-8 w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-lg">⚡</div>
          <h1 className="text-2xl font-black text-primary">Life OS</h1>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-6">নতুন পাসওয়ার্ড সেট করুন</p>

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="password"
            placeholder="নতুন পাসওয়ার্ড"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "আপডেট হচ্ছে..." : "পাসওয়ার্ড আপডেট করুন"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
