"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: { name: string; page?: number }[];
}

function ChatContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const moduleParam = searchParams.get("module") || "contabilidad";

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: `Hola. Soy tu asistente de IA especializado en normativa de **${moduleParam.charAt(0).toUpperCase() + moduleParam.slice(1)}**. ¿En qué puedo ayudarte hoy?`,
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [userPlan, setUserPlan] = useState("Básico");
    const [showExportWizard, setShowExportWizard] = useState(false);
    const [showAnalysisWizard, setShowAnalysisWizard] = useState(false);
    const [exportStep, setExportStep] = useState(1);
    const [analysisStep, setAnalysisStep] = useState(1);
    const [exportFormat, setExportFormat] = useState<"pdf" | "word" | "txt">("pdf");
    const [userProfile, setUserProfile] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch Plan
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .maybeSingle();
                if (profile) {
                    setUserPlan(profile.plan || "Básico");
                    setUserProfile(profile);
                }

                // Fetch History
                const { data: logs } = await supabase
                    .from("query_logs")
                    .select("*")
                    .eq("user_id", user.id)
                    .eq("module_id", moduleParam)
                    .order("created_at", { ascending: false })
                    .limit(10);
                if (logs) setHistory(logs);
            }
        };
        fetchData();
    }, [moduleParam]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setLoading(true);

        try {
            const apiKey = "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";

            // 1. INTENT CLASSIFIER (Router Multi-Label)
            const classifierResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: `Actúa como un router clasificador de intenciones. Analiza la consulta y asigna una probabilidad (0.0 a 1.0) a cada módulo: contabilidad, laboral, tributaria, auditoria.
                            Devuelve ÚNICAMENTE un objeto JSON. Ejemplo: { "contabilidad": 0.9, "tributaria": 0.1 }`
                        },
                        { role: "user", content: currentInput }
                    ],
                    response_format: { type: "json_object" }
                })
            });
            const classData = await classifierResponse.json();
            const scores = JSON.parse(classData.choices[0].message.content);

            const activeModules = Object.entries(scores)
                .filter(([_, s]: any) => s >= 0.3)
                .map(([m]) => m);

            const isCrossing = activeModules.length > 1;

            const isBasic = userPlan.includes("Básico") || userPlan === "Básico";
            const isCrossingBlocked = isBasic && isCrossing;

            if (isCrossingBlocked) {
                const assistantMessage: Message = {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: `⚠️ **Esta consulta involucra módulos adicionales no incluidos en tu plan.**\n\nDetectamos que tu pregunta requiere conocimientos de: **${activeModules.join(", ")}**. \n\nTu **Plan Básico (Modo Informativo)** está limitado a consultas de un solo módulo a la vez. Para que la IA cruce normativas y te brinde una estrategia integral, por favor sube a un plan **Pro** o **Premium**.`
                };
                setMessages(prev => [...prev, assistantMessage]);
                setLoading(false);
                return;
            }

            const systemPrompt = `Eres Sooferline IA. 
            CONTEXTO: Módulo actual: ${moduleParam}. Plan: ${userPlan}. 
            REGLAS DE RESPUESTA:
            - Si el plan es Básico (Modo Informativo): Solo responde sobre ${moduleParam}.
            - Si el plan es Pro (Modo Asesor): Cruza información entre los módulos detectados (${activeModules.join(", ")}) solo si son relevantes.
            - Si el plan es Premium (Modo Estratega): Eres un consultor experto. Cruza TODA la normativa necesaria (${activeModules.join(", ")}) para dar una solución comparativa y estratégica.
            - Responde de forma profesional, clara y directa.`;

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: currentInput }
                    ],
                    temperature: 0.6,
                })
            });

            const data = await response.json();
            const content = data.choices[0]?.message?.content || "Lo siento, hubo un problema.";

            const finalSources = activeModules.length > 0
                ? activeModules.map(m => ({ name: m.charAt(0).toUpperCase() + m.slice(1) }))
                : [{ name: moduleParam.charAt(0).toUpperCase() + moduleParam.slice(1) }];

            const assistantMessage: Message = {
                id: Date.now().toString(),
                role: "assistant",
                content: content,
                sources: finalSources
            };

            setMessages(prev => [...prev, assistantMessage]);
            setLoading(false);

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from("query_logs").insert({
                    user_id: user.id,
                    query: currentInput,
                    response: content,
                    module_id: moduleParam,
                    plan_at_time: userPlan
                });
                setHistory(prev => [{ query: currentInput, created_at: new Date().toISOString() }, ...prev.slice(0, 9)]);
            }

        } catch (error) {
            console.error("Chat error:", error);
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark font-display overflow-hidden">
            <aside className="hidden md:flex w-72 flex-col bg-white/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 backdrop-blur-xl">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="bg-primary size-8 rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">Assistant IA</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-900 dark:text-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Historial Reciente</div>
                    {history.length > 0 ? history.map((h, i) => (
                        <button key={i} onClick={() => setInput(h.query)} className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm font-medium text-slate-600 dark:text-slate-400 truncate">{h.query}</button>
                    )) : (
                        <p className="px-2 text-[10px] text-slate-400 font-bold italic uppercase tracking-wider">No hay consultas previas</p>
                    )}
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <Link href="/dashboard" className="flex items-center gap-2 p-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">dashboard</span>
                        Volver al Dashboard
                    </Link>
                </div>
            </aside>

            <main className="flex-1 flex flex-col relative">
                <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="md:hidden size-8 flex items-center justify-center">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Módulo: {moduleParam}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">IA Activa y Precisando fuentes</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowExportWizard(true)} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all transform active:scale-95 shadow-sm">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Exportar Informe
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col items-center">
                    <div className="w-full max-w-3xl space-y-6 pb-32">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 md:p-5 shadow-sm ${msg.role === "user" ? "bg-primary text-white" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200"}`}>
                                    <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                                            <p className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest">Fuentes Consultadas:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {msg.sources.map((s, i) => {
                                                    const isBasicPlan = userPlan === "Básico" || userPlan.toLowerCase().includes("basico");
                                                    return (
                                                        <button key={i} onClick={() => {
                                                            if (isBasicPlan) alert("⚠️ Tu acceso a las fuentes está bloqueado en el Plan Básico.");
                                                            else router.push(`/biblioteca?module=${moduleParam}&doc=${encodeURIComponent(s.name)}&from=chat`);
                                                        }} className={`px-2 py-1 rounded-md border flex items-center gap-1.5 transition-all ${!isBasicPlan ? "bg-primary/5 dark:bg-primary/20 border-primary/10 hover:bg-primary hover:text-white group" : "bg-slate-50 border-slate-100 text-slate-400 opacity-60"}`}>
                                                            <span className={`material-symbols-outlined text-[12px] ${!isBasicPlan ? "group-hover:text-white text-primary" : "text-slate-400"}`}>{isBasicPlan ? "lock" : "description"}</span>
                                                            <span className="text-[10px] font-bold truncate max-w-[120px]">{s.name}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">IA Analizando...</div>}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="p-4 md:p-8 flex justify-center">
                    <form onSubmit={handleSend} className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 flex items-center gap-2">
                        <button type="button" onClick={() => userPlan !== "Básico" && setShowAnalysisWizard(true)} disabled={userPlan === "Básico"} className="p-3 text-slate-400 hover:text-primary disabled:opacity-30"><span className="material-symbols-outlined">attach_file</span></button>
                        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Haz tu consulta normativa aquí..." className="flex-1 bg-transparent border-none outline-none px-2 text-base" />
                        <button type="submit" disabled={!input.trim() || loading} className="size-12 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center transition-all"><span className="material-symbols-outlined">send</span></button>
                    </form>
                </div>
            </main>

            {showExportWizard && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowExportWizard(false)}></div>
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-xl font-black mb-4">Exportar Informe ({exportStep}/3)</h2>
                        {exportStep === 1 && (
                            <div className="space-y-3">
                                <button onClick={() => { setExportFormat("pdf"); setExportStep(2); }} className="w-full p-4 rounded-xl border-2 hover:border-primary text-left font-bold">PDF Premium</button>
                                <button onClick={() => { setExportFormat("txt"); setExportStep(2); }} className="w-full p-4 rounded-xl border-2 hover:border-primary text-left font-bold">Texto Plano (.txt)</button>
                            </div>
                        )}
                        {exportStep === 2 && (
                            <div className="space-y-4">
                                <div className="font-bold">Personaliza tu informe...</div>
                                <button onClick={() => setExportStep(3)} className="w-full py-4 bg-primary text-white rounded-xl font-bold">Siguiente</button>
                                <button onClick={() => setExportStep(1)} className="w-full py-4 border rounded-xl font-bold">Atrás</button>
                            </div>
                        )}
                        {exportStep === 3 && (
                            <div className="text-center">
                                <button onClick={() => {
                                    const reportText = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join("\n\n");
                                    const blob = new Blob([reportText], { type: 'text/plain' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `Informe_${moduleParam}.txt`;
                                    a.click();
                                    setShowExportWizard(false);
                                    setExportStep(1);
                                }} className="w-full py-4 bg-primary text-white rounded-xl font-bold">Generar y Descargar</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showAnalysisWizard && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowAnalysisWizard(false)}></div>
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl text-center">
                        <span className="material-symbols-outlined text-4xl text-primary mb-4">upload_file</span>
                        <h2 className="text-xl font-black mb-2">Análisis de Documentos</h2>
                        <p className="text-sm text-slate-500 mb-6">Sube tu archivo para compararlo con la normativa vigente.</p>
                        <button onClick={() => setShowAnalysisWizard(false)} className="w-full py-4 bg-primary text-white rounded-xl font-bold">Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>}>
            <ChatContent />
        </Suspense>
    );
}
