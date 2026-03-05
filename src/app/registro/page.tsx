"use client";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Registro() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        nombre: "",
        email: "",
        password: "",
        perfil: "",
        terms: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target;
        const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
        setForm({ ...form, [target.name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.terms) { setError("Debes aceptar los términos y condiciones."); return; }
        if (!form.perfil) { setError("Debes seleccionar un perfil profesional."); return; }
        setLoading(true);
        setError("");

        const { error: signUpError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: {
                    full_name: form.nombre,
                    perfil_profesional: form.perfil,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        router.push("/auth/verificar");
    };

    const handleGoogleSignUp = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-slate-900 overflow-x-hidden relative">
            {/* Mesh Background effect duplicated with CSS */}
            <div className="fixed inset-0 pointer-events-none -z-20 bg-[#f6f6f8] dark:bg-[#101022]">
                <div className="absolute inset-0"
                    style={{
                        backgroundImage: `
                        radial-gradient(at 0% 0%, rgba(43, 43, 238, 0.1) 0px, transparent 50%),
                        radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.1) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, rgba(43, 43, 238, 0.05) 0px, transparent 50%),
                        radial-gradient(at 0% 100%, rgba(139, 92, 246, 0.05) 0px, transparent 50%)
                        `
                    }} />
            </div>

            <style jsx>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
            `}</style>

            <nav className="flex items-center px-4 py-6 justify-between">
                <Link href="/inicio" className="text-slate-900 flex size-10 items-center justify-center rounded-full hover:bg-white/50 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div className="flex items-center gap-2">
                    <div className="bg-primary size-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-white text-[20px]">account_balance</span>
                    </div>
                    <span className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">Sooferline IA</span>
                </div>
                <div className="size-10"></div>
            </nav>

            <main className="flex-1 px-6 pb-12 max-w-md mx-auto w-full">
                <header className="text-center mb-8">
                    <h1 className="text-slate-900 dark:text-white text-[32px] font-bold leading-tight mb-2">Crea tu cuenta gratuita</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal">Comienza con 1 módulo gratis nivel básico</p>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 shadow-2xl shadow-primary/5 space-y-5">
                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold px-1">Nombre Completo</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">person</span>
                            <input
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 h-14 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                placeholder="Ej. Juan Pérez"
                                type="text"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold px-1">Correo electrónico</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">mail</span>
                            <input
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-4 h-14 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                placeholder="usuario@ejemplo.com"
                                type="email"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold px-1">Contraseña</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
                            <input
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                className="w-full pl-12 pr-12 h-14 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] cursor-pointer select-none"
                            >
                                {showPassword ? "visibility_off" : "visibility"}
                            </span>
                        </div>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold px-1">Perfil Profesional</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">work</span>
                            <select
                                name="perfil"
                                value={form.perfil}
                                onChange={handleChange}
                                required
                                className="w-full pl-12 pr-10 h-14 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none transition-all text-slate-700"
                            >
                                <option disabled value="">Selecciona tu perfil</option>
                                <option value="estudiante">Estudiante</option>
                                <option value="profesional_dependiente">Profesional dependiente</option>
                                <option value="emprendedor_pyme">Emprendedor / PyME</option>
                                <option value="profesional_independiente">Profesional independiente</option>
                                <option value="otro">Otro</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-start gap-3 py-2">
                        <input
                            name="terms"
                            checked={form.terms}
                            onChange={handleChange}
                            className="mt-1 size-5 rounded border-slate-300 text-primary focus:ring-primary transition-all"
                            id="terms"
                            type="checkbox"
                            required
                        />
                        <label className="text-sm text-slate-600 dark:text-slate-300 leading-tight" htmlFor="terms">
                            Acepto los <span className="text-primary font-medium cursor-pointer">Términos y Condiciones</span> y la <span className="text-primary font-medium cursor-pointer">Política de Privacidad</span>.
                        </label>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-16 bg-gradient-to-r from-primary to-violet-600 text-white font-bold text-lg rounded-xl shadow-xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                    >
                        <span>{loading ? "Registrando..." : "Registrarse"}</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-4 text-slate-400 text-sm font-medium">O continúa con</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignUp}
                        disabled={loading}
                        className="w-full h-14 bg-white border border-slate-200 text-slate-700 font-semibold text-base rounded-xl shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                    >
                        <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"></path>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                        </svg>
                        <span>Google</span>
                    </button>
                </form>

                <footer className="mt-8 text-center">
                    <p className="text-slate-600 dark:text-slate-400 text-base">
                        ¿Ya tienes cuenta?
                        <Link className="text-primary font-bold hover:underline underline-offset-4 ml-1" href="/login">Ingresa aquí</Link>
                    </p>
                </footer>
            </main>

            {/* Decorative Blurs */}
            <div className="fixed top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10"></div>
            <div className="fixed bottom-[-10%] left-[-10%] w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] -z-10"></div>
        </div>
    );
}
