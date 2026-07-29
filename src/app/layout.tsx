import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Life Course Registration Portal",
  description: "Production-grade University Course Registration System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
