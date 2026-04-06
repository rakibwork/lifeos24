import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  onLogout?: () => void;
}

const BLOOD_GROUPS = ["নির্বাচন", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const ProfileModal = ({ onClose, onLogout }: Props) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState({
    full_name: "",
    mobile: "",
    mobile_private: true,
    blood_group: "",
    email_private: true,
    bio: "",
    profession: "",
    education: "",
    hobbies: "",
    birthdate: "",
    website: "",
    social_link: "",
    address: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserEmail(user.email || "");

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        mobile: data.mobile || "",
        mobile_private: data.mobile_private ?? true,
        blood_group: data.blood_group || "",
        email_private: data.email_private ?? true,
        bio: data.bio || "",
        profession: data.profession || "",
        education: data.education || "",
        hobbies: data.hobbies || "",
        birthdate: data.birthdate || "",
        website: data.website || "",
        social_link: data.social_link || "",
        address: data.address || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        mobile: profile.mobile,
        mobile_private: profile.mobile_private,
        blood_group: profile.blood_group,
        email_private: profile.email_private,
        bio: profile.bio,
        profession: profile.profession,
        education: profile.education,
        hobbies: profile.hobbies,
        birthdate: profile.birthdate || null,
        website: profile.website,
        social_link: profile.social_link,
        address: profile.address,
      })
      .eq("user_id", user.id);

    setSaving(false);
    if (error) { toast.error("সংরক্ষণ ব্যর্থ: " + error.message); return; }
    toast.success("প্রোফাইল আপডেট হয়েছে!");
    onClose();
  };

  const update = (key: string, value: string | boolean) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-card rounded-2xl p-8 text-center" onClick={e => e.stopPropagation()}>
          <p className="text-sm font-bold">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black">প্রোফাইল আপডেট</h2>
            <p className="text-sm text-muted-foreground">আপনার তথ্য পরিবর্তন করুন</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl">✕</button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-4xl text-primary font-black border-4 border-primary/20">
            {profile.full_name.charAt(0) || "?"}
          </div>
          <p className="text-sm text-primary mt-2">ছবি পরিবর্তন করতে ক্লিক করুন (সর্বোচ্চ 50KB)</p>
        </div>

        <div className="space-y-5">
          {/* পূর্ণ নাম */}
          <div>
            <label className="text-sm font-bold text-foreground">পূর্ণ নাম</label>
            <input value={profile.full_name} onChange={e => update("full_name", e.target.value)} className="w-full p-4 rounded-xl bg-secondary border border-border text-base font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          {/* মোবাইল */}
          <div>
            <label className="text-xs font-bold text-foreground">মোবাইল</label>
            <input value={profile.mobile} onChange={e => update("mobile", e.target.value)} className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/50" />
            <label className="flex items-center gap-2 mt-1">
              <div
                className={`w-10 h-5 rounded-full cursor-pointer transition-colors ${profile.mobile_private ? 'bg-muted' : 'bg-primary'}`}
                onClick={() => update("mobile_private", !profile.mobile_private)}
              >
                <div className={`w-5 h-5 bg-card rounded-full shadow transition-transform ${profile.mobile_private ? '' : 'translate-x-5'}`} />
              </div>
              <span className="text-xs text-muted-foreground">শুধু আমি দেখব</span>
            </label>
          </div>

          {/* রক্তের গ্রুপ */}
          <div>
            <label className="text-xs font-bold text-foreground">রক্তের গ্রুপ</label>
            <select value={profile.blood_group} onChange={e => update("blood_group", e.target.value)} className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/50">
              {BLOOD_GROUPS.map(g => <option key={g} value={g === "নির্বাচন" ? "" : g}>{g}</option>)}
            </select>
          </div>

          {/* ইমেইল */}
          <div>
            <label className="text-xs font-bold text-foreground">ইমেইল</label>
            <input value={userEmail} readOnly className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-muted-foreground outline-none cursor-not-allowed" />
            <label className="flex items-center gap-2 mt-1">
              <div
                className={`w-10 h-5 rounded-full cursor-pointer transition-colors ${profile.email_private ? 'bg-muted' : 'bg-primary'}`}
                onClick={() => update("email_private", !profile.email_private)}
              >
                <div className={`w-5 h-5 bg-card rounded-full shadow transition-transform ${profile.email_private ? '' : 'translate-x-5'}`} />
              </div>
              <span className="text-xs text-muted-foreground">শুধু আমি দেখব</span>
            </label>
          </div>

          {/* বিও / বায়ো */}
          <div>
            <label className="text-xs font-bold text-foreground">বিও / বায়ো</label>
            <input value={profile.bio} onChange={e => update("bio", e.target.value)} placeholder="নিজের সম্পর্কে কিছু লিখুন..." className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          {/* কর্মস্থল / পেশা */}
          <div>
            <label className="text-xs font-bold text-foreground">কর্মস্থল / পেশা</label>
            <input value={profile.profession} onChange={e => update("profession", e.target.value)} placeholder="যেমন: সফটওয়্যার ইঞ্জিনিয়ার" className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          {/* শিক্ষা প্রতিষ্ঠান */}
          <div>
            <label className="text-xs font-bold text-foreground">শিক্ষা প্রতিষ্ঠান</label>
            <input value={profile.education} onChange={e => update("education", e.target.value)} placeholder="স্কুল/কলেজ/বিশ্ববিদালয়" className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          {/* শখ */}
          <div>
            <label className="text-xs font-bold text-foreground">শখ</label>
            <input value={profile.hobbies} onChange={e => update("hobbies", e.target.value)} placeholder="কোডিং, বাগান করা" className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          {/* জন্ম তারিখ */}
          <div>
            <label className="text-xs font-bold text-foreground">জন্ম তারিখ</label>
            <input type="date" value={profile.birthdate} onChange={e => update("birthdate", e.target.value)} className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          {/* ওয়েবসাইট */}
          <div>
            <label className="text-xs font-bold text-foreground">ওয়েবসাইট</label>
            <input value={profile.website} onChange={e => update("website", e.target.value)} placeholder="https://example.com" className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          {/* সোশ্যাল লিংক */}
          <div>
            <label className="text-xs font-bold text-foreground">সোশ্যাল লিংক</label>
            <input value={profile.social_link} onChange={e => update("social_link", e.target.value)} placeholder="ফেসবুক/টুইটার লিংক" className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          {/* ঠিকানা */}
          <div>
            <label className="text-xs font-bold text-foreground">ঠিকানা</label>
            <textarea value={profile.address} onChange={e => update("address", e.target.value)} placeholder="ঢাকা" rows={3} className="w-full p-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সেভ করুন"}
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full mt-3 text-center text-sm font-bold text-destructive hover:underline"
          >
            লগআউট
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
