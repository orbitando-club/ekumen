import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Empecemos · Ekumen",
  description: "Cuatro prácticas cortas para explorar los nuevos valores de Ekumen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className={`${inter.className} min-h-full antialiased`}>{children}</body>
    </html>
  );
}
