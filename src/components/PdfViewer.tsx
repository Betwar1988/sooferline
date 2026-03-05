"use client";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PdfViewerProps {
    fileUrl: string;
    maxPages?: number;
}

export default function PdfViewer({ fileUrl, maxPages }: PdfViewerProps) {
    // IMPORTANTE: defaultLayoutPlugin() utiliza Hooks de React internamente. 
    // JAMÁS debe colocarse dentro de un useMemo() o useEffect(), debe ir en el nivel superior.
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        sidebarTabs: () => [], // Ocultar barra lateral
    });

    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <div className="h-full w-full">
                <Viewer
                    fileUrl={fileUrl}
                    plugins={[defaultLayoutPluginInstance]}
                    renderPage={(props) => {
                        if (maxPages && props.pageIndex >= maxPages) {
                            return (
                                <div
                                    className="h-full flex items-center justify-center bg-slate-50 border-t border-slate-200"
                                    style={{ height: '100%' }}
                                >
                                    <div className="text-center p-8">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">lock</span>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                            Contenido bloqueado en Plan Básico.<br />
                                            Sube a Pro o Premium para desbloquear las {props.doc.numPages} páginas.
                                        </p>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <>
                                {props.canvasLayer.children}
                                {props.textLayer.children}
                                {props.annotationLayer.children}
                            </>
                        );
                    }}
                />
            </div>
        </Worker>
    );
}
