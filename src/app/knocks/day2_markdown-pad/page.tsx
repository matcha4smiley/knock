'use client'

import { useState } from "react";
import ReactMarkdown from 'react-markdown';

export default function Page(){
    const [md,setMd] = useState<string>('# Hello')
    return (
        <main className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="text-2xl font-semibold">Day2: Markdown Live Preview</h1>
            <div className="mt-6">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Editor
                </label>
                <textarea
                    value={md}
                    onChange={(e)=> setMd(e.target.value)}
                    className="w-full h-64 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 font-mono text-sm leading-6 outline-none ring-0 focus:ring-2 focus:ring-zinc-400/50"
                    placeholder="# Start typinc..."
                />
            </div>
            <div className="mt-6">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Preview
                </label>
                <article className="prose max-w-none dark:prose-invert rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-white/60 dark:bg-zinc-950/60">
                    <ReactMarkdown>{md}</ReactMarkdown>
                </article>
            </div>
        </main>
    );
}