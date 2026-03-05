"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PlanesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userPlan, setUserPlan] = useState("Básico");
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            // Get plan from profile
            const { data: profile } = await supabase
                .from("profiles")
                .select("plan")
                .eq("id", user.id)
                .maybeSingle();

            if (profile) {
                setUserPlan(profile.plan || "Básico");
            }
            setLoading(false);
        };
        fetchUser();
    }, [router]);

    const handleSelectPlan = async (plan: string) => {
        setUpdating(true);
        setStatus(`Confirmando cambio a Plan ${plan}...`);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Sesión expirada o inválida.");

            // 1. Force Upsert into Profiles table
            const { error: profileError } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    plan,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (profileError) throw profileError;

            // 2. Update Auth Metadata (to have it in session)
            const { error: authError } = await supabase.auth.updateUser({
                data: { plan: plan }
            });
            if (authError) throw authError;

            // 3. Critically force session refresh
            await supabase.auth.refreshSession();

            // Update local state
            setUserPlan(plan);
            setStatus(`¡Éxito! Plan ${plan} activado correctamente.`);

            // 4. Short delay then refresh and redirect
            setTimeout(() => {
                router.refresh();
                router.push('/dashboard');
            }, 1000);

        } catch (err: any) {
            console.error("Plan update error:", err);
            setStatus("Error: " + (err.message || "No se pudo actualizar el plan"));
        } finally {
            setUpdating(false);
        }
    };

    const plans = [
        {
            id: "Básico",
            name: "Plan Básico (Modo Informativo)",
            price: "$0",
            period: "/mes (Prueba)",
            features: [
                "1 Módulo especializado (Actual)",
                "NO puede cruzar módulos",
                "Consulta de normativa base",
                "Ver Biblioteca (Portada/Índice)",
                "Aviso de módulos adicionales"
            ],
            color: "slate",
            buttonText: "Plan Actual",
            active: userPlan === "Básico"
        },
        {
            id: "Pro",
            name: "Plan Pro (Modo Informativo y Asesor)",
            price: "$0",
            period: "/mes (Prueba)",
            features: [
                "Cruza módulos habilitados",
                "Subida de documentos / análisis",
                "Visualización de texto completo",
                "Exportar informes (TXT/PDF)",
                "Consultas ilimitadas",
                "Asesoría IA detallada"
            ],
            color: "primary",
            buttonText: "Mejorar ahora",
            popular: true,
            active: userPlan === "Pro"
        },
        {
            id: "Premium",
            name: "Plan Premium (Modo Informativo, Asesor y Estratega o Consultor)",
            price: "$0",
            period: "/mes (Prueba)",
            features: [
                "Cruce entre TODOS los módulos",
                "Descarga directa de Biblioteca",
                "Análisis estratégico avanzado",
                "Exportar formato Word/PDF Premium",
                "Comparativa entre módulos",
                "Estrategias avanzadas IA"
            ],
            color: "violet-600",
            buttonText: "Obtener Premium",
            active: userPlan === "Premium"
        }
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 overflow-x-hidden relative">
            {loading ? (
                <div className="min-h-screen bg-background-light flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {/* Background elements */}
                    <div className="fixed inset-0 pointer-events-none -z-10 opacity-40">
                        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-violet-500/10 rounded-full blur-[100px]"></div>
                    </div>

                    <nav className="flex items-center px-6 py-6 border-b border-slate-100 dark:border-slate-800 bg-white/50 backdrop-blur-md">
                        <Link href="/dashboard" className="flex items-center gap-2 group">
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">arrow_back</span>
                            <span className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">Dashboard</span>
                        </Link>
                        <div className="flex-1 text-center">
                            <h1 className="text-lg font-black tracking-tighter">SOOFERLINE <span className="text-primary italic">PLANES</span></h1>
                        </div>
                        <div className="w-20"></div>
                    </nav>

                    <main className="max-w-6xl mx-auto px-6 py-12">
                        <header className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 animate-in fade-in slide-in-from-top-4">
                                Elige tu potencia de <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent italic">Análisis IA</span>
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                                Eleva tu capacidad profesional con herramientas diseñadas para la precisión normativa y la automatización de informes.
                            </p>

                            {status && (
                                <div className={`mt-6 inline-block px-6 py-2 rounded-full text-sm font-bold animate-pulse ${status.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                    {status}
                                </div>
                            )}
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {plans.map((plan) => (
                                <div key={plan.name} className={`relative flex flex-col p-8 rounded-3xl border-2 transition-all duration-500 group ${plan.active
                                    ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10 ring-4 ring-primary/5 scale-105 z-10"
                                    : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50"
                                    }`}>
                                    {plan.popular && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg shadow-primary/20">
                                            MÁS POPULAR
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <h3 className={`text-xl font-black mb-2 ${plan.active ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                                            <span className="text-slate-400 font-bold text-sm tracking-tight">{plan.period}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-10 flex-1">
                                        {plan.features.map((feat, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <span className={`material-symbols-outlined text-[18px] mt-0.5 ${plan.active ? 'text-primary' : 'text-slate-300'}`}>
                                                    check_circle
                                                </span>
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-tight">{feat}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleSelectPlan(plan.id)}
                                        disabled={updating || plan.active}
                                        className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${plan.active
                                            ? "bg-primary/20 text-primary cursor-default"
                                            : "bg-slate-900 text-white hover:bg-primary shadow-lg shadow-slate-200 active:scale-95 disabled:opacity-50"
                                            }`}
                                    >
                                        {plan.active ? "Tu Plan Actual" : plan.buttonText}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-20 p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="max-w-xl text-center md:text-left">
                                    <h3 className="text-2xl font-black mb-2">¿Necesitas un Plan Estudiantil o para Institutos?</h3>
                                    <p className="text-slate-400 font-medium">Ofrecemos descuentos especiales para centros de formación y alumnos certificados. Obtén acceso a toda la biblioteca por un precio reducido.</p>
                                </div>
                                <Link href="mailto:info@sooferline.com" className="h-14 px-8 bg-white text-slate-900 rounded-2xl flex items-center justify-center font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                                    Consultar ahora
                                </Link>
                            </div>
                        </div>
                    </main>

                    <footer className="text-center py-12 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                            Precios en USD para etapa de lanzamiento • Sooferline IA 2024
                        </p>
                    </footer>
                </>
            )}
        </div>
    );
}
