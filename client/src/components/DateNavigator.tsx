import { useState } from "react";
import { addDays, subDays, format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    : format(date, "EEE. dd 'de' MMM.", { locale: ptBR })
        .replace("-feira", "")
        .replace(".", ".")
        .toLowerCase();

  return (
    <div
      className="flex items-center justify-center gap-3 rounded-full border border-[#0099DD]/40 bg-white/80 dark:bg-[#1C1C1C]/90 px-4 py-2 shadow-sm"
      style={{
        fontFamily: "Inter, sans-serif",
        color: "#44494D",
      }}
    >
      {/* Botão esquerdo */}
      <button
        onClick={() => handleChange(-1)}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#0099DD]/10 transition"
      >
        <ChevronLeft size={18} color="#0099DD" />
      </button>

      {/* Texto central — dinâmico */}
      <button
        onClick={handleToday}
        className={`px-4 py-1 rounded-full text-sm font-medium border transition ${
          isToday(date)
            ? "bg-[#0099DD] text-white border-[#0099DD]"
            : "text-[#0099DD] border-[#0099DD]/40 hover:bg-[#0099DD]/10"
        }`}
      >
        {formattedDate}
      </button>

      {/* Botão direito */}
      <button
        onClick={() => handleChange(1)}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#0099DD]/10 transition"
      >
        <ChevronRight size={18} color="#0099DD" />
      </button>
    </div>
  );
}
