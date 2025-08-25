// app/knocks/page.tsx
import Link from 'next/link'

type AppItem = { day: number; slug: string; title: string; desc: string }

const APPS: AppItem[] = [
    { day: 1, slug: 'day1_sample', title: 'Knock List Sample', desc: 'Day1のサンプル（アーカイブ）' },
    { day: 2, slug: 'day2_markdown-pad', title: 'Markdown Live Preview', desc: 'Markdown入力→即時プレビュー（GFM対応）' },
    { day: 3, slug: 'day3_todo-lite', title: 'ToDo Lite', desc: '3状態（未/進/完）とローカル永続化' },
    { day: 4, slug: 'day4_pomodoro', title: 'Pomodoro Timer', desc: '開始/停止/リセット・カウントダウン' },
    { day: 5, slug: 'day5_calculator', title: 'Calculator', desc: '四則演算・履歴・括弧（安全評価）' },
    { day: 6, slug: 'day6_unit-converter', title: 'Unit Converter', desc: '単位変換' },
]

export default function KnocksCatalogPage() {
    const sorted = [...APPS].sort((a, b) => a.day - b.day)
    return (
        <main className="mx-auto max-w-6xl p-6">
            <header className="mb-6 flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">100本ノック — 一覧</h1>
                    <p className="text-sm text-neutral-500">全アプリ（履歴含む）を一覧表示します。</p>
                </div>
                <Link href="/" className="text-sm underline underline-offset-4 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300">Home</Link>
            </header>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sorted.map((it) => (
                    <li key={it.slug}>
                        <a
                            href={`/knocks/${it.slug}`}
                            className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-sm transition-shadow"
                        >
                            <h3 className="text-base font-semibold">{it.title}</h3>
                            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{it.desc}</p>
                        </a>
                    </li>
                ))}
            </ul>
        </main>
    )
}