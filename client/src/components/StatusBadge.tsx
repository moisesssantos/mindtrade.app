import { Badge } from "@/components/ui/badge";

export type MatchStatus = "PRE_ANALISE" | "OPERACAO_PENDENTE" | "OPERACAO_CONCLUIDA" | "NAO_OPERADA";

interface StatusBadgeProps {
  status: MatchStatus;
}

const statusConfig: Record<MatchStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PRE_ANALISE: { label: "Pré-Análise", variant: "secondary" },
  OPERACAO_PENDENTE: { label: "Operação Pendente", variant: "outline" },
  OPERACAO_CONCLUIDA: { label: "Concluída", variant: "default" },
  NAO_OPERADA: { label: "Não Operada", variant: "secondary" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} data-testid={`badge-status-${status.toLowerCase()}`}>
      {config.label}
    </Badge>
  );
}
