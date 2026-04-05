const prayers = [
  { key: 'fajr', name: 'ফজর', icon: '🌅' },
  { key: 'dhuhr', name: 'যোহর', icon: '☀️' },
  { key: 'asr', name: 'আসর', icon: '🌤️' },
  { key: 'maghrib', name: 'মাগরিব', icon: '🌇' },
  { key: 'isha', name: 'এশা', icon: '🌙' },
];

interface Props {
  namaz: Record<string, boolean>;
  onNamazChange: (namaz: Record<string, boolean>) => void;
}

const NamazTracker = ({ namaz, onNamazChange }: Props) => {
  const toggle = (key: string) => {
    onNamazChange({ ...namaz, [key]: !namaz[key] });
  };

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-life-orange shadow-sm">
      <h3 className="text-sm font-bold mb-3 text-life-orange">🕌 নামাজ ট্র্যাকার</h3>
      <div className="space-y-2">
        {prayers.map(p => (
          <button key={p.key} onClick={() => toggle(p.key)} className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-300 border-2 ${namaz[p.key] ? 'bg-life-emerald border-life-emerald text-primary-foreground shadow-md' : 'bg-card border-border hover:border-life-emerald/50'}`}>
            <div className="flex items-center gap-2">
              <span>{p.icon}</span>
              <span className="font-bold text-sm">{p.name}</span>
            </div>
            {namaz[p.key] && <span className="text-sm">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NamazTracker;
