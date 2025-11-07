import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
}

// Detecta se é negativo
function isNegative(value: string | number): boolean {
  const str = String(value).trim();
  if (str.includes("-")) return true;
  const num = parseFloat(
    str.replace(/[^\d\-.,]/g, "").replace(/\./g, "").replace(",", ".")
  );
  return num < 0;
}

// Detecta se é positivo
function isPositive(value: string | number): boolean {
  const str = String(value).trim();
  if (str.includes("-")) return false;
  const num = parseFloat(
    str.replace(/[^\d\-.,]/g, "").replace(/\./g, "").replace(",", ".")
  );
  return num > 0;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
}: MetricCardProps) {
  const negative = isNegative(value);
  const positive = isPositive(value);

  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDarkMode(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const valueColor = negative
    ? isDarkMode
      ? "text-red-400"
      : "text-red-600"
    : positive
    ? isDarkMode
      ? "text-green-400"
      : "text-green-600"
    : "text-foreground";

  const trendColor = trend
    ? trend.positive
      ? isDarkMode
        ? "text-green-400"
        : "text-green-600"
      : isDarkMode
      ? "text-red-400"
      : "text-red-600"
    : "";

  return (
    <Card
      className={`p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
        isDarkMode
          ? "bg-card border border-primary/20"
          : "bg-white border border-gray-200 shadow-sm"
      }`}
      data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className={`text-2xl font-bold font-mono ${valueColor}`}>
            {value}
          </p>
          {trend && (
            <p className={`text-xs mt-1 font-semibold ${trendColor}`}>
              {trend.value}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`p-2 rounded-lg ${
              isDarkMode
                ? "bg-primary/10 text-primary"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
