"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminIngesta() {
    const [file, setFile] = useState<File | null>(null);
    const [module, setModule] = useState("contabilidad");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        // Solo admins o el dueño deberían acceder
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            }
            // Aquí podrías añadir un check de rol si lo tienes configurado
        };
        checkAdmin();
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setStatus("Subiendo documento a Raw Storage...");
        setError("");

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Debes estar autenticado.");

            // 1. Subir el archivo a Supabase Storage (RAW STORAGE)
            // Debes crear un bucket llamado 'raw-docs' en tu panel de Supabase
            const fileName = `${Date.now()}_${file.name}`;
            const { data: storageData, error: storageError } = await supabase.storage
                .from('raw-docs')
                .upload(`${module}/${fileName}`, file);

            if (storageError) throw storageError;

            // 2. Insertar metadatos en la tabla public.documents
            setStatus("Registrando metadatos...");
            const { data: docData, error: docError } = await supabase
                .from('documents')
                .insert({
                    name: file.name,
                    storage_path: storageData.path,
                    module: module,
                    uploaded_by: user.id
                })
                .select()
                .single();

            if (docError) throw docError;

            setStatus("¡Documento subido con éxito! Pendiente de procesamiento por Edge Function...");
            setFile(null);

            // 3. (OPCIONAL) Disparar la Edge Function de procesamiento
            // await supabase.functions.invoke('process-document', {
            //   body: { documentId: docData.id }
            // });

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al subir el documento.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-display p-8">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ingesta de Documentos Normativos</h1>
                        <p className="text-slate-500">Alimentar la base de conocimientos RAG de Sooferline IA</p>
                    </div>
                    <Link href="/dashboard" className="text-primary font-bold text-sm">Volver</Link>
                </header>

                <form onSubmit={handleUpload} className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200 border border-slate-100 flex flex-col gap-6">
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700">Seleccionar Módulo</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['contabilidad', 'tributaria', 'laboral'].map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setModule(m)}
                                    className={`py-3 rounded-xl border-2 font-bold text-xs uppercase tracking-wider transition-all ${module === m ? "border-primary bg-primary/5 text-primary" : "border-slate-100 text-slate-400"
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700">Archivo (PDF preferiblemente)</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.txt"
                            className="w-full p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!file || loading}
                        className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? "Subiendo..." : "Iniciar Ingesta"}
                    </button>

                    {status && (
                        <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                {status}
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white">
                        <h3 className="font-bold flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-sm text-amber-400">info</span>
                            Procesamiento Automático
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Una vez subido, el sistema procesará el archivo para:
                            <br />1. Extraer el texto completo.
                            <br />2. Dividirlo en fragmentos (chunks) lógicos.
                            <br />3. Generar embeddings vectoriales con IA.
                            <br />4. Indexar en Supabase para búsqueda semántica.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
