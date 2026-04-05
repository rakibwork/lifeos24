interface Props {
  notes: string[];
  onNotesChange: (notes: string[]) => void;
}

const QuickNoteCard = ({ notes, onNotesChange }: Props) => {
  const updateNote = (index: number, val: string) => {
    const updated = [...notes];
    updated[index] = val;
    onNotesChange(updated);
  };

  const deleteNote = (index: number) => {
    if (notes.length <= 1) return;
    onNotesChange(notes.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-life-yellow shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-life-yellow">📝 কুইক নোট</h3>
        <button onClick={() => onNotesChange([...notes, ""])} className="bg-life-yellow-light text-life-yellow w-6 h-6 rounded-full flex items-center justify-center text-xs hover:opacity-80 transition">+</button>
      </div>
      <div className="space-y-2">
        {notes.map((note, i) => (
          <div key={i} className="flex gap-2">
            <input value={note} onChange={e => updateNote(i, e.target.value)} placeholder="নোট লিখুন তালাশ করুন..." className="flex-1 p-2 rounded-xl bg-life-yellow-light border-none outline-none text-sm font-bold text-foreground" />
            {notes.length > 1 && (
              <button onClick={() => deleteNote(i)} className="text-destructive/40 hover:text-destructive transition text-xs">🗑️</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickNoteCard;
