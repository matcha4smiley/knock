"use client"
import { useState, useEffect } from "react";

export default function Page(){
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onResize = () => {
            if(window.matchMedia("(min-width: 768px)").matches) {
                setOpen(false);
            }
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize)
    }, []);

    return(
        <header className="flex items-center justify-between px-4 py-3 shadow-md">
            <div className="text-xl font-bold">MySite</div>
            <nav className="hidden md:flex space-x-6">
                <a href="#" className="hover:text-blue-500">Home</a>
                <a href="#" className="hover:text-blue-500">About</a>
                <a href="#" className="hover:text-blue-500">Contact</a>
            </nav>
            <button 
                className="md:hidden p-2 border rounded focus:ring-2w focus:ring-blue-500"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
                onClick={() => setOpen((v)=>!v)}
            >
                ☰
                <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>

            </button>
            {/* モバイルメニュー（md未満で表示、openのときだけ描画） */}
            <div
                id="mobile-menu"
                className={`
                    ${open ? "block" : "hidden"}
                    md:hidden
                    absolute left-0 right-0 top-[56px]
                    border-t
                    bg-white
                `}
            >
                <ul className="flex flex-col px-4 py-3 gap-y-3">
                    <li><a href="#" className="block hover:text-blue-500">Home</a></li>
                    <li><a href="#" className="block hover:text-blue-500">About</a></li>
                    <li><a href="#" className="block hover:text-blue-500">Contact</a></li>
                </ul>
            </div>
        </header>
    );

    //計算ロジック
    type Token = { type: 'num' | 'op'; value: string };

    const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const isOp = (c: string): c is '+' | '-' | '*' | '/' => ['+', '-', '*', '/'].includes(c);

    function tokenize(expr: string): Token[] {
        const tokens: Token[] = [];
        let buf = '';

        for(let i = 0; i < expr.length; i++){
            const c = expr[i];
            if(/\d.|\./.test(c)){
                buf += c;
                continue;
            }

            if(isOp(c)){
                if(buf.length === 0) throw new Error('Invalid expression');
                tokens.push({ type: 'num', value: buf});
                buf = '';
                tokens.push({ type: 'op', value: c});
                continue;
            }

            if(c === ' ') continue;
            throw new Error('Unsupported char');
        }

        if(buf.length) tokens.push({ type: 'num', value: buf});
        return tokens;
    }

    function toRPN(tokens: Token[]): Token[] {
        const out: Token[] = [];
        const ops: Token[] = [];

        for(const t of tokens){
            if(t.type === 'num'){
                out.push(t);
            } else {
                while(
                    ops.length &&
                    ops[ops.length - 1].type === 'op' &&
                    precedence[ops[ops.length - 1].value] >= precedence[t.value]
                ){
                    out.push(ops.pop() as Token);
                }
                ops.push(t);
            }
        }
        while(ops.length) out.push(ops.pop() as Token);
        return out;
    }

    function evalRPN(tokens: Token[]): number {
        const st: number[] = [];
        for(const t of tokens){
            if(t.type === 'num'){
                const n = Number(t.value);
                if(Number.isNaN(n)) throw new Error('NaN');
                st.push(n);
            } else {
                const b = st.pop();
                const a = st.pop();

                if(a === undefined || b === undefined) throw new Error('Stack Underflew');
                switch(t.value){
                    case '+': st.push(a+b); break;
                    case '-': st.push(a-b); break;
                    case '*': st.push(a*b); break;
                    case '/': st.push(b === 0 ? NaN : a/b); break;
                }
            }
        }
        if(st.length !== 1) throw new Error('Invalid RPN');
        return st[0];
    }

    function safeEvaluate(input: string): number {
        const tokens = tokenize(input);
        const rpn = toRPN(tokens);
        const result = evalRPN(rpn);

        if(!Number.isFinite(result)) throw new Error('Invalid result');

        return result;
    }
}