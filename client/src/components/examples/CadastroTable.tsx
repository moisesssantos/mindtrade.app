import CadastroTable from "../CadastroTable";

export default function CadastroTableExample() {
  const mockEquipes = [
    { id: 1, nome: "Botafogo" },
    { id: 2, nome: "Flamengo" },
    { id: 3, nome: "Real Madrid" },
    { id: 4, nome: "Barcelona" },
  ];

  const mockEstrategias = [
    { id: 1, nome: "Lay 0-1", mercado: "Match Odds" },
    { id: 2, nome: "Over Limite", mercado: "Ambas Marcam" },
    { id: 3, nome: "Scalping HT", mercado: "Correct Score" },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <CadastroTable
        title="Equipes"
        items={mockEquipes}
        onAdd={() => console.log('Adicionar equipe')}
        onEdit={(item) => console.log('Editar', item)}
        onDelete={(item) => console.log('Excluir', item)}
      />
      
      <CadastroTable
        title="Estratégias"
        items={mockEstrategias}
        showMercado={true}
        onAdd={() => console.log('Adicionar estratégia')}
        onEdit={(item) => console.log('Editar', item)}
        onDelete={(item) => console.log('Excluir', item)}
      />
    </div>
  );
}
