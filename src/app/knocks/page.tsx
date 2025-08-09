// app/knocks/page.tsx
import Link from 'next/link'

type AppItem = { day: number; slug: string; title: string; desc: string }

const APPS: AppItem[] = [
    { day: 1, slug: 'day1_sample', title: 'Knock List Sample', desc: 'Day1のサンプル（アーカイブ）' },
    { day: 2, slug: 'day2_markdown-pad', title: 'Markdown Live Preview', desc: 'Markdown入力→即時プレビュー（GFM対応）' },
    // 以降 Day3, Day4... を追記
]

export default function KnocksCatalogPage() {
    const sorted = [...APPS].sort((a, b) => a.day - b.day)
    return (
        <main className="mx-auto max-w-6xl p-6">
            <header className="mb-6 flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">100本ノック — カタログ</h1>
                    <p className="text-sm text-neutral-500">全アプリ（履歴含む）を一覧表示します。</p>
                </div>
                <Link href="/" className="text-sm underline underline-offset-4 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300">Home</Link>
            </header>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sorted.map((a) => (
                    <li key={a.slug} className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm hover:shadow-md transition-shadow">
                        <Link href={`/knocks/${a.slug}`} className="block p-4">
                            <div className="mb-2 inline-flex items-center gap-2 text-xs text-neutral-500">
                                <span className="rounded-full border px-2 py-0.5">Day {a.day}</span>
                                <span className="text-neutral-400">/knocks/{a.slug}</span>
                            </div>
                            <h2 className="text-base font-medium group-hover:underline underline-offset-4">{a.title}</h2>
                            <p className="mt-1 text-sm text-neutral-500">{a.desc}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    )
}