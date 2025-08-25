'use client'

import { ChangeEvent, useState, useCallback } from "react"

type TabKey = 'length' | 'temp';

export default function Page(){
    const [cm, setCm] = useState<string>('');
    const [m, setM] = useState<string>('');
    const [celsius, setCelsius] = useState<string>('');
    const [fahrenheit, setFahrenheit] = useState<string>('');
    const [activeTab, setActiveTab] = useState<TabKey>('length' as TabKey);

    const handleTabClick = useCallback((key: TabKey) => {
        setActiveTab(key);
    }, []);

    const handleCmChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCm(value);
        const num = parseFloat(value);
        if(!isNaN(num)){
            setM((num / 100).toString());
        } else {
            setCm('');
        }
    };

    const handleMChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setM(value);
        const num = parseFloat(value);
        if(!isNaN(num)){
            setCm((num * 100).toString());
        } else {
            setCm('');
        }
    };

    const handleCelsiusChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCelsius(value);
        const num = parseFloat(value);
        if (!isNaN(num)) {
            setFahrenheit(((num * 9) / 5 + 32).toFixed(1));
        } else {
            setFahrenheit('');
        }
    };

    const handleFahrenheitChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFahrenheit(value);
        const num = parseFloat(value);
        if (!isNaN(num)) {
            setCelsius((((num - 32) * 5) / 9).toFixed(1));
        } else {
            setCelsius('');
        }
    };

    return (
        <main className="p-8">
            <h1 className="text-xl font-bold mb-6">単位換算（タブ切替）</h1>

            {/* Tabs */}
            <div
                role="tablist"
                aria-label="単位カテゴリ"
                className="inline-flex rounded-xl overflow-hidden border"
            >
                <button
                    role="tab"
                    aria-selected={activeTab === 'length'}
                    aria-controls="panel-length"
                    id="tab-length"
                    onClick={() => handleTabClick('length')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'length' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                        } border-r`}
                    type="button"
                >
                    長さ（cm ↔ m）
                </button>
                <button
                    role="tab"
                    aria-selected={activeTab === 'temp'}
                    aria-controls="panel-temp"
                    id="tab-temp"
                    onClick={() => handleTabClick('temp')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'temp' ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                        }`}
                    type="button"
                >
                    温度（℃ ↔ ℉）
                </button>
            </div>

            {/* Panels */}
            <section
                role="tabpanel"
                id="panel-length"
                aria-labelledby="tab-length"
                hidden={activeTab !== 'length'}
                className="mt-6"
            >
                <h2 className="text-lg font-semibold mb-4">長さ</h2>
                <div className="flex flex-col gap-4 max-w-xs">
                    <label className="flex items-center gap-2">
                        <span className="w-12">cm:</span>
                        <input
                            type="number"
                            value={cm ?? ''}
                            onChange={handleCmChange}
                            className="border p-2 rounded w-full"
                            inputMode="decimal"
                        />
                    </label>
                    <label className="flex items-center gap-2">
                        <span className="w-12">m:</span>
                        <input
                            type="number"
                            value={m ?? ''}
                            onChange={handleMChange}
                            className="border p-2 rounded w-full"
                            inputMode="decimal"
                        />
                    </label>
                </div>
            </section>

            <section
                role="tabpanel"
                id="panel-temp"
                aria-labelledby="tab-temp"
                hidden={activeTab !== 'temp'}
                className="mt-6"
            >
                <h2 className="text-lg font-semibold mb-4">温度</h2>
                <div className="flex flex-col gap-4 max-w-xs">
                    <label className="flex items-center gap-2">
                        <span className="w-12">℃:</span>
                        <input
                            type="number"
                            value={celsius ?? ''}
                            onChange={handleCelsiusChange}
                            className="border p-2 rounded w-full"
                            inputMode="decimal"
                        />
                    </label>
                    <label className="flex items-center gap-2">
                        <span className="w-12">℉:</span>
                        <input
                            type="number"
                            value={fahrenheit ?? ''}
                            onChange={handleFahrenheitChange}
                            className="border p-2 rounded w-full"
                            inputMode="decimal"
                        />
                    </label>
                </div>
            </section>
        </main>
    );
}