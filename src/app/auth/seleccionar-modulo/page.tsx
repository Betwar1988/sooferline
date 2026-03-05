"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SeleccionarModulo() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState("contabilidad");
    const [error, setError] = useState("");

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            } else if (user.user_metadata?.modulo_seleccionado) {
                router.push("/dashboard");
            }
        };
        checkUser();
    }, [router]);

    const handleSelect = async () => {
        setLoading(true);
        setError("");

        const { error: updateError } = await supabase.auth.updateUser({
            data: {
                modulo_seleccionado: selected,
                plan: "Básico"
            }
        });

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
            return;
        }

        router.push("/dashboard");
    };

    const modules = [
        {
            id: "contabilidad",
            name: "Contabilidad",
            desc: "Asesoría contable en tiempo real impulsada por IA para tu negocio.",
            icon: "account_balance_wallet"
        },
        {
            id: "tributaria",
            name: "Tributaria",
            desc: "Planificación fiscal estratégica y cumplimiento automatizado de impuestos.",
            icon: "receipt_long"
        },
        {
            id: "laboral",
            name: "Laboral",
            desc: "Consultas expertas sobre nómina, contratos y normativa laboral vigente.",
            icon: "work"
        }
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col relative overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-50 px-6 pt-6 pb-2 flex items-center justify-between bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary rounded-xl flex items-center justify-center text-white">
                        <span className="material-symbols-outlined fill-1">bolt</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Sooferline IA</span>
                </div>
                <button onClick={() => router.push("/login")} className="size-10 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-[20px]">close</span>
                </button>
            </header>

            <main className="flex-1 px-6 pt-4 pb-24 max-w-md mx-auto w-full">
                {/* Title Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4 uppercase">
                        <span className="material-symbols-outlined text-[18px] fill-1">star</span>
                        <span className="text-xs font-semibold tracking-wider">Plan Básico</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight leading-tight">Selecciona tu módulo inicial</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base max-w-xs mx-auto">
                        Tu Plan Básico incluye acceso ilimitado a <span className="text-primary font-semibold">1 módulo</span> especializado.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* Grid of Modules */}
                <div className="grid grid-cols-1 gap-4">
                    {modules.map((mod) => (
                        <div
                            key={mod.id}
                            onClick={() => setSelected(mod.id)}
                            className={`glass-card p-5 rounded-2xl border-2 transition-all cursor-pointer relative group ${selected === mod.id
                                    ? "border-primary bg-primary/5 dark:bg-primary/10 ring-4 ring-primary/5"
                                    : "border-slate-100 dark:border-slate-800 hover:border-primary/50"
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className={`size-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${selected === mod.id ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                    }`}>
                                    <span className="material-symbols-outlined">{mod.icon}</span>
                                </div>
                                <div className={`size-6 rounded-full flex items-center justify-center transition-colors ${selected === mod.id ? "bg-primary text-white" : "border-2 border-slate-300 dark:border-slate-700"
                                    }`}>
                                    {selected === mod.id && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{mod.name}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">{mod.desc}</p>
                        </div>
                    ))}

                    {/* Coming Soon Module */}
                    <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 opacity-60">
                        <div className="flex items-start justify-between">
                            <div className="size-12 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 mb-4">
                                <span className="material-symbols-outlined">more_horiz</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-slate-400">Finanzas</h3>
                            <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tight">Próximamente</span>
                        </div>
                        <p className="text-sm text-slate-400">Análisis proyectivo y gestión de flujo de caja inteligente.</p>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="mt-8 text-center pb-12">
                    <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                        * Podrás cambiar o agregar módulos mejorando tu plan en cualquier momento.
                    </p>
                </div>
            </main>

            {/* Bottom Navigation & CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/95 dark:via-background-dark/95 to-transparent z-40">
                <button
                    disabled={loading}
                    onClick={handleSelect}
                    className="w-full bg-gradient-to-r from-primary to-[#7c3aed] text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                    <span>{loading ? "Activando..." : "Activar módulo seleccionado"}</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>

            <style jsx>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                :global(.dark) .glass-card {
                    background: rgba(30, 27, 58, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
