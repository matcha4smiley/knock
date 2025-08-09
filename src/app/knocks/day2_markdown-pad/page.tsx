'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

const KEY = 'day2-md';

const SAMPLE = `# Markdown Live Preview

- **Bold**, *Italic*, ~~Strike~~
- [Link](https://example.com)
- Task list
  - [x] Write
  - [ ] Preview

\`\`\`ts
export const x = 1;
\`\`\`
`;

export default function Page() {
    const [md, setMd] = useState<string>('# Hello');
    const [mounted, setMounted] = useState(false);

    // 初回マウント後にだけ localStorage を反映（あれば上書き）
    useEffect(() => {
        setMounted(true);
        try {
            const saved = localStorage.getItem(KEY);
            if (saved !== null && saved !== md) setMd(saved);
        } catch { }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 変更のたびに保存
    useEffect(() => {
        try { localStorage.setItem(KEY, md); } catch { }
    }, [md]);
    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            <h1 className="text-2xl font-semibold">Day2: Markdown Live Preview</h1>

            {/* ツールバー */}
            <section className="mt-4 mb-2 flex flex-wrap gap-2">
                <button
                    type="button"
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    onClick={() => setMd(SAMPLE)}
                >
                    サンプル
                </button>
                <button
                    type="button"
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    onClick={() => setMd('')}
                >
                    クリア
                </button>
                <button
                    type="button"
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    onClick={() => {
                        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = 'note.md'; a.click();
                        URL.revokeObjectURL(url);
                    }}
                >
                    保存（md形式）
                </button>
            </section>

            {/* 2ペイン */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Editor */}
                <div className="flex flex-col">
                    <label className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Editor
                    </label>
                    <textarea
                        value={md}
                        onChange={(e) => setMd(e.currentTarget.value)}
                        className="w-full h-72 lg:h-[70vh] resize-none rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 font-mono text-sm leading-6 outline-none ring-0 focus:ring-2 focus:ring-zinc-400/50"
                        placeholder="# Start typing..."
                    />
                </div>

                {/* Preview */}
                <div className="flex flex-col">
                    <label className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Preview
                    </label>
                    {mounted ? (
                        <article className="prose max-w-none dark:prose-invert rounded-lg border p-4 bg-white/60 dark:bg-zinc-950/60 h-72 lg:h-[70vh] overflow-auto">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                {md}
                            </ReactMarkdown>
                        </article>
                    ) : (
                        <article className="rounded-lg border p-4 h-72 lg:h-[70vh] overflow-auto">
                            <h1>Hello</h1>
                        </article>
                    )}
                </div>
            </div>
        </main>
    );
}
