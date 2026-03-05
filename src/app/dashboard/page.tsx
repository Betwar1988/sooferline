"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

const modulosConfig = [
    {
        id: "contabilidad",
        icon: "account_balance_wallet",
        name: "Contabilidad",
        desc: "Asesoría contable en tiempo real impulsada por IA.",
    },
    {
        id: "tributaria",
        icon: "receipt_long",
        name: "Tributaria",
        desc: "Planificación fiscal y cumplimiento de impuestos.",
    },
    {
        id: "laboral",
        icon: "work",
        name: "Laboral",
        desc: "Consultas sobre nómina y normativa laboral.",
    },
];

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [userPlan, setUserPlan] = useState("Básico");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error) {
                    console.error("Auth error:", error.message);
                    router.push("/inicio");
                    return;
                }

                if (!user) {
                    router.push("/inicio");
                    return;
                }

                const metadata = user.user_metadata;
                if (!metadata?.perfil_profesional) {
                    router.push("/auth/completar-perfil");
                    return;
                }
                if (!metadata?.modulo_seleccionado) {
                    router.push("/auth/seleccionar-modulo");
                    return;
                }

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("plan")
                    .eq("id", user.id)
                    .single();

                setUser(user);
                setUserPlan(profile?.plan || "Básico");
                setLoading(false);
            } catch (e) {
                console.error("Dashboard auth check error:", e);
                router.push("/inicio");
            }
        };

        checkUser();
    }, [router]);

    const activeModuleId = user?.user_metadata?.modulo_seleccionado;
    const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuario";

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/inicio");
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden flex flex-col">
            {loading ? (
                <div className="min-h-screen bg-background-light flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {/* Top Header */}
                    <header className="sticky top-0 z-50 glass px-4 py-3 flex items-center justify-between border-b border-primary/10 transition-all">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
                            </div>
                            <h1 className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Sooferline IA</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="relative p-2 text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                            </button>
                            <div className="group relative">
                                <div className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden cursor-pointer shadow-inner">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                </div>
                                <div className="hidden group-hover:block absolute right-0 top-full pt-2 w-48 z-50">
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 p-2">
                                        <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">logout</span>
                                            Cerrar sesión
                                        </button>
                                        <hr className="my-1 border-slate-100 dark:border-slate-700" />
                                        <Link href="/admin/ingesta" className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg flex items-center gap-2 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">upload_file</span>
                                            Ingesta de Doc (Admin)
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto pb-24">
                        {/* User Welcome Section */}
                        <section className="p-4 bg-gradient-to-br from-primary/5 to-transparent">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Hola, {userName}</p>
                                    <h2 className="text-2xl font-bold tracking-tight">Dashboard Premium</h2>
                                </div>
                                <div className="text-right">
                                    <Link href="/planes" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide hover:bg-primary hover:text-white transition-all">
                                        Plan {userPlan}
                                    </Link>
                                </div>
                            </div>

                            {/* Usage Progress */}
                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl p-4 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Consultas mensuales</span>
                                    <span className="text-sm font-bold text-primary">0 / {userPlan === "Básico" ? "20" : "∞"}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                    <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: "0%" }}></div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider font-semibold">
                                    {userPlan === "Básico" ? "Quedan 20 consultas disponibles" : "Consultas ilimitadas activas"}
                                </p>
                            </div>
                        </section>

                        {/* Module Grid */}
                        <section className="p-4">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Módulos Disponibles</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {modulosConfig.map((mod) => {
                                    const isSelected = mod.id === activeModuleId;
                                    const hasAccess = userPlan !== "Básico" || isSelected;
                                    const isActive = hasAccess; // For UI purposes, if they can enter, it's 'active' or 'available'

                                    return (
                                        <div key={mod.id} className={`relative overflow-hidden rounded-2xl border p-5 transition-all shadow-sm ${isSelected
                                            ? "bg-white dark:bg-slate-800 border-primary shadow-md hover:shadow-lg"
                                            : hasAccess
                                                ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-800 hover:shadow-md"
                                                : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-80 grayscale-[0.5]"
                                            }`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`${hasAccess ? "bg-primary/10 text-primary" : "bg-slate-200 dark:bg-slate-700 text-slate-500"} p-3 rounded-xl transition-colors`}>
                                                    <span className="material-symbols-outlined">{mod.icon}</span>
                                                </div>
                                                {isSelected ? (
                                                    <span className="text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded uppercase">Principal</span>
                                                ) : hasAccess ? (
                                                    <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded uppercase">Disponible</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-400">lock</span>
                                                )}
                                            </div>
                                            <h4 className={`text-lg font-bold mb-1 ${isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-400"}`}>{mod.name}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">{mod.desc}</p>

                                            {hasAccess ? (
                                                <Link
                                                    href={`/chat?module=${mod.id}`}
                                                    className="flex items-center gap-2 text-primary font-bold text-sm cursor-pointer hover:gap-3 transition-all"
                                                >
                                                    <span>Iniciar Chat</span>
                                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                </Link>
                                            ) : (
                                                <Link href="/planes" className="w-full py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all">
                                                    <span className="material-symbols-outlined text-sm">upgrade</span>
                                                    Mejorar Plan
                                                </Link>
                                            )}

                                            <div className={`absolute -right-4 -bottom-4 opacity-10 ${isActive ? "text-primary" : "text-slate-400"}`}>
                                                <span className="material-symbols-outlined text-8xl">{mod.icon}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Feed Section */}
                        <section className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Normativas</h3>
                                <a className="text-primary text-xs font-bold hover:underline" href="#">Ver todas</a>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow transition-shadow">
                                    <div className="size-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined">gavel</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Nueva Reforma Tributaria 2024</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Resumen de cambios principales en el IVA.</p>
                                        <span className="text-[10px] text-slate-400 mt-1 block">Hace 2 horas</span>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow transition-shadow">
                                    <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Circular AFIP N° 45/2023</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Nuevos topes para monotributistas actualizados.</p>
                                        <span className="text-[10px] text-slate-400 mt-1 block">Ayer</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>

                    {/* Bottom Navigation Bar */}
                    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-2 pb-6 pt-2 z-50 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.1)] transition-colors">
                        <div className="flex justify-around items-center">
                            <Link className="flex flex-col items-center gap-1 text-primary" href="/dashboard">
                                <span className="material-symbols-outlined fill-1">dashboard</span>
                                <span className="text-[10px] font-bold">Dashboard</span>
                            </Link>
                            <a className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 cursor-not-allowed group" href="#">
                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">chat_bubble</span>
                                <span className="text-[10px] font-medium">Chats</span>
                            </a>
                            <div className="relative -top-6">
                                <button className="size-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center border-4 border-white dark:border-slate-900 active:scale-95 transition-all">
                                    <span className="material-symbols-outlined text-3xl">add</span>
                                </button>
                            </div>
                            <Link className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors" href="/biblioteca">
                                <span className="material-symbols-outlined">menu_book</span>
                                <span className="text-[10px] font-medium">Normas</span>
                            </Link>
                            <a className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-primary transition-colors" href="#">
                                <span className="material-symbols-outlined">person</span>
                                <span className="text-[10px] font-medium">Perfil</span>
                            </a>
                        </div>
                    </nav>

                    {/* Floating Upgrade Hint */}
                    <div className="fixed bottom-24 right-4 z-40 transition-transform hover:scale-105">
                        <div className="bg-primary text-white p-3 rounded-2xl shadow-xl shadow-primary/30 flex items-center gap-3 max-w-[180px] border border-white/20">
                            <span className="material-symbols-outlined animate-pulse text-amber-300">stars</span>
                            <p className="text-xs font-bold leading-tight">Desbloquea todo el potencial</p>
                        </div>
                    </div>
                </>
            )}

            <style jsx>{`
                .glass {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                :global(.dark) .glass {
                    background: rgba(18, 16, 34, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
            `}</style>
        </div>
    );
}
