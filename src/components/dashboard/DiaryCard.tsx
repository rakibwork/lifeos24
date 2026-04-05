import { useState } from "react";
import type { Notebook } from "@/lib/types";

interface Props {
  notebooks: Notebook[];
  activeNoteId: number;
  onUpdate: (notebooks: Notebook[], activeNoteId: number) => void;
}

const DiaryCard = ({ notebooks, activeNoteId, onUpdate }: Props) => {
  const current = notebooks.find(n => n.id === activeNoteId);
  const [newNoteName, setNewNoteName] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const addNote = () => {
    if (!newNoteName.trim()) return;
    const newNote = { id: Date.now(), title: newNoteName.trim(), content: '' };
    onUpdate([...notebooks, newNote], newNote.id);
    setNewNoteName("");
    setShowAdd(false);
  };

  const handleContentChange = (content: string) => {
    onUpdate(notebooks.map(n => n.id === activeNoteId ? { ...n, content } : n), activeNoteId);
  };

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-life-purple shadow-sm">
      <h3 className="text-sm font-bold mb-3 text-life-purple">✍️ প্রতিদিনের ডায়েরি</h3>
      <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar">
        {notebooks.map(n => (
          <button key={n.id} onClick={() => onUpdate(notebooks, n.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border transition whitespace-nowrap ${n.id === activeNoteId ? 'bg-life-purple text-primary-foreground border-life-purple' : 'bg-secondary text-muted-foreground border-border hover:border-life-purple/30'}`}>
            {n.title}
            {notebooks.length > 1 && (
              <span onClick={(e) => { e.stopPropagation(); onUpdate(notebooks.filter(x => x.id !== n.id), notebooks[0].id); }} className="text-xs opacity-60 hover:opacity-100">✕</span>
            )}
          </button>
        ))}
        <button onClick={() => setShowAdd(!showAdd)} className="bg-life-purple text-primary-foreground w-8 h-8 rounded-lg shadow-lg transition hover:opacity-90 shrink-0 text-sm">+</button>
      </div>
      {showAdd && (
        <div className="flex gap-2 mb-3">
          <input value={newNoteName} onChange={e => setNewNoteName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()} placeholder="নোটের নাম..." className="flex-1 p-2 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground" />
          <button onClick={addNote} className="bg-life-purple text-primary-foreground px-3 py-1 rounded-xl text-sm font-bold">তৈরি</button>
        </div>
      )}
      <textarea value={current?.content || ''} onChange={e => handleContentChange(e.target.value)} placeholder="আজকের ডায়েরি..." className="w-full p-3 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground min-h-[120px] resize-y" />
    </div>
  );
};

export default DiaryCard;
