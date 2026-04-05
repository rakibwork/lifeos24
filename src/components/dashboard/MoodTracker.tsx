const moods = [
  { key: 'sad', emoji: '😢' },
  { key: 'neutral', emoji: '😐' },
  { key: 'happy', emoji: '😊' },
  { key: 'amazing', emoji: '🔥' },
];

const MoodTracker = ({ mood, onMoodChange }: { mood: string; onMoodChange: (m: string) => void }) => (
  <div className="bg-card rounded-2xl p-4 border-2 border-life-yellow shadow-sm">
    <h3 className="text-sm font-bold mb-3">আজকের অনুভূতি</h3>
    <div className="flex gap-3">
      {moods.map(m => (
        <button key={m.key} onClick={() => onMoodChange(m.key)} className={`text-2xl transition-all ${mood === m.key ? 'scale-125 grayscale-0' : 'grayscale opacity-50 hover:opacity-70'}`}>
          {m.emoji}
        </button>
      ))}
    </div>
  </div>
);

export default MoodTracker;
