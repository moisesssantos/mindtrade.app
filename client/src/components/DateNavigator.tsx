import { useState } from "react";
import { addDays, subDays, format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function DateNavigator({
  onChange,
}: {
  onChange?: (date: Date) => void;
}) {
  const [date, setDate] = useState(new Date());

  const handleChange = (delta: number) => {
    const newDate =
      delta > 0 ? addDays(date, delta) : subDays(date, Math.abs(delta));
    setDate(newDate);
    onChange?.(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setDate(today);
    onChange?.(today);
  };

  // 🧠 Formato reduzido e elegante
  const formattedDate = isToday(date)
    ? "hoje"
    : format(date, "EEE ',' dd 'de' MMM", { locale: ptBR })
        .replace("-feira", "")
        .replace(".", ".")
        .toLowerCase();

  return (
    <div
      className="flex items-center justify-center gap-3 rounded-2xl border border-[#44494D]/30 bg-white dark:bg-[#1C1C1C] shadow-sm px-4 py-2 transition-all"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Botão anterior */}
      <button
        onClick={() => handleChange(-1)}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#0099DD]/10 transition"
      >
        <ChevronLeft size={18} color="#0099DD" />
      </button>

      {/* Texto central (sem botão interno) */}
      <span
        onClick={handleToday}
        className={`text-sm font-medium cursor-pointer select-none ${
          isToday(date)
            ? "text-[#0099DD] font-semibold"
            : "text-[#44494D] dark:text-gray-200"
        }`}
      >
        {formattedDate}
      </span>

      {/* Botão próximo */}
      <button
        onClick={() => handleChange(1)}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#0099DD]/10 transition"
      >
        <ChevronRight size={18} color="#0099DD" />
      </button>
    </div>
  );
}
