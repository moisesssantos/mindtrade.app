import { addDays, subDays, format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
// ...

// dentro do componente
const hoje = new Date();

// ⬇️ Formatação SEM a palavra "Hoje"
const formattedDate = format(date, "ccc. dd 'de' LLL.", { locale: ptBR }); 
// Obs.: "ccc" = dia da semana abreviado; "LLL" = mês abreviado (date-fns v2)

return (
  <div className="flex items-center justify-center gap-3 rounded-full border border-[#0099DD]/40 bg-white/80 dark:bg-[#1C1C1C]/90 px-4 py-2 shadow-sm">
    {/* ← */}
    <button onClick={() => handleChange(-1)} className="flex w-8 h-8 items-center justify-center rounded-full hover:bg-[#0099DD]/10 transition">
      <ChevronLeft size={18} color="#0099DD" />
    </button>

    {/* Botão HOJE (sempre visível, mas só ele diz “Hoje”) */}
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

    {/* Label central: só aparece quando NÃO é hoje */}
    {!isSameDay(date, hoje) && (
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="flex items-center gap-2 px-4 text-sm font-medium select-none min-w-[140px] text-center rounded-full hover:bg-[#0099DD]/10 transition"
            style={{ color: "#0099DD" }}
            title="Selecionar data"
          >
            <CalendarIcon size={16} />
            {formattedDate}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="center"
          className="p-0 bg-white dark:bg-[#1C1C1C] border border-[#0099DD]/30 rounded-xl shadow-lg"
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

    {/* → */}
    <button onClick={() => handleChange(1)} className="flex w-8 h-8 items-center justify-center rounded-full hover:bg-[#0099DD]/10 transition">
      <ChevronRight size={18} color="#0099DD" />
    </button>
  </div>
);
