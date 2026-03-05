import "./globals.css";

export const metadata = {
  title: "Sooferline IA",
  description: "La solución inteligente para tus dudas normativas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased font-display text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
