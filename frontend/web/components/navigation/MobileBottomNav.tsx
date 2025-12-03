"use client";

import { Home, BarChart3, Wallet, Settings, PlusCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: BarChart3, label: "Reports", path: "/reports" },
    { icon: PlusCircle, label: "Add", path: "/transactions?action=add", primary: true },
    { icon: Wallet, label: "Budgets", path: "/goals-budgets" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-2xl md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || pathname?.startsWith(item.path);

          if (item.primary) {
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.path)}
                className="flex h-14 w-14 -translate-y-4 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl transition-transform hover:scale-110"
              >
                <Icon className="h-6 w-6" />
              </button>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              className={`flex flex-1 flex-col items-center gap-1 py-2 transition-colors ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
