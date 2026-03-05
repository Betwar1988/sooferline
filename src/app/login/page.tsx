"use client";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.type === "email" ? "email" : "password"]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { data, error: loginError } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
        });

        if (loginError) {
            setError(loginError.message);
            setLoading(false);
            return;
        }

        // Check if user has selected a module
        const perfil = data.user?.user_metadata?.perfil_profesional;
        const modulo = data.user?.user_metadata?.modulo_seleccionado;

        if (!perfil) {
            router.push("/auth/completar-perfil");
        } else if (!modulo) {
            router.push("/auth/seleccionar-modulo");
        } else {
            router.push("/dashboard");
        }
    };

    const handleGoogleLogin = async () => {
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
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
                {/* Top App Bar - iOS feel */}
                <div className="flex items-center bg-transparent p-4 justify-between sticky top-0 z-50">
                    <Link href="/inicio" className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full bg-white/50 backdrop-blur shadow-sm hover:bg-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back_ios_new</span>
                    </Link>
                    <div className="flex-1 text-center">
                        <h2 className="text-slate-900 font-bold text-lg dark:text-white">Sooferline IA</h2>
                    </div>
                    <div className="size-10"></div>
                </div>

                <div className="px-6 pt-2 pb-6">
                    {/* Hero / Branding Section */}
                    <div className="relative w-full overflow-hidden rounded-xl h-64 shadow-xl flex flex-col justify-end p-6 group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-indigo-500 to-purple-400 opacity-90"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative z-10">
                            <div className="mb-4 inline-flex items-center justify-center p-3 rounded-xl bg-white/20 backdrop-blur-md">
                                <span className="material-symbols-outlined text-white text-3xl">account_balance</span>
                            </div>
                            <h2 className="text-white text-2xl font-bold leading-tight drop-shadow-md">
                                Respuestas normativas precisas al instante
                            </h2>
                            <p className="text-white/80 text-sm mt-2 font-medium">Contabilidad y leyes bajo control.</p>
                        </div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute top-20 -left-10 w-24 h-24 bg-primary/30 rounded-full blur-2xl"></div>
                    </div>
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] px-6 py-8">
                    <div className="max-w-md mx-auto">
                        <header className="mb-8">
                            <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold leading-tight">Bienvenido de nuevo</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Ingresa tus credenciales para continuar</p>
                        </header>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Email Field */}
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold px-1">
                                    Correo electrónico
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                                    <input
                                        required
                                        type="email"
                                        placeholder="ejemplo@correo.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">
                                        Contraseña
                                    </label>
                                    <Link className="text-primary text-xs font-semibold" href="#">¿Olvidaste tu contraseña?</Link>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                    />
                                    <span
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer select-none"
                                    >
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <button
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98] disabled:opacity-60"
                            >
                                <span>{loading ? "Ingresando..." : "Ingresar"}</span>
                                <span className="material-symbols-outlined text-xl">login</span>
                            </button>

                            {/* Alternative Login */}
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">O continúa con</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <svg fill="none" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                        <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"></path>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                                    </svg>
                                    <span className="text-sm font-medium">Google</span>
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">ios</span>
                                    <span className="text-sm font-medium">Apple</span>
                                </button>
                            </div>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                ¿No tienes cuenta?
                                <Link className="text-primary font-bold ml-1 active:scale-95 transition-all inline-block" href="/registro">Regístrate gratis</Link>
                            </p>
                        </div>
                    </div>
                </div>
                {/* Footer / Safety Area */}
                <div className="h-8 bg-white dark:bg-slate-900"></div>
            </div>
        </div>
    );
}
