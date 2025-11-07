import StatusBadge from "../StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-3">
      <StatusBadge status="PRE_ANALISE" />
      <StatusBadge status="OPERACAO_PENDENTE" />
      <StatusBadge status="OPERACAO_CONCLUIDA" />
      <StatusBadge status="NAO_OPERADA" />
    </div>
  );
}
