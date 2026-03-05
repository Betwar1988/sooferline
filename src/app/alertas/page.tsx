import { Scale, FileText } from "lucide-react";

export default function Alertas() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Tus Alertas Diarias</h1>
                <p className="text-slate-600 mt-2">Mantente actualizado sin perder tiempo ni cometer errores.</p>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center">
                <div>
                    <h2 className="font-semibold text-lg">Notificaciones Premium</h2>
                    <p className="text-indigo-100 mt-1">Recibe alertas vía App y WhatsApp sobre Diario Oficial y SII.</p>
                </div>
                <button className="px-6 py-2 bg-white text-indigo-600 font-medium rounded-lg shadow hover:bg-indigo-50 transition">
                    Activar Suscripción
                </button>
            </div>

            <div className="space-y-4">
                {[
                    { icon: <FileText className="text-blue-500" />, title: "Resolución Ex. N° 45 - SII", desc: "Nuevas instrucciones sobre facturación electrónica..." },
                    { icon: <Scale className="text-amber-500" />, title: "Dictamen Dirección del Trabajo", desc: "Interpretación sobre reducción de jornada laboral a 40 horas..." }
                ].map((alerta, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl">{alerta.icon}</div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{alerta.title}</h3>
                            <p className="text-slate-600 mt-1 text-sm">{alerta.desc}</p>
                            <div className="mt-4 flex gap-3">
                                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Leer completa</button>
                                <span className="text-slate-300">|</span>
                                <button className="text-sm font-medium text-slate-600 hover:text-slate-800">Delegar Trámite a un Profesional</button>
                            </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Hoy, 08:30 AM</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
