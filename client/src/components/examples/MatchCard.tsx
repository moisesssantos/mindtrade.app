import MatchCard from "../MatchCard";

export default function MatchCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
      <MatchCard
        id={1}
        mandante="Botafogo"
        visitante="Flamengo"
        competicao="Brasileirão Série A"
        data="28/10/2025"
        hora="16:00"
        oddMandante={2.50}
        oddVisitante={2.80}
        oddEmpate={3.20}
        status="PRE_ANALISE"
        onConvert={() => console.log('Converter para operação')}
        onClick={() => console.log('Ver detalhes')}
      />
      <MatchCard
        id={2}
        mandante="Real Madrid"
        visitante="Barcelona"
        competicao="La Liga ESP"
        data="28/10/2025"
        hora="18:00"
        oddMandante={2.10}
        oddVisitante={3.40}
        oddEmpate={3.10}
        status="OPERACAO_PENDENTE"
        onClick={() => console.log('Ver operação')}
      />
      <MatchCard
        id={3}
        mandante="Manchester City"
        visitante="Liverpool"
        competicao="Premier League"
        data="27/10/2025"
        hora="14:30"
        oddMandante={1.95}
        oddVisitante={3.80}
        oddEmpate={3.50}
        status="OPERACAO_CONCLUIDA"
        onClick={() => console.log('Ver resultado')}
      />
    </div>
  );
}
