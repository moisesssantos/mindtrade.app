import { Link, useLocation } from "wouter";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import logoDark from "@assets/logo_dark.png";
import logoLight from "@assets/logo_light.png";

const menuItems = [
  { path: "/", label: "Dashboard" },
  { path: "/partidas", label: "Partidas" },
  { path: "/pre-analises", label: "Pré-Análises" },
  { path: "/operacoes", label: "Operações" },
  { path: "/relatorios", label: "Relatórios" },
  { path: "/resumo-anual", label: "Resumo Anual" },
  { path: "/cadastros", label: "Cadastros" },
];

export default function Header() {
  const [location] = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b ${
          darkMode ? "bg-[#1E1F22]" : "bg-[#F9FBFC]"
        }`}
      >
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/">
            <img
              src={darkMode ? logoDark : logoLight}
              alt="MindTrade"
              className="h-10 cursor-pointer transition-all duration-300"
              data-testid="link-logo"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <span
                    className={`inline-block cursor-pointer px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground hover-elevate"
                    }`}
                    data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          data-testid="button-theme-toggle"
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
