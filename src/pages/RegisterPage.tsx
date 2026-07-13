import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RegisterPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !mobile) {
      toast.error("সব তথ্য পূরণ করুন");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          mobile,
          birthdate,
        },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }

    // Update profile with extra fields
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({
        full_name: fullName,
        mobile,
        birthdate: birthdate || null,
      }).eq("user_id", user.id);
    }

    toast.success("অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল ভেরিফাই করুন।");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="bg-card rounded-3xl shadow-xl p-8 w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-lg">⚡</div>
          <h1 className="text-2xl font-black text-primary">Life OS</h1>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-6">নতুন অ্যাকাউন্ট তৈরি করুন</p>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground">আপনার নাম *</label>
            <input
              type="text"
              placeholder="পূর্ণ নাম"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">আপনার ইমেইল *</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">পাসওয়ার্ড *</label>
            <input
              type="password"
              placeholder="পাসওয়ার্ড"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">মোবাইল নাম্বার *</label>
            <input
              type="tel"
              placeholder="01XXXXXXXXX"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">জন্ম তারিখ</label>
            <input
              type="date"
              value={birthdate}
              onChange={e => setBirthdate(e.target.value)}
              className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button onClick={() => navigate("/login")} className="text-sm text-primary font-bold hover:underline">
            ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
