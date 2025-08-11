'use client';

import { useState, useMemo, useEffect } from "react";

type Status = 'todo'| 'doing' | 'done';
type Todo = { id: string; title:string; status: Status; createdAt: number};

export default function Page(){

    const [title, setTitle] = useState('');
    const [items, setItems] = useState<Todo[]>([]);
    const [filter, setFilter] = useState<Status | 'all'>('all');
    const STORAGE_KEY = 'todo-lite:v1'

    const add = () => {
        const name = title.trim();
        if(!name) return;
        setItems((prev) => [{ id: makeId(), title: name, status: 'todo', createdAt: Date.now()}, ...prev]);
        setTitle('');
    }

    const remove = (id: string) => setItems((prev) => prev.filter((x) => x.id !== id));

    const cycle = (id: string) => setItems((prev) =>
        prev.map((x) =>
            x.id === id
                ? { ...x, status: x.status === 'todo' ? 'doing' : x.status === 'doing' ? 'done' : 'todo'}
                : x
        )
    );
    
    const visible = useMemo(
        () => (filter === 'all' ? items : items.filter(x => x.status === filter)),
        [items, filter]
    );

    const makeId = () =>
        typeof globalThis.crypto !== 'undefined' &&
        typeof (globalThis.crypto as {randomUUID?: () => string}).randomUUID === 'function'
            ? (globalThis.crypto as { randomUUID: () => string }).randomUUID()
            : `${Date.now().toString(36)}-${ Math.random().toString(36).slice(2)}`;

    const counts = useMemo(() => {
        return {
            all: items.length,
            todo: items.filter(x => x.status === 'todo').length,
            doing: items.filter(x => x.status === 'doing').length,
            done: items.filter(x => x.status === 'done').length
        };
    }, [items]);
    
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if(!raw) return;
            const parsed = JSON.parse(raw) as unknown;
            if(Array.isArray(parsed)) {
                const safe = parsed
                    .filter((x) => x && typeof x === 'object')
                    .map((x: Todo) => ({
                        id: String(x.id ?? ''),
                        title: String(x.title ?? ''),
                        status: (x.status === 'todo' || x.status === 'doing' || x.status === 'done') ? x.status : 'todo',
                        createdAt: Number.isFinite(Number(x.createdAt)) ? Number(x.createdAt) : Date.now(),
                    }))
                    .filter((x) => x.id && x.title);
                setItems(safe);
            }
        } catch {}
    },[]);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {}
    }, [items])

    return (
        <main className="mx-auto max-w-2xl p-6 space-y-4">
            <header>
                <h1 className="text-2xl font-semibold">ToDo Lite</h1>
            </header>
            <div className="flex gap-2">
                {(['all', 'todo', 'doing', 'done'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={()=> setFilter(tab)}
                        className={`rounded-full border px-3 py-1 text-sm ${filter === tab ? 'bg-black text-white' : 'bg-white'}`}
                    >
                        {tab === 'all' ? 'すべて' : tab === 'todo' ? '未着手' : tab === 'doing' ? '進行中' : '完了'}
                        <span className="ml-2 rounded-full border px-2 text-xs">{counts[tab]}</span>
                    </button>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    className="flex-1 rounded-xl border px-3 py-2 outline-none focus:ring"
                    placeholder="やることを入力して Enter"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && add()}
                    autoFocus
                />
                <button
                    className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-40"
                    onClick={add}
                    disabled={!title.trim()}
                >
                    追加
                </button>
            </div>
            <ul className="space-y-2">
                {visible.length === 0 && (
                    <li className="rounded-xl border px-4 py-6 text-center text-sm text-gray-500">
                        まだタスクがありません
                    </li>
                )}
                {visible.map((t) => (
                    <li key={t.id}
                        className="flex items-center justify-between gap-3 rounded-xl border p-3"
                    >
                        <button
                            onClick={() => cycle(t.id)}
                            className={`shrink-0 rounded-full border px-3 py-1 text-xs ${t.status === 'todo'
                                ? 'bg-white'
                                : t.status === 'doing'
                                    ? 'bg-yellow-50 border-yellow-300'
                                    : 'bg-green-50 border-green-300'
                                }`}
                            title="クリックで状態を循環"
                        >
                            {t.status === 'todo' ? '未着手' : t.status === 'doing' ? '進行中' : '完了'}
                        </button>

                        <p title={t.title} className={`truncate ${t.status === 'done' ? 'text-gray-400 line-through' : ''}`}>
                            {t.title}
                        </p>

                        <button
                            className="rounded-lg border px-2 py-1 text-xs hover:bg-red-50"
                            onClick={() => remove(t.id)}
                        >
                            削除
                        </button>
                    </li>
                ))}
            </ul>
            {items.length > 0 && (
                <div className="flex justify-end">
                    <button
                        className="text-sm text-gray-500 underline"
                        onClick={() => {
                            if (confirm('全タスクを削除します。よろしいですか？')) setItems([]);
                        }}
                    >
                        すべて削除
                    </button>
                </div>
            )}
        </main>
    );
}