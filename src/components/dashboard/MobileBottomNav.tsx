import { useState, useEffect } from "react";

const sections = [
  { id: "home", icon: "🏠", label: "হোম" },
  { id: "tasks", icon: "📋", label: "টাস্ক" },
  { id: "health", icon: "💚", label: "স্বাস্থ্য" },
  { id: "notes", icon: "📝", label: "নোট" },
  { id: "more", icon: "⚡", label: "আরো" },
];

interface Props {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const MobileBottomNav = ({ activeSection, onSectionChange }: Props) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {sections.map(s => {
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSectionChange(s.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                active 
                  ? "text-primary scale-110" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className={`text-xl transition-transform ${active ? "scale-110" : ""}`}>{s.icon}</span>
              <span className={`text-[10px] font-bold ${active ? "text-primary" : ""}`}>{s.label}</span>
              {active && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
export { sections };