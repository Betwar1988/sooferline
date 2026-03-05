"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CompletarPerfil() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        nombre: "",
        perfil: "",
        terms: false,
    });

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            } else if (user.user_metadata?.perfil_profesional) {
                router.push("/auth/seleccionar-modulo");
            } else if (user.user_metadata?.full_name) {
                setForm(prev => ({ ...prev, nombre: user.user_metadata.full_name }));
            }
        };
        checkUser();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.terms) { setError("Debes aceptar los términos y condiciones."); return; }
        if (!form.perfil) { setError("Debes seleccionar un perfil profesional."); return; }

        setLoading(true);
        setError("");

        const { error: updateError } = await supabase.auth.updateUser({
            data: {
                full_name: form.nombre,
                perfil_profesional: form.perfil,
            }
        });

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
            return;
        }

        router.push("/auth/seleccionar-modulo");
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen relative overflow-hidden text-slate-900 dark:text-slate-100">
            {/* Decorative Blobs */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute top-1/2 -right-20 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[90px] pointer-events-none"></div>

            <div className="relative flex flex-col min-h-screen w-full max-w-[430px] mx-auto bg-transparent px-6 pb-12">
                {/* Header */}
                <header className="flex items-center justify-between py-6">
                    <button onClick={() => router.push("/login")} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                        <span className="material-symbols-outlined text-slate-900 dark:text-white text-[20px]">close</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-violet-600 rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-[18px]">cloud</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-lg">Sooferline IA</span>
                    </div>
                    <div className="w-10"></div>
                </header>

                {/* Main Content */}
                <main className="flex-1">
                    <div className="pt-8 pb-4">
                        <h1 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">Completa tu perfil</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base mt-2 leading-relaxed">Por favor, finaliza tu registro para comenzar a usar Sooferline IA de forma personalizada.</p>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                        {/* Full Name Input */}
                        <div className="space-y-2">
                            <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold ml-1">Nombre Completo</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">person</span>
                                </div>
                                <input
                                    required
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    className="w-full h-14 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                                    placeholder="Ej. Juan Pérez"
                                    type="text"
                                />
                            </div>
                        </div>

                        {/* Professional Profile Select */}
                        <div className="space-y-2">
                            <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold ml-1">Perfil Profesional</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">work</span>
                                </div>
                                <select
                                    required
                                    name="perfil"
                                    value={form.perfil}
                                    onChange={(e) => setForm({ ...form, perfil: e.target.value })}
                                    className="w-full h-14 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl pl-12 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white appearance-none outline-none"
                                >
                                    <option disabled value="">Selecciona tu perfil</option>
                                    <option value="estudiante">Estudiante</option>
                                    <option value="profesional_dependiente">Profesional dependiente</option>
                                    <option value="emprendedor_pyme">Emprendedor / PyME</option>
                                    <option value="profesional_independiente">Profesional independiente</option>
                                    <option value="otro">Otro</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400">expand_more</span>
                                </div>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="flex items-start gap-3 px-1 py-2">
                            <div className="flex items-center h-5">
                                <input
                                    required
                                    id="terms"
                                    type="checkbox"
                                    checked={form.terms}
                                    onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                                    className="size-5 text-primary border-slate-300 dark:border-slate-700 rounded focus:ring-primary/30"
                                />
                            </div>
                            <label className="text-sm text-slate-500 dark:text-slate-400 leading-snug" htmlFor="terms">
                                Acepto los <Link className="text-primary font-medium underline" href="#">Términos y Condiciones</Link> y la <Link className="text-primary font-medium underline" href="#">Política de Privacidad</Link> de Sooferline IA.
                            </label>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 bg-gradient-to-r from-primary to-violet-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-60"
                            >
                                <span>{loading ? "Completando..." : "Completar Registro"}</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <p className="text-center text-slate-400 text-xs mt-6">
                                Tus datos están protegidos y cifrados con seguridad bancaria.
                            </p>
                        </div>
                    </form>
                </main>
            </div>
            {/* Background pattern */}
            <div className="fixed inset-0 z-[-1] pointer-events-none opacity-50 dark:opacity-20">
                <div className="h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>
        </div>
    );
}
