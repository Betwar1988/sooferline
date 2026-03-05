"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerificarEmail() {
    const router = useRouter();

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen relative overflow-hidden flex flex-col">
            {/* Decorative Blobs */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>

            <div className="relative flex flex-col min-h-screen w-full max-w-md mx-auto z-10 px-6">
                {/* Top Navigation */}
                <header className="flex items-center py-8">
                    <button onClick={() => router.push("/login")} aria-label="Go back" className="flex items-center justify-center size-10 rounded-full bg-white/50 dark:bg-white/10 shadow-sm transition-all hover:bg-white dark:hover:bg-white/20 active:scale-90">
                        <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
                    </button>
                    <h1 className="flex-1 text-center text-lg font-bold tracking-tight pr-10">Sooferline IA</h1>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center text-center">
                    {/* Icon Container */}
                    <div className="mb-10 relative">
                        <div className="size-40 rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/30">
                            <span className="material-symbols-outlined text-white text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
                        </div>
                        {/* Decorative element */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 rounded-full border border-primary/20 animate-pulse"></div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-4 mb-12">
                        <h2 className="text-3xl font-bold tracking-tight">Activa tu cuenta</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed max-w-xs mx-auto">
                            Hemos enviado un enlace de verificación a tu correo electrónico.
                        </p>
                        <p className="text-slate-500 dark:text-slate-500 text-sm italic">
                            Debes activar tu cuenta antes de seleccionar tu módulo inicial.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="w-full space-y-6">
                        <Link className="block w-full py-4 px-6 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 transition-all active:scale-[0.98] text-center" href="/login">
                            Volver al inicio de sesión
                        </Link>
                        <div className="flex flex-col items-center">
                            <button className="text-primary font-medium text-sm flex items-center gap-1 hover:underline active:scale-95 transition-all">
                                Reenviar correo de verificación
                                <span className="material-symbols-outlined text-sm">refresh</span>
                            </button>
                        </div>
                    </div>
                </main>

                {/* Footer Decoration */}
                <div className="py-8">
                    <div className="glass rounded-xl p-4 flex items-center justify-center space-x-2 border border-white/30 dark:border-white/10 shadow-sm backdrop-blur-md">
                        <span className="material-symbols-outlined text-primary/60 text-sm">info</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">¿Necesitas ayuda? Contacta a soporte</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .glass {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                :global(.dark) .glass {
                    background: rgba(30, 27, 58, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
