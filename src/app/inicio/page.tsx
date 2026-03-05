"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden">
            <header className="fixed top-0 z-50 w-full p-2 md:p-4">
                <nav className="mx-auto max-w-7xl rounded-2xl border border-white/40 bg-white/70 shadow-lg backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/80 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100/50 dark:border-slate-800/50">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                            </div>
                            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Sooferline</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors hidden sm:block" href="/registro">Registro</Link>
                            <Link className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:bg-primary/90 active:scale-95 inline-flex items-center justify-center" href="/login">
                                Inicio de Sesión
                            </Link>
                            <Link className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/50 text-slate-600 shadow-sm transition-all hover:bg-white hover:text-primary dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white active:scale-90" href="/login">
                                <span className="material-symbols-outlined text-[20px]">account_circle</span>
                            </Link>
                        </div>
                    </div>
                    <div className="no-scrollbar flex items-center gap-6 overflow-x-auto px-4 py-2.5">
                        <Link className="whitespace-nowrap text-[13px] font-semibold text-primary" href="/inicio">Inicio</Link>
                        <Link className="whitespace-nowrap text-[13px] font-semibold text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white" href="/alertas">Alertas</Link>
                        <Link className="whitespace-nowrap text-[13px] font-semibold text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white" href="/profesionales">Marketplace Profesional</Link>
                        <Link className="whitespace-nowrap text-[13px] font-semibold text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white" href="/tienda">Tienda</Link>
                        <Link className="whitespace-nowrap text-[13px] font-semibold text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white" href="/biblioteca">Biblioteca</Link>
                        <Link className="whitespace-nowrap text-[13px] font-semibold text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white" href="/planes">Planes</Link>
                    </div>
                </nav>
            </header>

            <main className="relative px-4 pt-44 pb-20 overflow-hidden">
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-[120px]"></div>
                <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]"></div>

                <div className="relative mx-auto max-w-4xl text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        IA respaldada por Profesionales
                    </div>
                    <h1 className="mb-6 text-3xl font-black leading-[1.2] tracking-tight text-slate-900 dark:text-white md:text-6xl">
                        La Plataforma de IA Normativa + Consultoría Profesional que Potencia tu Gestión Empresarial
                    </h1>
                    <p className="mb-10 text-base leading-relaxed text-slate-600 dark:text-slate-400 md:text-lg md:px-12">
                        Impulsada por Inteligencia Artificial, cita fuentes oficiales, interpreta normativa vigente y te ayuda a tomar decisiones informadas en segundos. Un ecosistema unificado que combina eficiencia, precisión y criterio experto en cualquier ámbito que tu organización necesite.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link className="flex h-14 w-full sm:w-auto min-w-[200px] items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-bold text-white shadow-xl shadow-primary/25 transition-all hover:scale-105 active:scale-95" href="/registro">
                            Comenzar gratis
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                        <Link className="flex h-14 w-full sm:w-auto min-w-[200px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 text-base font-bold text-slate-900 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800" href="/login">
                            ¿Ya tienes cuenta? Ingresa
                        </Link>
                    </div>
                </div>

                <div className="mx-auto mt-20 max-w-5xl rounded-2xl border border-white/40 bg-white/40 p-6 md:p-8 shadow-sm backdrop-blur-sm dark:border-slate-800/40 dark:bg-slate-900/40">
                    <p className="mb-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Información basada en
                    </p>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="flex flex-col items-center justify-center gap-3 transition-all hover:scale-105">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 shadow-inner">
                                <span className="material-symbols-outlined text-primary text-2xl">account_balance</span>
                            </div>
                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 text-center">Biblioteca Normativa</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-3 transition-all hover:scale-105">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 shadow-inner">
                                <span className="material-symbols-outlined text-primary text-2xl">notifications_active</span>
                            </div>
                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 text-center">Alertas en Tiempo Real</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-3 transition-all hover:scale-105">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 shadow-inner">
                                <span className="material-symbols-outlined text-primary text-2xl">workspace_premium</span>
                            </div>
                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 text-center">Criterio Profesional Certificado</span>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-100 dark:border-slate-800 py-12 px-4">
                <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                            <span className="material-symbols-outlined text-xl">auto_awesome</span>
                        </div>
                        <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white">Sooferline IA</span>
                    </div>
                    <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-primary transition-colors">Términos</a>
                        <a href="#" className="hover:text-primary transition-colors">Contacto</a>
                    </div>
                    <p className="text-xs text-slate-400">© 2024 Sooferline IA. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
