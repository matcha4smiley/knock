'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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

    // ランタイム状態
    const [phase, setPhase] = useState<Phase>('work');
    const [remaining, setRemaining] = useState<number>(workMin * 60);
    const [running, setRunning] = useState<boolean>(false);
    const [rounds, setRounds] = useState<number>(0); // 作業完了数

    // 現在フェーズの総秒数
    const phaseSeconds = useMemo(
        () => (phase === 'work' ? workMin : breakMin) * 60,
        [phase, workMin, breakMin]
    );

    // 停止中に設定やフェーズが変わったら、満タン秒に合わせる
    useEffect(() => {
        if (!running) setRemaining(phaseSeconds);
    }, [phase, workMin, breakMin, phaseSeconds]);

    // タイマー進行 & 0到達時のフェーズ切替（0を返さず次秒数を返す）
    useEffect(() => {
        if (!running) return;

        const id = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(id);

                    const nextPhase: Phase = phase === 'work' ? 'break' : 'work';
                    const nextSeconds =
                        (nextPhase === 'work' ? workMin : breakMin) * 60;

                    if (phase === 'work') setRounds((r) => r + 1);
                    setPhase(nextPhase);
                    setRunning(autoNext);

                    // 通知：フェーズ切替のお知らせ
                    if (nextPhase === 'break') {
                        fireNotification('休憩タイム', `おつかれさま！ ${breakMin}分 休憩しよう。`);
                    } else {
                        fireNotification('作業再開', `集中モードに戻ろう。${workMin}分！`);
                    }

                    return nextSeconds; // 0を経由しない
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(id);
    }, [running, phase, workMin, breakMin, autoNext]);

    // 操作
    const handleStart = () => {
        if (remaining === 0) {
            setRemaining(phaseSeconds);
        }
        setRunning(true);
    };

    const handlePause = () => setRunning(false);

    const handleReset = () => {
        setRunning(false);
        setPhase('work');
        setRounds(0);
        setRemaining(workMin * 60);
    };

    const handleSkip = () => {
        setRunning(false);
        if (phase === 'work') {
            setPhase('break');
            setRemaining(breakMin * 60);
        } else {
            setPhase('work');
            setRemaining(workMin * 60);
        }
    };

    // 通知サポート判定
    const supportsNotification = 
        typeof window !== 'undefined' && 'Notification' in window;
    
    // 通知の利用ON/OFF（ユーザ設定ではなく「使えるか」のフラグ）
    const [notifEnabled, setNotifEnabled] = useState<boolean>(false);

    // 現在の権限（'default' | 'granted' | 'denied'）
    const [notifPerm, setNotifPerm] = useState<NotificationPermission>(
        supportsNotification ? Notification.permission : 'default'
    );

    // 初期化：すでに許可済みなら有効化
    useEffect(() => {
        if(supportsNotification && Notification.permission === 'granted') {
            setNotifEnabled(true);
            setNotifPerm('granted');
        }
    })

    const requestNotificationPermission = async() => {
        if(!supportsNotification) return;
        try{
            const p = await Notification.requestPermission();
            setNotifPerm(p);
            setNotifEnabled(p === 'granted');
        } catch {

        }
    };

    const fireNotification = (title: string, body: string) => {
        if(!supportsNotification || !notifEnabled) return;
        try {
            new Notification(title, { body });
        } catch {

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
                    {supportsNotification ? (
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
                    現在のフェーズ：<b>{phase === 'work' ? '作業' : '休憩'}</b>
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
        </main>
    );
}
