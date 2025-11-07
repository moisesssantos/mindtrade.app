import OperationItemCard from "../OperationItemCard";

export default function OperationItemCardExample() {
  return (
    <div className="space-y-3 max-w-3xl">
      <OperationItemCard
        index={1}
        mercado="Match Odds"
        estrategia="Lay 0-1"
        onDelete={() => console.log('Excluir item')}
      />
      <OperationItemCard
        index={2}
        mercado="Ambas Marcam"
        estrategia="Over Limite"
        onDelete={() => console.log('Excluir item')}
      />
    </div>
  );
}
