'use client'

import { ChangeEvent, useState } from "react"

export default function Page(){
    const [cm, setCm] = useState<string>();
    const [m, setM] = useState<string>();

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

    return(
        <main className="p-8">
            <h1 className="text-xl font-bold mb-4">単位換算 (cm ↔ m)</h1>
            <div className="flex flex-col gap-4">
                <label className="flex items-center gap-2">
                    <span>cm:</span>
                    <input
                        type="number"
                        value={cm}
                        onChange={handleCmChange}
                        className="border p-2 rounded"
                    />
                </label>
                <label className="flex items-center gap-2">
                    <span>m:</span>
                    <input
                        type="number"
                        value={m}
                        onChange={handleMChange}
                        className="border p-2 rounded"
                    />
                </label>
            </div>
        </main>
    );
}