export default function Page() {
    return (
        <main className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">Day1: Sample Page</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Tailwind v4 が効いているかの動作確認用ページです。
            </p>

            <section className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                    <h2 className="text-sm font-medium">カード例</h2>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        余白・角丸・境界線・ダークモードの確認用。
                    </p>
                    <a
                        href="/knocks"
                        className="mt-3 inline-block rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                        一覧へ戻る
                    </a>
                </div>
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 p-4">
                    <h2 className="text-sm font-medium">色テスト</h2>
                    <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                        このテキストが色付きならTailwind OK。
                    </p>
                </div>
            </section>
        </main>
    );
}
