"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

function TiendaContent() {
    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [category, setCategory] = useState("Todos");
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<{ product: any, quantity: number }[]>([]);
    const [showCart, setShowCart] = useState(false);
    
    // Product detail modal
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [productReviews, setProductReviews] = useState<any[]>([]);
    const [productFiles, setProductFiles] = useState<any[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const searchBookId = searchParams.get("bookId");

    const [categories, setCategories] = useState<string[]>(["Todos"]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
            supabase.from("products").select("*").order("created_at", { ascending: false }),
            supabase.from("product_categories").select("name").order("name")
        ]);

        if (categoriesData.data) {
            setCategories(["Todos", ...categoriesData.data.map((c: any) => c.name)]);
        }

        if (productsData.data) {
            setProducts(productsData.data);
            setFilteredProducts(productsData.data);

            // Si viene un ID de libro, filtrar automáticamente si existe
            if (searchBookId) {
                const bookMatch = productsData.data.filter((p: any) => p.metadata?.book_id === searchBookId);
                if (bookMatch.length > 0) {
                    setFilteredProducts(bookMatch);
                    setCategory(bookMatch[0].category);
                }
            }
        }
        setLoading(false);
    };

    const openProductDetail = async (product: any) => {
        setSelectedProduct(product);
        
        // Fetch related products
        const { data: relations } = await supabase
            .from("product_relations")
            .select("products(id, title, image_url, price, category)")
            .eq("product_id", product.id);
        
        if (relations) {
            setRelatedProducts(relations.map((r: any) => r.products).filter(Boolean));
        }

        // Fetch reviews
        const { data: reviews } = await supabase
            .from("product_reviews")
            .select("*, profiles(full_name)")
            .eq("product_id", product.id)
            .order("created_at", { ascending: false })
            .limit(10);
        
        if (reviews) setProductReviews(reviews);

        // Fetch product files
        const { data: files } = await supabase
            .from("product_files")
            .select("*")
            .eq("product_id", product.id);
        
        if (files) setProductFiles(files);
    };

    const filterByCategory = (cat: string) => {
        setCategory(cat);
        if (cat === "Todos") {
            setFilteredProducts(products);
        } else {
            setFilteredProducts(products.filter(p => p.category === cat));
        }
    };

    const addToCart = (product: any) => {
        const existingItem = cart.find(item => item.product.id === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
        alert("¡Añadido al carrito!");
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.product.id === productId) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.product.id !== productId));
    };

    const confirmarOrden = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert("Debes iniciar sesión para finalizar tu compra.");
            return;
        }

        const purchasesRows = cart.map(item => ({
            user_id: session.user.id,
            product_id: item.product.id,
            amount: item.product.price * item.quantity
        }));

        const { error } = await supabase.from("user_purchases").insert(purchasesRows);
        if (error) {
            alert("Error al procesar la compra. Verifica la consola.");
            console.error(error);
        } else {
            alert("¡Compra exitosa! Tus productos están ahora en tu Biblioteca Personal.");
            setCart([]);
            setShowCart(false);
            router.push("/mis-compras");
        }
    };

    const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
    const totalPrice = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);

    const submitReview = async (rating: number, reviewText: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert("Debes iniciar sesión para dejar una reseña.");
            return;
        }

        const { error } = await supabase.from("product_reviews").insert({
            product_id: selectedProduct.id,
            user_id: session.user.id,
            rating,
            review_text: reviewText
        });

        if (error) {
            alert("Error al enviar reseña: " + error.message);
        } else {
            alert("¡Gracias por tu reseña!");
            // Refresh reviews
            const { data } = await supabase
                .from("product_reviews")
                .select("*, profiles(full_name)")
                .eq("product_id", selectedProduct.id)
                .order("created_at", { ascending: false })
                .limit(10);
            if (data) setProductReviews(data);
        }
    };

    const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && onChange?.(star)}
                        className={`text-xl transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${star <= rating ? 'text-amber-400' : 'text-slate-200'}`}
                    >
                        ★
                    </button>
                ))}
            </div>
        );
    };

    const ReviewForm = ({ onSubmit }: { onSubmit: (rating: number, text: string) => void }) => {
        const [rating, setRating] = useState(0);
        const [reviewText, setReviewText] = useState("");

        return (
            <div className="bg-slate-50 rounded-2xl p-4">
                <h4 className="font-bold text-sm mb-3">Deja tu opinión</h4>
                <div className="mb-3">
                    {renderStars(rating, true, setRating)}
                </div>
                <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Comparte tu experiencia con este producto..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm mb-3"
                    rows={3}
                />
                <button
                    onClick={() => { if (rating > 0) { onSubmit(rating, reviewText); setRating(0); setReviewText(""); } }}
                    disabled={rating === 0}
                    className="py-2 px-4 bg-primary text-white rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Enviar Reseña
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 font-display">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-12 pb-32">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-primary">storefront</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tienda Oficial Sooferline</p>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                            Catálogo {category !== "Todos" && <span className="text-primary opacity-30 italic">/ {category}</span>}
                        </h1>
                        <p className="text-slate-500 font-medium mt-3 max-w-lg leading-relaxed italic text-sm">
                            Impulsa tu carrera con recursos premium diseñados por expertos en Chile.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowCart(true)}
                            className="relative p-5 bg-white rounded-[24px] shadow-xl shadow-slate-200 border border-slate-100 group hover:scale-105 active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-primary text-3xl">shopping_cart</span>
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 size-7 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center animate-bounce border-4 border-white">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 mb-10 overflow-x-auto pb-4 custom-scrollbar no-screenshots scroll-smooth">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => filterByCategory(cat)}
                            className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all border whitespace-nowrap ${category === cat
                                ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105"
                                : "bg-white border-slate-200 text-slate-400 hover:border-primary/50"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center opacity-30">
                        <div className="size-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="font-black uppercase tracking-widest text-xs">Cargando Productos...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">sentiment_dissatisfied</span>
                        <p className="text-xl font-bold text-slate-400">No encontramos productos en esta categoría</p>
                        <button onClick={() => filterByCategory("Todos")} className="mt-4 text-primary font-black uppercase text-xs tracking-widest hover:underline">Ver todo el catálogo</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map(product => (
                            <div 
                                key={product.id} 
                                onClick={() => openProductDetail(product)}
                                className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 hover:border-primary/30 transition-all group flex flex-col h-full animate-in fade-in zoom-in-95 duration-500 cursor-pointer"
                            >
                                <div className="h-64 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-slate-900 group-hover:bg-primary transition-colors duration-500 opacity-0 group-hover:opacity-10 z-10 pointer-events-none"></div>
                                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                    <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-primary shadow-xl z-20">
                                        {product.type}
                                    </div>
                                    <div className="absolute bottom-4 right-6 size-12 bg-white rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-20">
                                        <span className="material-symbols-outlined text-primary">visibility</span>
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{product.category}</p>
                                        {(product.version || product.visibility !== 'public') && (
                                            <div className="flex gap-1">
                                                {product.version && <span className="px-2 py-0.5 bg-slate-100 rounded text-[8px] font-black text-slate-400">v{product.version}</span>}
                                                {product.visibility && product.visibility !== 'public' && (
                                                    <span className="material-symbols-outlined text-[12px] text-amber-500" title={`Visible solo para: ${product.visibility}`}>lock</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-primary transition-colors">{product.title}</h3>

                                    {product.tags && product.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {product.tags.map((tag: string, idx: number) => (
                                                <span key={idx} className="px-2 py-1 bg-primary/5 text-primary rounded-md text-[9px] font-bold">#{tag}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 opacity-50">Precio Final</p>
                                            <span className="text-2xl font-black text-slate-900 tracking-tighter">${product.price.toLocaleString('es-CL')}</span>
                                        </div>
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="size-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-primary transition-all shadow-xl active:scale-90"
                                        >
                                            <span className="material-symbols-outlined text-2xl">add_shopping_cart</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Cart Modal */}
            {showCart && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
                    <aside className="relative w-full max-w-md bg-white h-full shadow-2xl p-10 flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Mi Compra</h2>
                                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Resumen de pedidos</p>
                            </div>
                            <button onClick={() => setShowCart(false)} className="size-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar no-screenshots">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                                    <span className="material-symbols-outlined text-8xl mb-4">shopping_bag</span>
                                    <p className="font-black uppercase tracking-[0.2em] text-sm leading-relaxed">Tu carrito está esperando<br />nuevas oportunidades</p>
                                </div>
                            ) : cart.map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-5 bg-slate-50 rounded-[28px] border border-slate-100 animate-in slide-in-from-bottom duration-300 relative group">
                                    <img src={item.product.image_url} className="size-20 rounded-2xl object-cover shadow-lg" />

                                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                                        <p className="font-black text-sm text-slate-800 leading-tight mb-2 truncate pr-6">{item.product.title}</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-primary font-black text-lg tracking-tight">${item.product.price.toLocaleString('es-CL')}</p>

                                            {/* Selector de cantidad */}
                                            <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                <button onClick={() => updateQuantity(item.product.id, -1)} className="px-3 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors material-symbols-outlined text-sm">remove</button>
                                                <span className="px-2 font-black text-sm text-slate-800 w-8 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product.id, 1)} className="px-3 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors material-symbols-outlined text-sm">add</button>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFromCart(item.product.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pt-10 border-t-4 border-slate-50">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Total a Pagar</span>
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter">${totalPrice.toLocaleString('es-CL')}</p>
                                </div>
                                <div className="bg-primary/10 px-4 py-2 rounded-xl">
                                    <p className="text-primary text-[10px] font-black">CLP</p>
                                </div>
                            </div>
                            <button
                                onClick={confirmarOrden}
                                className="w-full py-6 rounded-[32px] bg-primary text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    Confirmar Orden
                                    <span className="material-symbols-outlined text-sm animate-pulse">arrow_forward_ios</span>
                                </span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => { setSelectedProduct(null); setShowPreview(false); }}></div>
                    <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center p-8 border-b border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900">{selectedProduct.title}</h2>
                            <button onClick={() => { setSelectedProduct(null); setShowPreview(false); }} className="size-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Image & Preview */}
                                <div>
                                    <div className="relative rounded-[24px] overflow-hidden mb-4 aspect-video bg-slate-100">
                                        <img src={selectedProduct.image_url} alt={selectedProduct.title} className="w-full h-full object-cover" />
                                        {selectedProduct.video_url && !showPreview && (
                                            <button onClick={() => setShowPreview(true)} className="absolute inset-0 flex items-center justify-center bg-slate-900/40 hover:bg-slate-900/50 transition-colors">
                                                <div className="size-20 bg-white rounded-full flex items-center justify-center shadow-xl">
                                                    <span className="material-symbols-outlined text-primary text-4xl">play_arrow</span>
                                                </div>
                                            </button>
                                        )}
                                        {showPreview && selectedProduct.video_url && (
                                            <div className="absolute inset-0">
                                                <iframe 
                                                    src={selectedProduct.video_url.replace('watch?v=', 'embed/')} 
                                                    className="w-full h-full" 
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick actions */}
                                    <div className="flex gap-2">
                                        {selectedProduct.video_url && (
                                            <button onClick={() => setShowPreview(!showPreview)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200">
                                                <span className="material-symbols-outlined text-lg">{showPreview ? 'image' : 'play_circle'}</span>
                                                {showPreview ? 'Ver Portada' : 'Ver Video'}
                                            </button>
                                        )}
                                        <button onClick={() => addToCart(selectedProduct)} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90">
                                            <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                                            Agregar
                                        </button>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-6">
                                    {/* Price */}
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl font-black text-slate-900">${selectedProduct.price.toLocaleString('es-CL')}</span>
                                        {selectedProduct.original_price && selectedProduct.discount_percentage > 0 && (
                                            <>
                                                <span className="text-lg text-slate-400 line-through">${selectedProduct.original_price.toLocaleString('es-CL')}</span>
                                                <span className="px-2 py-1 bg-red-500 text-white text-xs font-black rounded-full">-{selectedProduct.discount_percentage}%</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center gap-3">
                                        {renderStars(Math.round(selectedProduct.average_rating || 0))}
                                        <span className="text-sm font-medium text-slate-500">
                                            {selectedProduct.average_rating?.toFixed(1) || '0.0'} ({selectedProduct.review_count || 0} reseñas)
                                        </span>
                                    </div>

                                    {/* Tags */}
                                    {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {selectedProduct.tags.map((tag: string, idx: number) => (
                                                <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">#{tag}</span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div>
                                        <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-2">Descripción</h4>
                                        <p className="text-slate-600 text-sm leading-relaxed">{selectedProduct.description || 'Sin descripción disponible.'}</p>
                                    </div>

                                    {/* Long Description */}
                                    {selectedProduct.long_description && (
                                        <div>
                                            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-2">Detalles</h4>
                                            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{selectedProduct.long_description}</div>
                                        </div>
                                    )}

                                    {/* Requirements */}
                                    {selectedProduct.requirements && (
                                        <div>
                                            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-2">Requisitos</h4>
                                            <p className="text-slate-600 text-sm">{selectedProduct.requirements}</p>
                                        </div>
                                    )}

                                    {/* Version & Stock */}
                                    <div className="flex gap-4 text-xs">
                                        {selectedProduct.version && (
                                            <span className="px-3 py-1 bg-slate-100 rounded-full font-medium">v{selectedProduct.version}</span>
                                        )}
                                        {selectedProduct.stock !== null && (
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">{selectedProduct.stock} disponibles</span>
                                        )}
                                        {selectedProduct.module && (
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">{selectedProduct.module}</span>
                                        )}
                                    </div>

                                    {/* Files */}
                                    {productFiles.length > 0 && (
                                        <div>
                                            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-2">Archivos Incluidos</h4>
                                            <div className="space-y-2">
                                                {productFiles.map((file: any) => (
                                                    <a key={file.id} href={file.file_url} target="_blank" className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                                        <span className="material-symbols-outlined text-slate-400 text-lg">
                                                            {file.file_type === 'video' ? 'movie' : file.file_type === 'pdf' ? 'picture_as_pdf' : 'insert_drive_file'}
                                                        </span>
                                                        <span className="text-sm font-medium flex-1">{file.name}</span>
                                                        <span className="text-xs text-slate-400 capitalize">{file.file_type}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <h3 className="text-xl font-black mb-6">Reseñas de Clientes</h3>
                                
                                {/* Review Form */}
                                <ReviewForm onSubmit={submitReview} />

                                {/* Reviews List */}
                                <div className="space-y-4 mt-6">
                                    {productReviews.length === 0 ? (
                                        <p className="text-slate-400 text-sm italic">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
                                    ) : productReviews.map((review: any) => (
                                        <div key={review.id} className="p-4 bg-slate-50 rounded-2xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                                                        {review.profiles?.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <span className="font-bold text-sm">{review.profiles?.full_name || 'Usuario'}</span>
                                                </div>
                                                {renderStars(review.rating)}
                                            </div>
                                            {review.review_text && <p className="text-slate-600 text-sm mt-2">{review.review_text}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Related Products */}
                            {relatedProducts.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <h3 className="text-xl font-black mb-6">Productos Relacionados</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {relatedProducts.map((rp: any) => (
                                            <div key={rp.id} onClick={() => openProductDetail(rp)} className="bg-slate-50 rounded-2xl p-3 cursor-pointer hover:bg-slate-100 transition-colors">
                                                <img src={rp.image_url} alt={rp.title} className="w-full aspect-video object-cover rounded-xl mb-2" />
                                                <p className="font-bold text-sm truncate">{rp.title}</p>
                                                <p className="text-primary font-black">${rp.price?.toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TiendaPage() {
    return (
        <Suspense fallback={<div>Cargando tienda...</div>}>
            <TiendaContent />
        </Suspense>
    );
}
