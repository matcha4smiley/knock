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
            const result = safeEvaluate(input);
            setHistory(prev => [...prev, `${input} = ${result}`]);
            setInput(String(result));
        } catch {
            setInput('Error');
        }
    }, [input]);

    
    type Token = { type: 'num' | 'op' | 'lparen' | 'rparen'; value: string };

    const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const isOp = (c: string): c is '+' | '-' | '*' | '/' => ['+', '-', '*', '/'].includes(c);


    
    return (
        <div className="flex flex-col items-center gap-4 p-6">
            <div className="border rounded p-2 w-64 text-right">{input || '0'}</div>

            <div className="grid grid-cols-4 gap-2 w-64">
                {['(', ')', '/', 'C', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map(symbol => (
                    <button
                        key={symbol}
                        onClick={() =>{
                            if (symbol === '=') return handleEqual();
                            if (symbol === 'C') return handleClear();
                            if (symbol.trim() === '') return; // 空白プレースホルダ
                            return handleClick(symbol);
                        }}
                        className="border rounded p-4 hover:bg-gray-100"
                    >
                        {symbol}
                    </button>
                ))}
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

    //計算ロジック
    function tokenize(expr: string): Token[] {
        const tokens: Token[] = [];
        let buf = '';
        let prevType: Token['type'] | null = null;

        for (let i = 0; i < expr.length; i++) {
            const c = expr[i];
            if (/\d|\./.test(c)) {
                buf += c;
                continue;
            }

            if (isOp(c)) {
                const next = expr[i + 1];
                const canBeUnary = c === '-' && (prevType === null || prevType === 'op' || prevType === 'lparen');
                if (canBeUnary && next && (/[\d\.]/.test(next))) {
                    buf += c;
                    continue;
                }

                if (buf.length > 0) {
                    tokens.push({ type: 'num', value: buf });
                    buf = '';
                    prevType = 'num';
                } else if (prevType !== 'rparen'){
                    throw new Error('Invalid expression');
                }
                tokens.push({ type: 'op', value: c });
                prevType = 'op';
                continue;
            }

            if (c === '(') {
                if (buf.length) {
                    tokens.push({ type: 'num', value: buf });
                    buf = '';
                    prevType = 'num';
                }
                tokens.push({ type: 'lparen', value: c });
                prevType = 'lparen';
                continue;
            }

            if (c === ')') {
                if (buf.length) { 
                    tokens.push({ type: 'num', value: buf });
                    buf = '';
                    prevType = 'num';
                }
                tokens.push({ type: 'rparen', value: c });
                prevType = 'rparen';
                continue;
            }

            if (c === ' ') continue;
            throw new Error('Unsupported char');
        }

        if (buf.length) {
            tokens.push({ type: 'num', value: buf });
            prevType = 'num';
        }
        return tokens;
    }

    function toRPN(tokens: Token[]): Token[] {
        const out: Token[] = [];
        const ops: Token[] = [];

        for (const t of tokens) {
            if (t.type === 'num') {
                out.push(t);
            } else if (t.type === 'op') {
                while (
                    ops.length &&
                    ops[ops.length - 1].type === 'op' &&
                    precedence[ops[ops.length - 1].value] >= precedence[t.value]
                ) {
                    out.push(ops.pop() as Token);
                }
                ops.push(t);
            } else if (t.type === 'lparen') {
                ops.push(t);
            } else if (t.type === 'rparen') {
                while (ops.length && ops[ops.length - 1].type !== 'lparen') {
                    out.push(ops.pop() as Token);
                }
                if (!ops.length) throw new Error('Mismatched parentheses');
                ops.pop();
            }
        }
        while (ops.length) {
            const t = ops.pop() as Token;
            if (t.type === 'lparen' || t.type === 'rparen') throw new Error('Mismatched parentheses');
            out.push(t);
        }
        return out;
    }

    function evalRPN(tokens: Token[]): number {
        const st: number[] = [];
        for (const t of tokens) {
            if (t.type === 'num') {
                const n = Number(t.value);
                if (Number.isNaN(n)) throw new Error('NaN');
                st.push(n);
            } else if(t.type === 'op') {
                const b = st.pop();
                const a = st.pop();

                if (a === undefined || b === undefined) throw new Error('Stack Underflow');
                switch (t.value) {
                    case '+': st.push(a + b); break;
                    case '-': st.push(a - b); break;
                    case '*': st.push(a * b); break;
                    case '/': st.push(b === 0 ? NaN : a / b); break;
                }
            }
        }
        if (st.length !== 1) throw new Error('Invalid RPN');
        return st[0];
    }

    function safeEvaluate(input: string): number {
        const tokens = tokenize(input);
        const rpn = toRPN(tokens);
        const result = evalRPN(rpn);

        if (!Number.isFinite(result)) throw new Error('Invalid result');

        return result;
    }
}