import { useState } from "react";
import type { AccountPerson } from "@/lib/types";

interface Props {
  accounts: Record<string, AccountPerson>;
  onAccountsChange: (accounts: Record<string, AccountPerson>) => void;
}

const AccountCard = ({ accounts, onAccountsChange }: Props) => {
  const [personName, setPersonName] = useState("");
  const [activePerson, setActivePerson] = useState<string | null>(null);
  const [tAmt, setTAmt] = useState("");
  const [tNote, setTNote] = useState("");

  const addPerson = () => {
    if (!personName.trim()) return;
    onAccountsChange({ ...accounts, [personName]: { trans: [] } });
    setPersonName("");
  };

  const addTrans = (type: 'pawa' | 'dena') => {
    if (!tAmt || !activePerson) return;
    const next = { ...accounts };
    next[activePerson] = { trans: [...next[activePerson].trans, { type, amount: parseInt(tAmt), note: tNote || 'লেনদেন' }] };
    onAccountsChange(next);
    setTAmt(""); setTNote("");
  };

  const getBalance = (name: string) => {
    return accounts[name].trans.reduce((s, t) => s + (t.type === 'pawa' ? t.amount : -t.amount), 0);
  };

  return (
    <div className="bg-card rounded-2xl p-4 border-2 border-life-green shadow-sm">
      <h3 className="text-sm font-bold mb-3 text-life-green">💰 পাওনা ও দেনা</h3>
      <div className="flex gap-2 mb-3">
        <input value={personName} onChange={e => setPersonName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPerson()} placeholder="ব্যক্তির নাম..." className="flex-1 p-3 rounded-xl bg-secondary border border-border outline-none text-sm font-bold text-foreground" />
        <button onClick={addPerson} className="bg-life-green text-primary-foreground px-4 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition">যোগ</button>
      </div>

      {Object.keys(accounts).length > 0 && (
        <div className="space-y-2 mb-3">
          {Object.keys(accounts).map(name => {
            const bal = getBalance(name);
            return (
              <button key={name} onClick={() => setActivePerson(activePerson === name ? null : name)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${activePerson === name ? 'border-life-green bg-life-green-light' : 'border-border hover:border-life-green/30'}`}>
                <span className="font-bold text-sm">{name}</span>
                <span className={`font-bold text-sm ${bal >= 0 ? 'text-life-green' : 'text-destructive'}`}>৳{bal}</span>
              </button>
            );
          })}
        </div>
      )}

      {activePerson && (
        <div className="p-3 rounded-xl bg-life-green-light border border-life-green/20 space-y-2">
          <input value={tAmt} onChange={e => setTAmt(e.target.value)} type="number" placeholder="টাকা" className="w-full p-2 rounded-xl bg-card border border-border outline-none text-sm font-bold text-foreground" />
          <input value={tNote} onChange={e => setTNote(e.target.value)} placeholder="বিবরণ" className="w-full p-2 rounded-xl bg-card border border-border outline-none text-sm font-bold text-foreground" />
          <div className="flex gap-2">
            <button onClick={() => addTrans('pawa')} className="flex-1 bg-life-green text-primary-foreground py-2 rounded-xl font-bold text-sm">পাওনা +</button>
            <button onClick={() => addTrans('dena')} className="flex-1 bg-destructive text-primary-foreground py-2 rounded-xl font-bold text-sm">দেনা +</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountCard;
