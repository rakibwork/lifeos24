import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  userName: string;
}

const greetings = [
  "নতুন দিন, নতুন সম্ভাবনা! 🌟",
  "আজকের দিনটি অসাধারণ করে তুলুন! ✨",
  "নতুন সূর্যোদয়, নতুন আশা! 🌅",
  "আল্লাহ আপনাকে সুন্দর একটি দিন দিন! 🤲",
  "আজ আরও ভালো করার সুযোগ! 💪",
];

const NewDayDialog = ({ open, onClose, userName }: Props) => {
  const [greeting] = useState(() => greetings[Math.floor(Math.random() * greetings.length)]);
  const today = new Date();
  const dateStr = format(today, "EEEE, d MMMM yyyy", { locale: bn });

  // Auto-close after 5 seconds
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-3xl max-w-sm overflow-hidden p-0 border-0">
        {/* Decorative top */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent pt-10 pb-6 px-6">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
            {[...Array(12)].map((_, i) => (
              <span key={i} className="absolute text-xl animate-pulse" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}>✨</span>
            ))}
          </div>

          <div className="text-center relative z-10">
            <div className="text-5xl mb-3">🌙</div>
            <h2 className="text-xl font-black text-foreground">শুভ রাত্রি পেরিয়ে নতুন দিন!</h2>
            <p className="text-base text-muted-foreground mt-2">আসসালামু আলাইকুম, <span className="font-bold text-primary">{userName}</span>! 👋</p>
          </div>
        </div>

        <div className="px-6 pb-6 text-center space-y-4">
          <p className="text-lg font-bold text-primary">{greeting}</p>

          <div className="bg-secondary rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-1">📅 আজকের তারিখ</p>
            <p className="text-base font-black text-foreground">{dateStr}</p>
          </div>

          <p className="text-sm text-muted-foreground">সব ট্র্যাকার নতুন করে শুরু হয়েছে 🔄</p>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition"
          >
            চলুন শুরু করি! 🚀
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewDayDialog;
