import { FileOutput, ShieldCheck } from "lucide-react";

export default function Profesionales() {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Marketplace de Profesionales & Trámites</h1>
                <p className="text-slate-600 mt-2">Consultas avanzadas o delegación de Trámites Presenciales (SII, Inspección del Trabajo, etc.)</p>
            </div>

            <div className="flex gap-4 border-b border-slate-200 pb-4">
                <button className="px-6 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-full border border-indigo-200">Consultas Online</button>
                <button className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-full transition">Trámites Presenciales</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((card) => (
                    <div key={card} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
                        <div className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg">
                                    CP
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Carlos Pérez</h3>
                                    <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded-md">Especialista Tributario</span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 flex items-center gap-2"><FileOutput size={16} /> Consulta Rápida</span>
                                    <span className="font-semibold text-slate-900">$20.000</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-600 flex items-center gap-2"><ShieldCheck size={16} /> Representación SII</span>
                                    <span className="font-semibold text-slate-900">$150.000</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                            <button className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm">
                                Solicitar Trámite / Consulta
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
