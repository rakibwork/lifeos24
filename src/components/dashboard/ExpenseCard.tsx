import { useState } from "react";
import type { Expense } from "@/lib/types";

interface Props {
  expenses: Expense[];
  onExpensesChange: (expenses: Expense[]) => void;
}

const categories = ['বাজার', 'ফ্যামেলি', 'ব্যাক্তিগত'] as const;

const ExpenseCard = ({ expenses, onExpensesChange }: Props) => {
  const [amt, setAmt] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<typeof categories[number]>('ব্যাক্তিগত');
  const total = expenses.reduce((s, e) => s + e.amt, 0);

  const addExpense = () => {
    if (!amt || !note) return;
    onExpensesChange([{ id: Date.now(), note, amt: parseInt(amt), category }, ...expenses]);
    setAmt(""); setNote("");
  };

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-life-orange shadow-sm">
      <h3 className="text-sm font-bold mb-3 text-life-orange">💸 আজকের ব্যয়</h3>
      <input value={amt} onChange={e => setAmt(e.target.value)} type="number" placeholder="টাকা" className="w-full p-3 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground mb-2" />
      <div className="flex gap-2 mb-2">
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${category === c ? 'bg-life-orange text-primary-foreground border-life-orange' : 'bg-secondary border-border text-foreground hover:border-life-orange/50'}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-3">
        <input value={note} onChange={e => setNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addExpense()} placeholder="খাত (কীসে খরচ?)" className="flex-1 p-3 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground" />
        <button onClick={addExpense} className="bg-life-orange text-primary-foreground w-10 h-10 rounded-xl font-bold text-lg hover:opacity-90 transition">➕</button>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
        {expenses.map(e => (
          <div key={e.id} className="flex items-center justify-between p-2 rounded-xl bg-life-orange-light border border-life-orange/20">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-life-orange/20 text-life-orange">{e.category || 'ব্যাক্তিগত'}</span>
              <span className="text-sm font-bold">{e.note}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-life-orange">৳{e.amt}</span>
              <button onClick={() => onExpensesChange(expenses.filter(x => x.id !== e.id))} className="text-destructive/40 hover:text-destructive transition text-xs">🗑️</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-3 pt-3 border-t border-border">
        <span className="text-sm font-bold">মোট</span>
        <span className="text-sm font-bold text-life-orange">৳{total}</span>
      </div>
    </div>
  );
};

export default ExpenseCard;
