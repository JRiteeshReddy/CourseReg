import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

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
    <html lang="en" className={`dark ${jakarta.variable}`}>
      <body className="antialiased min-h-screen flex flex-col selection:bg-[#7ECEB7] selection:text-[#041C19]">
        {children}
      </body>
    </html>
  );
}
