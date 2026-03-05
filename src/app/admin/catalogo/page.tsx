"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CatalogAdmin() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [editingProduct, setEditingProduct] = useState<any>(null);

    // Form state - Basics
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState("");
    const [visibility, setVisibility] = useState("public");
    const [version, setVersion] = useState("1.0");
    const [stock, setStock] = useState("");
    const [moduleConfig, setModuleConfig] = useState("Ninguno");
    const [tags, setTags] = useState("");

    // Media
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [resourceFile, setResourceFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState("");
    const [fileUrl, setFileUrl] = useState("");

    // Details
    const [desc, setDesc] = useState(""); // short description
    const [longDesc, setLongDesc] = useState("");
    const [requirements, setRequirements] = useState("");
    const [changelog, setChangelog] = useState("");
    const [bookId, setBookId] = useState("");

    // Categories & Types state
    const [categories, setCategories] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newTypeName, setNewTypeName] = useState("");

    // New fields
    const [sortOrder, setSortOrder] = useState(0);
    const [originalPrice, setOriginalPrice] = useState("");

    // Multi-files state
    const [productFiles, setProductFiles] = useState<any[]>([]);
    const [newFileName, setNewFileName] = useState("");
    const [newFileType, setNewFileType] = useState("main");
    const [newFileUrl, setNewFileUrl] = useState("");
    const [newFileUpload, setNewFileUpload] = useState<File | null>(null);

    // Related products state
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [selectedRelated, setSelectedRelated] = useState<string[]>([]);

    const router = useRouter();

    useEffect(() => {
        fetchProducts();
        fetchCategoriesAndTypes();
    }, []);

    const fetchCategoriesAndTypes = async () => {
        const [catData, typeData] = await Promise.all([
            supabase.from("product_categories").select("*").order("name"),
            supabase.from("product_types").select("*").order("name")
        ]);

        if (catData.data) {
            setCategories(catData.data);
            if (catData.data.length > 0 && !category) setCategory(catData.data[0].name);
        }
        if (typeData.data) {
            setTypes(typeData.data);
            if (typeData.data.length > 0 && !type) setType(typeData.data[0].name);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        const { error } = await supabase.from("product_categories").insert({ name: newCategoryName.trim() });
        if (error) alert("Error: " + error.message);
        else { setNewCategoryName(""); fetchCategoriesAndTypes(); }
    };

    const handleCreateType = async () => {
        if (!newTypeName.trim()) return;
        const { error } = await supabase.from("product_types").insert({ name: newTypeName.trim() });
        if (error) alert("Error: " + error.message);
        else { setNewTypeName(""); fetchCategoriesAndTypes(); }
    };

    const handleEditCategory = async () => {
        if (!category) return;
        const newName = prompt("Editar nombre de la categoría:", category);
        if (!newName || newName === category) return;
        const { error } = await supabase.from("product_categories").update({ name: newName.trim() }).eq("name", category);
        if (error) alert("Error: " + error.message);
        else fetchCategoriesAndTypes();
    };

    const handleEditType = async () => {
        if (!type) return;
        const newName = prompt("Editar nombre del tipo:", type);
        if (!newName || newName === type) return;
        const { error } = await supabase.from("product_types").update({ name: newName.trim() }).eq("name", type);
        if (error) alert("Error: " + error.message);
        else fetchCategoriesAndTypes();
    };

    const fetchProducts = async () => {
        setFetching(true);
        const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
        if (data) setProducts(data);
        setFetching(false);
    };

    const fetchProductRelations = async (productId: string) => {
        const { data } = await supabase
            .from("product_relations")
            .select("related_product_id, products(id, title, image_url)")
            .eq("product_id", productId);
        
        if (data) {
            setRelatedProducts(data.map((r: any) => r.products).filter(Boolean));
            setSelectedRelated(data.map((r: any) => r.related_product_id));
        }
    };

    const fetchProductFiles = async (productId: string) => {
        const { data } = await supabase
            .from("product_files")
            .select("*")
            .eq("product_id", productId)
            .order("created_at", { ascending: false });
        
        if (data) setProductFiles(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalImageUrl = editingProduct ? editingProduct.image_url : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300";

            if (imageFile) {
                const fileName = `${Date.now()}_${imageFile.name}`;
                const { error: uploadError } = await supabase.storage.from("product-images").upload(`products/${fileName}`, imageFile);
                if (uploadError) throw uploadError;
                finalImageUrl = supabase.storage.from("product-images").getPublicUrl(`products/${fileName}`).data.publicUrl;
            }

            let finalFileUrl = fileUrl;
            if (resourceFile) {
                const fileName = `${Date.now()}_${resourceFile.name}`;
                const { error: uploadError } = await supabase.storage.from("product-files").upload(`resources/${fileName}`, resourceFile);
                if (uploadError) throw uploadError;
                finalFileUrl = supabase.storage.from("product-files").getPublicUrl(`resources/${fileName}`).data.publicUrl;
            }

            const finalData = {
                title,
                price: parseFloat(price),
                category,
                type,
                image_url: finalImageUrl,
                description: desc,
                long_description: longDesc,
                video_url: videoUrl,
                visibility,
                version,
                stock: stock ? parseInt(stock) : null,
                module: moduleConfig === "Ninguno" ? null : moduleConfig,
                tags: tags.split(",").map(t => t.trim()).filter(t => t),
                requirements,
                changelog,
                file_url: finalFileUrl,
                metadata: bookId ? { book_id: bookId } : {},
                sort_order: sortOrder,
                original_price: originalPrice ? parseFloat(originalPrice) : null,
                last_updated: new Date().toISOString()
            };

            if (editingProduct) {
                const { error } = await supabase.from("products").update(finalData).eq("id", editingProduct.id);
                if (error) throw error;
                alert("Producto actualizado con éxito");
            } else {
                const { error } = await supabase.from("products").insert(finalData);
                if (error) throw error;
                alert("Producto agregado con éxito");
            }

            resetForm();
            fetchProducts();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle(""); setPrice(""); setDesc(""); setLongDesc("");
        setVideoUrl(""); setFileUrl(""); setTags(""); setRequirements(""); setChangelog("");
        setStock(""); setBookId(""); setImageFile(null); setResourceFile(null); setEditingProduct(null);
        setFeatured(false); setSortOrder(0); setOriginalPrice("");
        setProductFiles([]); setRelatedProducts([]); setSelectedRelated([]);
    };

    const startEditing = async (p: any) => {
        setEditingProduct(p);
        setTitle(p.title);
        setPrice(p.price.toString());
        setCategory(p.category);
        setType(p.type);
        setVisibility(p.visibility || "public");
        setVersion(p.version || "1.0");
        setStock(p.stock !== null ? p.stock.toString() : "");
        setModuleConfig(p.module || "Ninguno");
        setTags(p.tags ? p.tags.join(", ") : "");
        setDesc(p.description || "");
        setLongDesc(p.long_description || "");
        setRequirements(p.requirements || "");
        setChangelog(p.changelog || "");
        setBookId(p.metadata?.book_id || "");
        setVideoUrl(p.video_url || "");
        setFileUrl(p.file_url || "");
        setSortOrder(p.sort_order || 0);
        setOriginalPrice(p.original_price ? p.original_price.toString() : "");

        // Load related products and files
        await Promise.all([
            fetchProductRelations(p.id),
            fetchProductFiles(p.id)
        ]);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteProduct = async (id: string) => {
        if (!confirm("¿Eliminar este producto y todas sus relaciones?")) return;
        await supabase.from("products").delete().eq("id", id);
        fetchProducts();
    };

    const handleAddFile = async () => {
        if (!editingProduct || (!newFileUrl && !newFileUpload)) return;

        let finalFileUrl = newFileUrl;
        if (newFileUpload) {
            const fileName = `${Date.now()}_${newFileUpload.name}`;
            const { error: uploadError } = await supabase.storage.from("product-files").upload(`files/${fileName}`, newFileUpload);
            if (uploadError) { alert("Error uploading: " + uploadError.message); return; }
            finalFileUrl = supabase.storage.from("product-files").getPublicUrl(`files/${fileName}`).data.publicUrl;
        }

        const { error } = await supabase.from("product_files").insert({
            product_id: editingProduct.id,
            name: newFileName || "Archivo",
            file_type: newFileType,
            file_url: finalFileUrl
        });

        if (!error) {
            setNewFileName(""); setNewFileUrl(""); setNewFileUpload(null);
            fetchProductFiles(editingProduct.id);
        }
    };

    const handleDeleteFile = async (fileId: string) => {
        await supabase.from("product_files").delete().eq("id", fileId);
        if (editingProduct) fetchProductFiles(editingProduct.id);
    };

    const handleAddRelated = async (relatedId: string) => {
        if (!editingProduct || selectedRelated.includes(relatedId)) return;
        await supabase.from("product_relations").insert({
            product_id: editingProduct.id,
            related_product_id: relatedId
        });
        setSelectedRelated([...selectedRelated, relatedId]);
        fetchProductRelations(editingProduct.id);
    };

    const handleRemoveRelated = async (relatedId: string) => {
        if (!editingProduct) return;
        await supabase.from("product_relations").delete()
            .eq("product_id", editingProduct.id)
            .eq("related_product_id", relatedId);
        setSelectedRelated(selectedRelated.filter(id => id !== relatedId));
        fetchProductRelations(editingProduct.id);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-display">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión Avanzada de Catálogo</h1>
                        <p className="text-slate-500">Administra productos, versiones, visibilidad y stock</p>
                    </div>
                    <Link href="/dashboard" className="px-6 py-2 bg-white rounded-xl shadow-sm font-bold text-sm border border-slate-200">Volver</Link>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Formulario */}
                    <div className="xl:col-span-1">
                        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] shadow-xl shadow-slate-200 border border-slate-100 h-full overflow-y-auto max-h-[800px] custom-scrollbar">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 sticky top-0 bg-white z-10 py-2 border-b border-slate-100">
                                <span className="material-symbols-outlined text-primary">{editingProduct ? 'edit' : 'add_circle'}</span>
                                {editingProduct ? 'Editar Producto' : 'Nuevo Producto Premium'}
                            </h2>

                            <div className="space-y-6">
                                {/* Info Principal */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">info</span> Info Básica
                                    </h3>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Título</label>
                                        <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Ej: Curso de Auditoría v2" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Precio (CLP)</label>
                                            <input type="number" value={price} onChange={e => setPrice(e.target.value)} required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" placeholder="0" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Stock (opcional)</label>
                                            <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Ilimitado" />
                                        </div>
                                    </div>
                                </div>

                                {/* Clasificación */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">category</span> Clasificación
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Categoría</label>
                                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm mb-2">
                                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                            </select>
                                            <div className="flex gap-2">
                                                <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs" placeholder="Nueva..." />
                                                <button type="button" onClick={handleCreateCategory} className="px-2 py-1 bg-slate-200 rounded text-xs font-bold">Add</button>
                                                <button type="button" onClick={handleEditCategory} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs" title="Editar"><span className="material-symbols-outlined text-[10px]">edit</span></button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tipo de Producto</label>
                                            <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm mb-2">
                                                {types.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                            </select>
                                            <div className="flex gap-2">
                                                <input value={newTypeName} onChange={e => setNewTypeName(e.target.value)} className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs" placeholder="Nuevo..." />
                                                <button type="button" onClick={handleCreateType} className="px-2 py-1 bg-slate-200 rounded text-xs font-bold">Add</button>
                                                <button type="button" onClick={handleEditType} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs" title="Editar"><span className="material-symbols-outlined text-[10px]">edit</span></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Módulo Restringido</label>
                                            <select value={moduleConfig} onChange={e => setModuleConfig(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm">
                                                <option>Ninguno</option>
                                                <option>Contabilidad</option>
                                                <option>Tributaria</option>
                                                <option>Laboral</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Etiquetas (coma separadas)</label>
                                            <input value={tags} onChange={e => setTags(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" placeholder="iva, finiquito, excel" />
                                        </div>
                                    </div>
                                </div>

                                {/* Media & SEO */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">movie</span> Media y Detalles
                                    </h3>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Portada del Producto</label>
                                        <input type="file" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} accept="image/*" className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm" />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Video Tutorial / Preview (URL)</label>
                                        <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Ej: https://youtube.com/..." />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Archivo de Descarga/Visor (Upload)</label>
                                        <input type="file" onChange={e => setResourceFile(e.target.files ? e.target.files[0] : null)} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm mb-2" />
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">O URL Directo</label>
                                        <input value={fileUrl} onChange={e => setFileUrl(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Ej: https://.../archivo.pdf" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Visibilidad</label>
                                            <select value={visibility} onChange={e => setVisibility(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm">
                                                <option value="public">Público (Todos)</option>
                                                <option value="authenticated">Solo Registrados</option>
                                                <option value="pro">Solo Pro</option>
                                                <option value="premium">Solo Premium</option>
                                                <option value="hidden">Oculto (Pruebas)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Versión / Año</label>
                                            <input value={version} onChange={e => setVersion(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" placeholder="v1.0" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Requerimientos Técnicos</label>
                                        <textarea value={requirements} onChange={e => setRequirements(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Ej: Excel 2016+, Windows 10..." rows={2}></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Descripción Larga</label>
                                        <textarea value={longDesc} onChange={e => setLongDesc(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Describe todos los beneficios y temario del producto..." rows={4}></textarea>
                                    </div>
                                </div>

                                {/* Pricing & Promotions */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">sell</span> Precios y Promociones
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Precio Original (CLP)</label>
                                            <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" placeholder="0" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Destacado</label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="w-5 h-5 rounded text-primary" />
                                                <span className="text-sm font-medium">Mostrar en homepage</span>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Orden</label>
                                            <input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value))} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" placeholder="0" />
                                        </div>
                                    </div>
                                </div>

                                {/* Multiple Files (only when editing) */}
                                {editingProduct && (
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">folder_zip</span> Archivos Multiples
                                        </h3>

                                        <div className="space-y-2">
                                            {productFiles.map(file => (
                                                <div key={file.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-slate-400 text-sm">
                                                                {file.file_type === 'video' ? 'movie' : file.file_type === 'pdf' ? 'picture_as_pdf' : 'insert_drive_file'}
                                                            </span>
                                                            <span className="text-xs font-medium truncate">{file.name}</span>
                                                            <span className="text-[10px] text-slate-400">({file.file_type})</span>
                                                        </div>
                                                        <div className="text-[9px] text-slate-300 font-mono truncate mt-1" title={file.id}>
                                                            ID: {file.id}
                                                        </div>
                                                        <div className="text-[9px] text-blue-400 font-mono truncate" title={file.file_url}>
                                                            {file.file_url}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 ml-2">
                                                        <a href={file.file_url} target="_blank" className="text-primary text-xs hover:underline">Ver</a>
                                                        <button onClick={() => handleDeleteFile(file.id)} className="text-red-400 hover:text-red-600">
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <input value={newFileName} onChange={e => setNewFileName(e.target.value)} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs" placeholder="Nombre archivo" />
                                            <select value={newFileType} onChange={e => setNewFileType(e.target.value)} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs">
                                                <option value="main">Principal</option>
                                                <option value="preview">Preview</option>
                                                <option value="tutorial">Tutorial</option>
                                                <option value="manual">Manual</option>
                                                <option value="template">Plantilla</option>
                                            </select>
                                            <input value={newFileUrl} onChange={e => setNewFileUrl(e.target.value)} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs" placeholder="URL" />
                                        </div>
                                        <button onClick={handleAddFile} type="button" className="w-full py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20">
                                            + Agregar Archivo
                                        </button>
                                    </div>
                                )}

                                {/* Related Products (only when editing) */}
                                {editingProduct && (
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">link</span> Productos Relacionados
                                        </h3>

                                        <div className="space-y-2">
                                            {relatedProducts.map(rp => (
                                                <div key={rp.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <img src={rp.image_url} className="w-8 h-8 rounded object-cover" />
                                                        <span className="text-xs font-medium">{rp.title}</span>
                                                    </div>
                                                    <button onClick={() => handleRemoveRelated(rp.id)} className="text-red-400 hover:text-red-600">
                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <select 
                                            onChange={e => { if(e.target.value) handleAddRelated(e.target.value); e.target.value = ""; }} 
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                                            value=""
                                        >
                                            <option value="">+ Agregar producto relacionado...</option>
                                            {products.filter(p => p.id !== editingProduct?.id && !selectedRelated.includes(p.id)).map(p => (
                                                <option key={p.id} value={p.id}>{p.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <button type="submit" disabled={loading} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                                        {loading ? "Procesando..." : (editingProduct ? "Actualizar Producto" : "Crear Super Producto")}
                                    </button>
                                    {editingProduct && (
                                        <button type="button" onClick={resetForm} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Lista */}
                    <div className="xl:col-span-1">
                        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50 h-full">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Producto</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo/Categoría</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Precio/Stock</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fetching ? (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">Cargando catálogo...</td></tr>
                                    ) : products.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">No hay productos</td></tr>
                                    ) : products.map(p => (
                                        <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={p.image_url} alt={p.title} className="size-10 rounded-lg object-cover" />
                                                    <div>
                                                        <span className="font-bold text-slate-800 text-sm block">{p.title}</span>
                                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[10px]">{p.visibility === 'public' ? 'public' : 'lock'}</span>
                                                            v{p.version} | {p.visibility}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-bold block w-max mb-1">{p.type}</span>
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold block w-max">{p.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-black text-slate-900 text-sm block">${p.price.toLocaleString()}</span>
                                                <span className="text-[9px] text-amber-600 font-bold">{p.stock !== null ? `${p.stock} unid.` : 'Ilimitado'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                <button onClick={() => startEditing(p)} className="text-blue-400 hover:text-blue-600 transition-colors shadow-sm bg-white p-2 rounded-lg border border-slate-100">
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </button>
                                                <button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-red-600 transition-colors shadow-sm bg-white p-2 rounded-lg border border-slate-100">
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
