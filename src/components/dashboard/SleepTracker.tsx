interface Props {
  sleepStart: string;
  sleepEnd: string;
  sleepHours: number;
  onUpdate: (start: string, end: string, hours: number) => void;
}

const SleepTracker = ({ sleepStart, sleepEnd, sleepHours, onUpdate }: Props) => {
  const calc = (start: string, end: string) => {
    if (!start || !end) return 0;
    const d1 = new Date(`2000-01-01T${start}`);
    const d2 = new Date(`2000-01-01T${end}`);
    if (d2 < d1) d2.setDate(d2.getDate() + 1);
    return parseFloat(((d2.getTime() - d1.getTime()) / 3600000).toFixed(1));
  };

  const handleChange = (field: 'start' | 'end', value: string) => {
    const s = field === 'start' ? value : sleepStart;
    const e = field === 'end' ? value : sleepEnd;
    onUpdate(s, e, calc(s, e));
  };

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-t-4 border-life-yellow shadow-sm">
      <h3 className="text-sm font-black mb-3 text-life-yellow flex items-center gap-1">🛌 ঘুমের ট্র্যাকার</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] font-bold text-muted-foreground">ঘুমানোর সময়</label>
          <input
            type="time"
            value={sleepStart}
            onChange={e => handleChange('start', e.target.value)}
            placeholder="২২:০০"
            className="w-full p-2 mt-1 rounded-xl bg-secondary border border-border outline-none font-bold text-sm text-foreground focus:border-life-indigo transition"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-muted-foreground">ওঠার সময়</label>
          <input
            type="time"
            value={sleepEnd}
            onChange={e => handleChange('end', e.target.value)}
            placeholder="০৬:০০"
            className="w-full p-2 mt-1 rounded-xl bg-secondary border border-border outline-none font-bold text-sm text-foreground focus:border-life-indigo transition"
          />
        </div>
      </div>
      <div className="bg-life-yellow/10 rounded-xl p-2.5 flex items-center justify-between border border-life-yellow/20">
        <span className="text-sm font-bold text-foreground">মোট ঘুম:</span>
        <span className="text-sm font-black text-life-yellow">{sleepHours > 0 ? sleepHours : '০'} ঘণ্টা</span>
      </div>
    </div>
  );
};

export default SleepTracker;
