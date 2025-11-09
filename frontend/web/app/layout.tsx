import type { Metadata } from "next";
import { Inter } from "next/font/google";
// @ts-ignore - allow CSS side-effect import without type declarations
import "@/app/globals.css";
import Navigation from "@/components/Navigation";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinTrack - Personal Finance Tracker",
  description:
    "Track your expenses, manage budgets, and visualize your financial health",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main>{children}</main>

        {/* Optional: a portal target if you prefer rendering overlays via portal */}
        <div id="overlay-root" />
      </body>
    </html>
  );
}
