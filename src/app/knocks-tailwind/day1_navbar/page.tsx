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

}