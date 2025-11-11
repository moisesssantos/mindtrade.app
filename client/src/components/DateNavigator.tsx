import { useState } from "react";
import { addDays, subDays, format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

/**
 * 📅 DateNavigator — componente de navegação de datas com calendário popup
 * MindTrade Design: bordas arredondadas, tema azul-ciano (#0099DD)
 */
export default function DateNavigator({
  onChange,
}: {
  onChange?: (date: Date) => void;
}) {
  const [date, setDate] = useState(new Date());
  const hoje = new Date();

  const handleChange = (delta: number) => {
    const newDate = delta > 0 ? addDays(date, delta) : subDays(date, Math.abs(delta));
    setDate(newDate);
    onChange?.(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setDate(today);
    onChange?.(today);
  };

  const formattedDate = format(date, "eee. dd 'de' LLL.", { locale: ptBR }); // abreviações

  return (
    <div
      className="flex items-center justify-center gap-3 rounded-2xl border border-[#0099DD]/40 bg-white/90 dark:bg-[#1C1C1C]/90 px-4 py-2 shadow-sm"
      style={{
        fontFamily: "Inter, sans-serif",
        color: "#44494D",
      }}
    >
      {/* ← botão anterior */}
      <button
        onClick={() => handleChange(-1)}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#0099DD]/10 transition"
      >
        <ChevronLeft size={18} color="#0099DD" />
      </button>

      {/* Botão Hoje */}
      <button
        onClick={handleToday}
        className={`px-3 py-1 rounded-full text-sm font-medium border ${
          isSameDay(date, hoje)
            ? "bg-[#0099DD] text-white border-[#0099DD]"
            : "text-[#0099DD] border-[#0099DD]/40 hover:bg-[#0099DD]/10"
        } transition`}
      >
        Hoje
      </button>

      {/* Data formatada + calendário (só aparece se não for hoje) */}
      {!isSameDay(date, hoje) && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-2 px-4 text-sm font-medium select-none min-w-[140px] text-center rounded-full hover:bg-[#0099DD]/10 transition"
              style={{ color: "#0099DD" }}
            >
              <CalendarIcon size={16} />
              {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="center"
            className="p-0 bg-white dark:bg-[#1C1C1C] border border-[#0099DD]/30 rounded-2xl shadow-lg"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                if (d) {
                  setDate(d);
                  onChange?.(d);
                }
              }}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      )}

      {/* → botão próximo */}
      <button
        onClick={() => handleChange(1)}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#0099DD]/10 transition"
      >
        <ChevronRight size={18} color="#0099DD" />
      </button>
    </div>
  );
}
