'use client'

import { useCallback, useState } from "react";

export default function Page(){
    const [input, setInput] = useState<string>('');
    const [history, setHistory] = useState<string[]>([]);

    const handleClick = useCallback((value: string) => {
        setInput(prev => prev + value);
    },[]);

    const handleClear = useCallback(() => {
        setInput('');
    }, []);

    const handleEqual = useCallback(() => {
        try {
            const result = eval(input);
            setHistory(prev => [...prev, `${input} = ${result}`]);
            setInput(String(result));
        } catch {
            setInput('Error');
        }
    }, [input]);

    
    return (
        <div className="flex flex-col items-center gap-4 p-6">
            <div className="border rounded p-2 w-64 text-right">{input || '0'}</div>

            <div className="grid grid-cols-4 gap-2 w-64">
                {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map(symbol => (
                    <button
                        key={symbol}
                        onClick={() =>
                            symbol === '=' ? handleEqual() : handleClick(symbol)
                        }
                        className="border rounded p-4 hover:bg-gray-100"
                    >
                        {symbol}
                    </button>
                ))}
                <button
                    className="col-span-4 border rounded p-2 hover:bg-gray-100"
                    onClick={() =>
                        handleClear()
                    }
                >
                    C
                </button>
            </div>
            <div className="w-64 border-t mt-4 pt-2">
                <h3 className="font-bold">History</h3>
                <ul className="text-sm">
                    {history.map((h, i) => (
                        <li key={i}>{h}</li>
                    ))}
                </ul>
            </div>
        </div>   
    );
}