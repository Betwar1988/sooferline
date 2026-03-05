"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            // Get the hash or query params if any
            const url = new URL(window.location.href);
            const code = url.searchParams.get("code");

            if (code) {
                // Exchange the temporary code for an actual session
                await supabase.auth.exchangeCodeForSession(code);
            }

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Check if we have a session in local storage
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push("/login");
                    return;
                }
            }

            // User is authenticated, check metadata for redirect
            const perfil = user?.user_metadata?.perfil_profesional;
            const modulo = user?.user_metadata?.modulo_seleccionado;

            if (!perfil) {
                router.push("/auth/completar-perfil");
            } else if (!modulo) {
                router.push("/auth/seleccionar-modulo");
            } else {
                router.push("/dashboard");
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen bg-background-light font-display flex items-center justify-center">
            <div className="text-center">
                <div className="bg-primary/10 p-4 rounded-2xl inline-flex mb-4">
                    <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
                </div>
                <p className="text-slate-600 font-medium">Procesando autenticación...</p>
            </div>
        </div>
    );
}
