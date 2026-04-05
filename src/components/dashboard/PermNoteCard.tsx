import { useState } from "react";
import type { PermNote } from "@/lib/types";

interface Props {
  notes: PermNote[];
  onNotesChange: (notes: PermNote[]) => void;
}

const PermNoteCard = ({ notes, onNotesChange }: Props) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [search, setSearch] = useState("");

  const addNote = () => {
    if (!title || !desc) return;
    onNotesChange([{ id: Date.now(), title, desc }, ...notes]);
    setTitle(""); setDesc("");
  };

  const filtered = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.desc.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-life-pink shadow-sm">
      <h3 className="text-sm font-bold mb-3 text-life-pink">♾️ স্থায়ী নোট</h3>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 নোট খুঁজুন..." className="w-full px-4 py-3 rounded-2xl bg-secondary border-none outline-none text-sm font-bold mb-3 text-foreground" />
      <div className="flex gap-2 mb-3">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="শিরোনাম..." className="flex-1 p-3 rounded-xl bg-card border border-border outline-none text-sm font-bold text-foreground" />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="বিবরণ..." className="flex-1 p-3 rounded-xl bg-card border border-border outline-none text-sm font-bold text-foreground resize-none h-12" />
      </div>
      <button onClick={addNote} className="bg-life-pink text-primary-foreground px-6 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition mb-3">সংরক্ষণ</button>
      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
        {filtered.map(n => (
          <div key={n.id} className="p-3 rounded-xl bg-life-pink-light border border-life-pink/20">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-sm">{n.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{n.desc}</div>
              </div>
              <button onClick={() => onNotesChange(notes.filter(x => x.id !== n.id))} className="text-destructive/40 hover:text-destructive text-xs">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermNoteCard;
