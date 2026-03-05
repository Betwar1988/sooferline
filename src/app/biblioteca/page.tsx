"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import the custom PDF viewer component to ensure it only runs on the client
const PdfViewer = dynamic(
    () => import('@/components/PdfViewer'),
    { ssr: false, loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-400 font-bold text-xs uppercase tracking-widest">Cargando visor...</div> }
);

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// Security CSS
const securityStyles = `
    @media print { body { display: none !important; } }
    .no-screenshots { user-select: none !important; -webkit-user-select: none !important; -moz-user-select: none !important; }
    .hide-download [data-testid="toolbar__download-button"],
    .hide-download [data-testid="toolbar__print-button"],
    .hide-download [data-testid="print-button"],
    .hide-download [data-testid="download-button"],
    .hide-download button[aria-label*="Download" i],
    .hide-download button[aria-label*="Print" i],
    .hide-download button[title*="Download" i],
    .hide-download button[title*="Print" i],
    .hide-download a[aria-label*="Download" i],
    .hide-download a[title*="Download" i],
    .hide-download .rpv-core__inner-container button[aria-label*="download" i] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
    }
    .hide-download .rpv-default-layout__sidebar, .hide-download .rpv-core__sidebar { display: none !important; }
`;

function BibliotecaContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const moduleParam = searchParams.get("module");
    const docNameParam = searchParams.get("doc");
    const docIdParam = searchParams.get("id");
    const fromChat = searchParams.get("from") === "chat";

    // Data State
    const [documents, setDocuments] = useState<any[]>([]);
    const [filteredDocs, setFilteredDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userPlan, setUserPlan] = useState("Básico");
    const [selectedDoc, setSelectedDoc] = useState<any>(null);

    // UI State
    const [searchQuery, setSearchQuery] = useState("");
    const [cartCount, setCartCount] = useState(0);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                router.push("/login");
                return;
            }

            // Fetch Plan from Profile (Source of Truth)
            const { data: profile } = await supabase
                .from("profiles")
                .select("plan")
                .eq("id", user.id)
                .maybeSingle();

            // Check metadata as fallback
            const metadataPlan = user.user_metadata?.plan || "Básico";
            const currentPlan = profile?.plan || metadataPlan;
            setUserPlan(currentPlan);

            if (currentPlan === "Básico" && fromChat) {
                alert("Tu plan Básico no tiene acceso a las fuentes desde el chat. Por favor, sube de plan.");
                router.push("/planes");
                return;
            }

            // Fetch Documents
            const { data: docs } = await supabase
                .from("documents")
                .select("*")
                .order("created_at", { ascending: false });

            if (docs) {
                setDocuments(docs);
                const results = docs.filter(d =>
                    !moduleParam || d.module?.toLowerCase() === moduleParam.toLowerCase()
                );
                setFilteredDocs(results);

                // Autoselect
                if (docIdParam) {
                    const match = docs.find(d => d.id === docIdParam);
                    if (match) setSelectedDoc(match);
                } else if (docNameParam) {
                    const match = docs.find(d => d.name === docNameParam);
                    if (match) setSelectedDoc(match);
                }
            }
        } catch (err) {
            console.error("fetchUserData error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
        // Catch focus for plan updates
        const handleFocus = () => fetchUserData();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [moduleParam, docIdParam, docNameParam]);

    useEffect(() => {
        const results = documents.filter(doc => {
            const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesModule = !moduleParam || doc.module?.toLowerCase() === moduleParam.toLowerCase();
            return matchesSearch && matchesModule;
        });
        setFilteredDocs(results);
    }, [searchQuery, documents, moduleParam]);

    const isBasic = userPlan === "Básico";
    const isPro = userPlan === "Pro";
    const isPremium = userPlan === "Premium" || userPlan === "Avanzado";
    const canDownload = isPremium;


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col no-screenshots overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: securityStyles }} />

            {/* Header - Always Rendered */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sticky top-0 z-50 shadow-sm transition-colors">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                <span className="material-symbols-outlined text-primary">menu_book</span>
                                Biblioteca {moduleParam && <span className="text-primary opacity-50 capitalize">| {moduleParam}</span>}
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                Plan: <span className={isPremium ? "text-amber-500" : isPro ? "text-blue-500" : "text-slate-500"}>
                                    {userPlan} {isPremium ? "Elite" : isPro ? "Profesional" : "Básico"}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-lg relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            type="text"
                            placeholder="Buscar normativa..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm text-slate-900 dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={fetchUserData} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-all hover:text-primary">
                            <span className="material-symbols-outlined text-xl">refresh</span>
                        </button>
                        <Link href="/tienda" className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-primary hover:text-white transition-all group">
                            <span className="material-symbols-outlined text-xl">shopping_cart</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">{cartCount}</span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-4"></div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cargando biblioteca...</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 animate-pulse">Sincronizando permisos por suscripción</p>
                </div>
            ) : (
                <main className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24 h-[calc(100vh-100px)] overflow-hidden">
                    {/* List Column */}
                    <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Módulo: {moduleParam || "Todos"}</h2>
                        {filteredDocs.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
                                <p className="text-sm text-slate-400">No hay documentos disponibles.</p>
                            </div>
                        ) : (
                            filteredDocs.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={() => setSelectedDoc(doc)}
                                    className={`group p-4 rounded-2xl border transition-all cursor-pointer ${selectedDoc?.id === doc.id
                                        ? "bg-primary border-primary shadow-lg shadow-primary/20 translate-x-1"
                                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/50 shadow-sm"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${selectedDoc?.id === doc.id ? "bg-white/20 text-white" : "bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:text-primary"}`}>
                                            <span className="material-symbols-outlined">description</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-sm font-bold truncate ${selectedDoc?.id === doc.id ? "text-white" : "text-slate-800 dark:text-white"}`}>{doc.name}</h3>
                                            <p className={`text-[10px] mt-0.5 uppercase font-bold tracking-wider ${selectedDoc?.id === doc.id ? "text-white/60" : "text-slate-400"}`}>
                                                {doc.module} • {doc.required_plan}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Content Column */}
                    <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col relative h-full">
                        {!selectedDoc ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 dark:bg-slate-900/10">
                                <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-4xl text-primary opacity-30 animate-pulse">menu_book</span>
                                </div>
                                <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Selecciona una normativa</h3>
                                <p className="text-slate-400 text-xs">Escoge un documento de la lista para visualizar su contenido.</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="material-symbols-outlined text-primary text-sm">description</span>
                                        <span className="text-sm font-black truncate text-slate-800 dark:text-white">{selectedDoc.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {canDownload ? (
                                            <button className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20">
                                                <span className="material-symbols-outlined text-sm">download</span>
                                                Bajar PDF
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => router.push(`/tienda?bookId=${selectedDoc.id}`)}
                                                className="bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-amber-600 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
                                            >
                                                <span className="material-symbols-outlined text-sm">shopping_cart</span>
                                                Comprar Acceso
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 relative bg-slate-100">
                                    <div className={`h-full w-full ${!canDownload ? "hide-download" : ""}`}>
                                        {isBasic && (
                                            <div className="absolute top-4 right-4 z-[100]">
                                                <div className="bg-amber-50/95 text-amber-700 px-3 py-2 rounded-xl border border-amber-100 text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 backdrop-blur-md">
                                                    <span className="material-symbols-outlined text-sm text-amber-500 fill-1">lock_open</span>
                                                    Muestra Gratuita (2 pág)
                                                </div>
                                            </div>
                                        )}
                                        <PdfViewer
                                            key={`${selectedDoc.id}-${userPlan}`}
                                            fileUrl={supabase.storage.from('raw-docs').getPublicUrl(selectedDoc.storage_path).data.publicUrl}
                                            maxPages={isBasic ? 2 : undefined}
                                        />
                                    </div>
                                </div>

                                <div className={`p-3 ${isPremium ? 'bg-primary/10 text-primary' : 'bg-slate-900 text-white'} flex items-center justify-between border-t border-slate-200 dark:border-slate-700`}>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">verified</span>
                                        <p className="text-[9px] font-black uppercase tracking-widest">
                                            {isPremium ? "Acceso Elite: Documento completo con descarga habilitada" :
                                                isPro ? "Modo Asesor: Lectura total habilitada. Descarga bloqueada." :
                                                    "Modo Informativo: Solo Portada e Índice habilitados."}
                                        </p>
                                    </div>
                                    {!isPremium && (
                                        <Link href="/planes" className="text-[9px] font-black bg-primary text-white px-3 py-1.5 rounded-lg hover:scale-105 transition-all">
                                            MEJORAR ACCESO
                                        </Link>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            )}

            {/* Navigation - Always Rendered */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-2 pb-6 pt-2 z-50 shadow-2xl transition-colors">
                <div className="max-w-md mx-auto flex justify-around items-center">
                    <Link href="/dashboard" className="flex flex-col items-center gap-1 text-slate-400 group">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">dashboard</span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Inicio</span>
                    </Link>
                    <Link href="/chat" className="flex flex-col items-center gap-1 text-slate-400 group">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">chat_bubble</span>
                        <span className="text-[10px] font-medium uppercase tracking-tighter">Chat</span>
                    </Link>
                    <div className="relative -top-6">
                        <Link href="/tienda" className="size-14 bg-primary text-white rounded-full shadow-xl shadow-primary/40 flex items-center justify-center border-4 border-white dark:border-slate-900 active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                        </Link>
                    </div>
                    <Link href="/biblioteca" className="flex flex-col items-center gap-1 text-primary">
                        <span className="material-symbols-outlined fill-1">menu_book</span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Normas</span>
                    </Link>
                    <Link href="/perfil" className="flex flex-col items-center gap-1 text-slate-400 group">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">person</span>
                        <span className="text-[10px] font-medium uppercase tracking-tighter">Perfil</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
}

export default function BibliotecaPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-slate-900 mb-2 tracking-tighter">Iniciando aplicación móvil...</h2>
            </div>
        }>
            <BibliotecaContent />
        </Suspense>
    );
}
