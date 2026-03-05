"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";

function BibliotecaComprasContent() {
    const [purchases, setPurchases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [productFiles, setProductFiles] = useState<Record<string, any[]>>({});
    const router = useRouter();

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push("/auth?redirect=/mis-compras");
            return;
        }

        const { data, error } = await supabase
            .from("user_purchases")
            .select(`
                id,
                created_at,
                product:products (id, title, image_url, type, version, metadata, file_url, long_description, requirements)
            `)
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error obteniendo compras:", error);
        } else if (data) {
            const formatted = data.map((item: any) => ({
                purchase_id: item.id,
                date: new Date(item.created_at).toLocaleDateString("es-CL"),
                product: item.product
            }));
            setPurchases(formatted);
        }

        setLoading(false);
    };

    const fetchProductFiles = async (productId: string) => {
        const { data } = await supabase
            .from("product_files")
            .select("*")
            .eq("product_id", productId);
        return data || [];
    };

    const handleView = (product: any) => {
        if (product.metadata && product.metadata.book_id) {
            router.push(`/biblioteca?doc=${encodeURIComponent(product.title)}&id=${product.metadata.book_id}`);
        } else if (product.file_url) {
            window.open(product.file_url, '_blank');
        } else {
            alert("Este recurso está siendo preparado para su visualización online.");
        }
    };

    const handleDownload = async (product: any, purchaseId?: string) => {
        console.log("handleDownload - product:", product);
        console.log("handleDownload - purchaseId:", purchaseId);
        
        if (purchaseId) {
            const files = await fetchProductFiles(product.id);
            console.log("Archivos encontrados:", files);
            
            if (files && files.length > 0) {
                files.forEach((file: any) => {
                    handleFileDownload(file.file_url, file.name);
                });
                return;
            }
        }
        
        if (product && product.file_url) {
            console.log("Intentando descargar desde file_url:", product.file_url);
            const fileName = product.file_url.split('/').pop() || `${product.title}.pdf`;
            const link = document.createElement("a");
            link.href = product.file_url;
            link.target = "_blank";
            link.download = fileName;
            link.rel = "noopener noreferrer";
            document.body.appendChild(link);
            link.click();
            setTimeout(() => document.body.removeChild(link), 100);
        } else {
            console.log("No hay file_url ni archivos en product_files");
            alert("Este recurso solo está disponible para ver online.");
        }
    };

    const toggleExpand = async (purchaseId: string, productId: string) => {
        if (expandedCard === purchaseId) {
            setExpandedCard(null);
        } else {
            setExpandedCard(purchaseId);
            if (!productFiles[purchaseId]) {
                const files = await fetchProductFiles(productId);
                setProductFiles(prev => ({ ...prev, [purchaseId]: files }));
            }
        }
    };

    const handleFileDownload = (fileUrl: string, fileName: string) => {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.target = "_blank";
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-display">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-10 text-center md:text-left">
                    <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                        <span className="material-symbols-outlined text-primary text-3xl">local_library</span>
                        <p className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Archivos Personales</p>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">Mi Biblioteca</h1>
                    <p className="text-slate-500 font-medium">Aquí encontrarás todos los cursos, plantillas y herramientas que has adquirido.</p>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <div className="size-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="font-black uppercase tracking-widest text-xs text-slate-400">Cargando tus recursos...</p>
                    </div>
                ) : purchases.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">folder_off</span>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Aún no hay compras</h3>
                        <p className="text-slate-500 mb-6">Explora nuestra tienda para adquirir conocimientos y herramientas increíbles.</p>
                        <Link href="/tienda" className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all inline-block">
                            Ir a la Tienda
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {purchases.map((item) => {
                            const p = Array.isArray(item.product) ? item.product[0] : item.product;
                            if (!p) return null;

                            return (
                                <div key={item.purchase_id} className={`bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col transition-all group ${expandedCard === item.purchase_id ? 'ring-2 ring-primary' : 'hover:border-primary/30'}`}>
                                    <div className="p-6">
                                        <div className="flex gap-4 mb-4">
                                            <img src={p.image_url} alt={p.title} className="size-20 bg-slate-100 rounded-xl object-cover" />
                                            <div className="flex-1">
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-bold inline-block mb-1">{p.type}</span>
                                                <h3 className="font-bold text-slate-800 leading-tight line-clamp-2" title={p.title}>{p.title}</h3>
                                                <p className="text-[10px] text-slate-400 mt-1 font-bold">Comprado: {item.date}</p>
                                            </div>
                                        </div>

                                        <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                                            <button
                                                onClick={() => handleView(p)}
                                                className="flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors font-bold text-[10px] uppercase tracking-widest"
                                            >
                                                <span className="material-symbols-outlined text-sm">visibility</span> Ver
                                            </button>
                                            <button
                                                onClick={() => handleDownload(p, item.purchase_id)}
                                                className="flex items-center justify-center gap-2 py-3 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-xl transition-colors font-bold text-[10px] uppercase tracking-widest"
                                            >
                                                <span className="material-symbols-outlined text-sm">cloud_download</span> Descargar
                                            </button>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => toggleExpand(item.purchase_id, p.id)}
                                        className="w-full mt-3 py-2 text-center text-xs font-bold text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-1"
                                    >
                                        {expandedCard === item.purchase_id ? (
                                            <>Ver menos <span className="material-symbols-outlined text-sm">expand_less</span></>
                                        ) : (
                                            <>Ver más <span className="material-symbols-outlined text-sm">expand_more</span></>
                                        )}
                                    </button>

                                    {expandedCard === item.purchase_id && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                                            {p.long_description && (
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Descripción</h4>
                                                    <p className="text-xs text-slate-600 line-clamp-3">{p.long_description}</p>
                                                </div>
                                            )}
                                            
                                            {p.requirements && (
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Requisitos</h4>
                                                    <p className="text-xs text-slate-600">{p.requirements}</p>
                                                </div>
                                            )}

                                            {productFiles[item.purchase_id] && productFiles[item.purchase_id].length > 0 && (
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Archivos Incluidos</h4>
                                                    <div className="space-y-2">
                                                        {productFiles[item.purchase_id].map((file: any) => (
                                                            <div key={file.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-slate-400 text-sm">
                                                                        {file.file_type === 'video' ? 'movie' : file.file_type === 'pdf' ? 'picture_as_pdf' : 'insert_drive_file'}
                                                                    </span>
                                                                    <span className="text-xs font-medium">{file.name}</span>
                                                                </div>
                                                                <button 
                                                                    onClick={() => handleFileDownload(file.file_url, file.name)}
                                                                    className="text-primary hover:text-primary/70"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">download</span>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function MiBibliotecaPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Cargando...</div>}>
            <BibliotecaComprasContent />
        </Suspense>
    );
}
