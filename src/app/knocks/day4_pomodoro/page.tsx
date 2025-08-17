'use client';

import { useCallback,useEffect, useMemo, useRef, useState } from 'react';

declare global {
    interface Window {
        webkitAudioContext?: typeof AudioContext;
    }
}

type Phase = 'work' | 'break';

function formatMMSS(totalSec: number) {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Page() {
    // 設定
    const [workMin, setWorkMin] = useState<number>(25);
    const [breakMin, setBreakMin] = useState<number>(5);
    const [autoNext, setAutoNext] = useState<boolean>(true);
    const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
    const [longBreakMin, setLongBreakMin] = useState<number>(15);
    const [roundsPerLongBreak, setRoundsPerLongBreak] = useState<number>(4);

    // ランタイム状態
    const [phase, setPhase] = useState<Phase>('work');
    const [remaining, setRemaining] = useState<number>(workMin * 60);
    const [running, setRunning] = useState<boolean>(false);
    const [rounds, setRounds] = useState<number>(0); // 作業完了数
    const [isLong, setIsLong] = useState<boolean>(false); // 休憩がロングかどうか

    // サウンド用
    const audioCtxRef = useRef<AudioContext | null>(null);
    const audioUnlockedRef = useRef<boolean>(false);

    const ensureAudioCtx = () => {
        // ユーザー操作から
        if(!audioCtxRef.current){
            const Ctor = window.AudioContext ?? window.webkitAudioContext;
            audioCtxRef.current = Ctor ? new Ctor() : null;
        }

        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended'){
            audioCtxRef.current.resume().catch(() => {});
        }

        if (audioCtxRef.current?.state === 'running'){
            audioUnlockedRef.current = true;
        }
    };

    type BeepKind = 'work' | 'break';
    
    const playBeep = useCallback((kind: BeepKind, bypassEnabled = false) => {
        if (!bypassEnabled && !soundEnabled) return;
        const ctx = audioCtxRef.current;
        if(!ctx || !audioUnlockedRef.current) return; //未アンロックは無音でスキップ
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        // 作業再開は 520Hz、休憩開始は 880Hz とかで耳で区別
        osc.frequency.value = kind === 'break' ? 880 : 520;
        gain.gain.value = 0.0001;
        osc.connect(gain).connect(ctx.destination);
        const t = ctx.currentTime;
        // 立ち上げ → すぐ減衰（120ms程度の短いビープ）
        gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.18);
    }, [soundEnabled]);

    // 現在フェーズの総秒数
    const phaseSeconds = useMemo(
        () => (phase === 'work' ? workMin : (isLong ? longBreakMin : breakMin)) * 60,
        [phase, workMin, breakMin, longBreakMin, isLong]
    );
    

    // 停止中に設定やフェーズが変わったら、満タン秒に合わせる
    const prevPhaseSecRef = useRef<number>(phaseSeconds);

    useEffect(() => {
        const changed = prevPhaseSecRef.current !== phaseSeconds;
        if (!running && changed) setRemaining(phaseSeconds);
    }, [running, phase, workMin, breakMin, longBreakMin, isLong, phaseSeconds]);

    //
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [supportsNotification, setSupportsNotification] = useState(false);
    const [notifEnabled, setNotifEnabled] = useState(false);
    const [notifPerm, setNotifPerm] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (!mounted) return;
        const ok = 'Notification' in window;
        setSupportsNotification(ok);
        if (!ok) {
            setNotifPerm('default');
            setNotifEnabled(false);
            return;
        }
        const p = Notification.permission;
        setNotifPerm(p);
        setNotifEnabled(p === 'granted');
    }, [mounted]);

    // 初期化：すでに許可済みなら有効化
    useEffect(() => {
        if (!mounted) return;
        const ok = 'Notification' in window;
        setSupportsNotification(ok);
        if (!ok) {
            setNotifPerm('default');
            setNotifEnabled(false);
            return;
        }
        const p = Notification.permission;
        setNotifPerm(p);
        setNotifEnabled(p === 'granted');
    }, [mounted]);


    const requestNotificationPermission = async () => {
        if (!supportsNotification) return;
        try {
            const p = await Notification.requestPermission();
            setNotifPerm(p);
            setNotifEnabled(p === 'granted');
        } catch {

        }
    };

    const fireNotification = useCallback((title: string, body: string) => {
        if (!supportsNotification || !notifEnabled) return;
        try {
            new Notification(title, { body });
        } catch {

        }
    }, [supportsNotification, notifEnabled]);
    
    // タイマー進行 & 0到達時のフェーズ切替（0を返さず次秒数を返す）
    useEffect(() => {
        if (!running) return;

        const id = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(id);

                    const nextPhase: Phase = phase === 'work' ? 'break' : 'work';
                    let nextSeconds: number;

                    if (phase === 'work') setRounds((r) => r + 1);
                    setPhase(nextPhase);
                    setRunning(autoNext);

                    // 通知：フェーズ切替のお知らせ
                    if (nextPhase === 'break') {
                        const nextRounds = rounds + 1;
                        const willBeLong = nextRounds % Math.max(1, roundsPerLongBreak) === 0;
                        if (phase === 'work') setRounds((r) => r + 1);
                        setIsLong(willBeLong);
                        nextSeconds = (willBeLong ? longBreakMin : breakMin) * 60;
                        fireNotification('休憩タイム', `おつかれさま！ ${breakMin}分 休憩しよう。`);
                        playBeep('break');
                    } else {
                        setIsLong(false);
                        nextSeconds = workMin * 60;
                        fireNotification('作業再開', `集中モードに戻ろう。${workMin}分！`);
                        playBeep('work');
                    }

                    return nextSeconds; // 0を経由しない
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(id);
    }, [running, phase, workMin, breakMin, longBreakMin, roundsPerLongBreak, rounds, autoNext, fireNotification, playBeep]);

    // 操作
    const handleStart = () => {
        if (soundEnabled) ensureAudioCtx(); // ユーザー操作でアンロック
        if (remaining === 0) {
            setRemaining(phaseSeconds);
        }
        setRunning(true);
    };

    const handlePause = () => setRunning(false);

    const handleReset = () => {
        if (soundEnabled) ensureAudioCtx();
        setRunning(false);
        setPhase('work');
        setRounds(0);
        setRemaining(workMin * 60);
        setIsLong(false);
    };

    const handleSkip = () => {
        if (soundEnabled) ensureAudioCtx();
        setRunning(false);
        if (phase === 'work') {
            const nextRounds = rounds + 1;
            const willBeLong = nextRounds % Math.max(1, roundsPerLongBreak) === 0;
            setRounds((r) => r+1);
            setPhase('break');
            setIsLong(willBeLong);
            setRemaining((willBeLong? longBreakMin : breakMin) * 60);
        } else {
            setPhase('work');
            setIsLong(false);
            setRemaining(workMin * 60);
        }
    };

    const originalTitleRef = useRef<string | null>(null);

    useEffect(() => {
        if(typeof document === 'undefined') return;
        if(!originalTitleRef.current){
            originalTitleRef.current = document.title;
        }

        const icon = phase === 'work' ? '🧑‍💻' : '☕';
        const paused = running ? '' : ' ||';

        document.title = `${icon} ${formatMMSS(remaining)}${paused}`;

        return () => {
            if(originalTitleRef.current){
                document.title = originalTitleRef.current;
            }
        };
    }, [remaining, phase, running]);

    return (
        <main className="mx-auto max-w-md p-6">
            <h1 className="text-2xl font-bold mb-6">Pomodoro Timer</h1>
            {/* 通知の許可UI */}
            <section className="mt-2">
                <div className="text-sm text-gray-600 flex items-center gap-3">
                    <span>通知：</span>
                        {!mounted ? (
                        <span className="text-gray-500">判定中...</span>
                        ): supportsNotification ? (
                        notifPerm === 'granted' ? (
                            <span className="text-green-600">許可済み</span>
                        ) : notifPerm === 'denied' ? (
                            <span className="text-red-600">
                                ブラウザでブロック中（設定から許可に変更してください）
                            </span>
                        ) : (
                            <button
                                onClick={requestNotificationPermission}
                                className="px-3 py-1 rounded-lg border shadow hover:shadow-md"
                            >
                                通知を許可する
                            </button>
                        )
                    ) : (
                        <span className="text-gray-500">この環境は通知非対応</span>
                    )}
                </div>
            </section>
            {/* 設定UI */}
            <section className="grid grid-cols-2 gap-4 items-end">
                <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-600">作業（分）</span>
                    <input
                        type="number"
                        min={1}
                        className="border rounded-xl px-3 py-2"
                        value={workMin}
                        disabled={running}
                        onChange={(e) =>
                            setWorkMin(Math.max(1, Number(e.target.value)))
                        }
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-600">休憩（分）</span>
                    <input
                        type="number"
                        min={1}
                        className="border rounded-xl px-3 py-2"
                        value={breakMin}
                        disabled={running}
                        onChange={(e) =>
                            setBreakMin(Math.max(1, Number(e.target.value)))
                        }
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-600">ロング休憩（分）</span>
                    <input
                        type="number"
                        min={1}
                        className="border rounded-xl px-3 py-2"
                        value={longBreakMin}
                        disabled={running}
                        onChange={(e) => 
                            setLongBreakMin(Math.max(1, Number(e.target.value)))
                        }
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-sm text-gray-600">ロング間隔（作業回数）</span>
                    <input
                        type="number"
                        min={1}
                        className="border rounded-xl px-3 py-2"
                        disabled={running}
                        onChange={(e) =>
                            setRoundsPerLongBreak(Math.max(1, Number(e.target.value)))
                        }
                    />
                </label>
                <label className="col-span-2 flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={autoNext}
                        onChange={(e) => setAutoNext(e.target.checked)}
                    />
                    <span className="text-sm">次フェーズを自動開始する</span>
                </label>
            </section>

            {/* 表示 */}
            <section className="text-center space-y-2 mt-6">
                <div className="text-sm text-gray-500">
                    現在のフェーズ：
                    <b>
                        {phase === 'work' 
                            ? '作業' 
                            : `休憩${isLong ? '(ロング)' : '(ショート)'}`
                        }
                    </b>
                    <span className="ml-3">
                        作業完了数：<b>{rounds}</b>
                    </span>
                </div>
                <div className="text-7xl font-mono tabular-nums">
                    {formatMMSS(remaining)}
                </div>
            </section>

            {/* 操作ボタン */}
            <section className="flex flex-wrap gap-3 justify-center mt-6">
                <button
                    onClick={handleStart}
                    disabled={running}
                    className="px-4 py-2 rounded-xl shadow border hover:shadow-md disabled:opacity-50"
                >
                    Start
                </button>
                <button
                    onClick={handlePause}
                    disabled={!running}
                    className="px-4 py-2 rounded-xl shadow border hover:shadow-md disabled:opacity-50"
                >
                    Pause
                </button>
                <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl shadow border hover:shadow-md"
                >
                    Reset
                </button>
                <button
                    onClick={handleSkip}
                    className="px-4 py-2 rounded-xl shadow border hover:shadow-md"
                >
                    Skip ▶
                </button>
            </section>
            <section className="mt-2 flex items-center gap-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={soundEnabled}
                        onChange={(e) => {
                            setSoundEnabled(e.target.checked);
                            if(e.target.checked) ensureAudioCtx();
                        }}
                    />
                    <span className="text-sm">サウンド通知を有効にする</span>
                </label>
                <button 
                    onClick={() => {
                        ensureAudioCtx();
                        playBeep('work', true);
                    }}
                    className="px-3 py-1 rounded-lg border shadow hover:shadow-md text-sm"
                >
                    テスト再生
                </button>
            </section>
        </main>
    );
}
