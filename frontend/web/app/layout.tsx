// app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css"; // ✅ correct relative path

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FinTrack",
  description: "Track and manage your finances easily with FinTrack.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
