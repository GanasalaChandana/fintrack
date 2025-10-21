import "./globals.css";

export const metadata = {
  title: "FinTrack",
  description: "Intelligent financial management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a href="/" className="font-bold text-xl">FinTrack</a>
            <div className="flex items-center gap-4 text-sm">
              <a href="/dashboard" className="hover:text-blue-600">Dashboard</a>
              <a href="/upload" className="hover:text-blue-600">Upload</a>
              <a href="/reports" className="hover:text-blue-600">Reports</a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
