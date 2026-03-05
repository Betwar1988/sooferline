"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
    return (
        <nav className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-12 transition-transform">
                    <span className="material-symbols-outlined text-white text-2xl">rocket_launch</span>
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tighter">SOOFERLINE <span className="text-primary font-black">IA</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
                <Link href="/biblioteca" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Biblioteca</Link>
                <Link href="/tienda" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Tienda</Link>
                <Link href="/mis-compras" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Mis Compras</Link>
                <Link href="/planes" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Planes</Link>
                <Link href="/dashboard" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-primary transition-all shadow-xl shadow-slate-200">Dashboard</Link>
            </div>
        </nav>
    );
}
