import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Life Course Registration",
  description: "University Campus Life Course Registration Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
