import type { ReactNode } from "react";

interface Props {
  userName: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSettings?: () => void;
  onProfile?: () => void;
  notificationSlot?: ReactNode;
}

const NavBar = ({ userName, selectedDate, onDateChange, onSettings, onProfile, notificationSlot }: Props) => {
  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="font-bold text-lg">Life <span className="text-primary">OS</span></span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-muted-foreground">{selectedDate}</span>
          <input
            type="date"
            value={selectedDate}
            onChange={e => onDateChange(e.target.value)}
            className="w-8 h-8 opacity-0 absolute cursor-pointer"
          />
          <button onClick={() => onDateChange(selectedDate)} className="text-sm">📅</button>
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 rounded-full text-xs font-bold bg-primary text-primary-foreground">ড্যাশ</button>
          <button className="px-3 py-1.5 rounded-full text-xs font-bold bg-secondary text-muted-foreground">নম্বর</button>
          {onSettings && (
            <button onClick={onSettings} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm">⚙️</button>
          )}
          {notificationSlot}
          {onProfile && (
            <button onClick={onProfile} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-life-indigo-light text-life-indigo text-xs font-bold">
              🎓 {userName}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
