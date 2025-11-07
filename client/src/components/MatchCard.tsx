import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge, { MatchStatus } from "./StatusBadge";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface MatchCardProps {
  id: number;
  mandante: string;
  visitante: string;
  competicao: string;
  data: string;
  hora: string;
  oddMandante?: number;
  oddVisitante?: number;
  oddEmpate?: number;
  status: MatchStatus;
  onConvert?: () => void;
  onClick?: () => void;
}

export default function MatchCard({
  id,
  mandante,
  visitante,
  competicao,
  data,
  hora,
  oddMandante,
  oddVisitante,
  oddEmpate,
  status,
  onConvert,
  onClick,
}: MatchCardProps) {
  return (
    <Card 
      className="p-4 hover-elevate cursor-pointer transition-all" 
      onClick={onClick}
      data-testid={`card-match-${id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs text-muted-foreground">{competicao}</div>
        <StatusBadge status={status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">{mandante}</span>
          {oddMandante && <span className="font-mono text-sm">{oddMandante.toFixed(2)}</span>}
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="font-medium">{visitante}</span>
          {oddVisitante && <span className="font-mono text-sm">{oddVisitante.toFixed(2)}</span>}
        </div>
        {oddEmpate && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Empate</span>
            <span className="font-mono">{oddEmpate.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{data}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{hora}</span>
          </div>
        </div>
      </div>

      {status === "PRE_ANALISE" && onConvert && (
        <Button
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onConvert();
          }}
          data-testid={`button-convert-${id}`}
        >
          Converter para Operação
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </Card>
  );
}
