const ProgressCard = ({ progress }: { progress: number }) => (
  <div className="bg-card rounded-2xl p-5 border border-border border-l-4 border-l-life-emerald shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-bold text-muted-foreground uppercase">সামগ্রিক অগ্রগতি</h3>
      <span className="text-sm font-bold text-primary">{progress}%</span>
    </div>
    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-primary to-life-emerald rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
    </div>
  </div>
);

export default ProgressCard;
