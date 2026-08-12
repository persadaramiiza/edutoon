import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "EduToon - Konten Edukatif untuk Anak",
  description: "Platform video edukatif berbasis webtoon untuk anak-anak Indonesia",
  icons: {
    icon: "/images/desain-20tanpa-20judul-20-286-29.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
