'use client';

import { useState } from "react";

type TodoV1 = { id: string; title:string};

export default function Page(){

    const [title, setTitle] = useState('');
    const [items, setItems] = useState<TodoV1[]>([]);

    const add = () => {
        const t = title.trim();
        if(!t) return;
        const id = 
        typeof crypto !== 'undefined' && 'radomUUID' in crypto
            ? crypto.radomUUID()
            : Math.random.toString(36).slice(2);
        setItems((prev) => [{ id, title: t }, ...prev]);
        setTitle('');
    }

    const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

    return (
        <main className="mx-auto max-w-2xl p-6 space-y-4">
            <header>
                <h1 className="text-2xl font-semibold">ToDo Lite</h1>
            </header>
            <div className="flex gap-2">
                <input
                    className="flex-1 rounded-xl border px-3 py-2 outline-none focus:ring"
                    placeholder="やることを入力して Enter"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && add()}
                />
                <button
                    className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-40"
                    onClick={add}
                    disabled={!title.trim}
                >
                    追加
                </button>
            </div>
            <ul className="space-y-2">
                {items.length === 0 && (
                    <li className="rounded-xl border px-4 py-6 text-center text-sm text-gray-500">
                        まだタスクがありません
                    </li>
                )}
            </ul>
            {items.map((t) => (
                <li key={t.id} 
                    className="flex items-center justify-between gap-3 rounded-xl border p-3"
                >
                    <p className="truncate">{t.title}</p>
                    <button 
                        className="rounded-lg border px-2 py-1 text-xs hover:bg-red-50"
                        onClick={() => remove(t.id)}
                    >
                        削除
                    </button>
                </li>
            ))}
        </main>
    );
}