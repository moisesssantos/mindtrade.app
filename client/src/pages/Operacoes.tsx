import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, TrendingDown, TrendingUp, Edit } from "lucide-react";
import { useLocation } from "wouter";

type Partida = {
  id: number;
  data: string;
  hora: string;
  competicaoId: number;
  mandanteId: number;
  visitanteId: number;
  status: string;
};

type Operacao = {
  id: number;
  partidaId: number;
  status: "PENDENTE" | "CONCLUIDA";
  dataHoraRegistro: string;
  dataConclusao: string | null;
};

type OperacaoItem = {
  id: number;
  operacaoId: number;
  mercadoId: number;
  estrategiaId: number;
  stake: string;
  oddEntrada: string;
  oddSaida: string | null;
  resultadoFinanceiro: string | null;
  tempoExposicaoMin: number | null;
  seguiuPlano: boolean | null;
  estadoEmocional: string | null;
  motivacaoEntrada: string | null;
  autoavaliacao: string | null;
  motivacaoSaidaObservacao: string | null;
};

type Equipe = { id: number; nome: string };
type Competicao = { id: number; nome: string };
type Mercado = { id: number; nome: string };
type Estrategia = { id: number; nome: string; mercadoId: number };

export default function Operacoes() {
  const [, setLocation] = useLocation();

  // ✅ Detectar modo escuro/claro
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // === Queries ===
  const { data: operacoes = [], isLoading: isLoadingOperacoes } = useQuery<Operacao[]>({
    queryKey: ["/api/operacoes"],
  });

  const { data: partidas = [] } = useQuery<Partida[]>({ queryKey: ["/api/partidas"] });
  const { data: equipes = [] } = useQuery<Equipe[]>({ queryKey: ["/api/equipes"] });
  const { data: competicoes = [] } = useQuery<Competicao[]>({ queryKey: ["/api/competicoes"] });
  const { data: mercados = [] } = useQuery<Mercado[]>({ queryKey: ["/api/mercados"] });
  const { data: estrategias = [] } = useQuery<Estrategia[]>({ queryKey: ["/api/estrategias"] });
  const { data: relatorios } = useQuery<any>({ queryKey: ["/api/relatorios"] });

  // === Funções auxiliares ===
  const operacoesConcluidas = operacoes
    .filter((op) => op.status === "CONCLUIDA")
    .sort((a, b) => {
      const partidaA = partidas.find((p) => p.id === a.partidaId);
      const partidaB = partidas.find((p) => p.id === b.partidaId);
      if (!partidaA || !partidaB) return 0;
      const dataA = new Date(`${partidaA.data}T${partidaA.hora}`);
      const dataB = new Date(`${partidaB.data}T${partidaB.hora}`);
      return dataB.getTime() - dataA.getTime();
    });

  const getPartidaInfo = (partidaId: number) => {
    const partida = partidas.find((p) => p.id === partidaId);
    if (!partida)
      return { mandante: "", visitante: "", competicao: "", data: "", hora: "", dataFormatada: "" };

    const mandante = equipes.find((e) => e.id === partida.mandanteId)?.nome || "";
    const visitante = equipes.find((e) => e.id === partida.visitanteId)?.nome || "";
    const competicao = competicoes.find((c) => c.id === partida.competicaoId)?.nome || "";
    const [ano, mes, dia] = partida.data.split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;
    const horaFormatada = partida.hora.substring(0, 5);

    return { mandante, visitante, competicao, data: partida.data, hora: horaFormatada, dataFormatada };
  };

  const getItensOperacao = (operacaoId: number): OperacaoItem[] => {
    if (!relatorios?.itens) return [];
    return relatorios.itens.filter((item: OperacaoItem) => item.operacaoId === operacaoId);
  };

  const getEstrategiaInfo = (estrategiaId: number) => {
    const estrategia = estrategias.find((e) => e.id === estrategiaId);
    if (!estrategia) return { nome: "", mercadoNome: "" };
    const mercado = mercados.find((m) => m.id === estrategia.mercadoId);
    return { nome: estrategia.nome, mercadoNome: mercado?.nome || "" };
  };

  const calcularEstatisticas = (itens: OperacaoItem[]) => {
    const totalStake = itens.reduce((acc, item) => acc + parseFloat(item.stake || "0"), 0);
    const resultadoTotal = itens.reduce((acc, item) => acc + parseFloat(item.resultadoFinanceiro || "0"), 0);
    const roi = totalStake > 0 ? (resultadoTotal / totalStake) * 100 : 0;
    return { totalStake, resultadoTotal, roi, numItens: itens.length };
  };

  if (isLoadingOperacoes) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">Carregando operações...</div>
      </div>
    );
  }

  // === Render ===
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Operações Concluídas</h1>
        <p className="text-muted-foreground mt-1">
          Histórico de operações finalizadas com resumos completos
        </p>
      </div>

      {operacoesConcluidas.length === 0 ? (
        <Card
          className={
            isDarkMode
              ? "bg-[#2a2b2e] border border-[#44494d] shadow-sm"
              : "bg-white border border-gray-200 shadow-sm"
          }
        >
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma operação concluída. As operações aparecem aqui após serem finalizadas na tela de Partidas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {operacoesConcluidas.map((operacao) => {
            const info = getPartidaInfo(operacao.partidaId);
            const itens = getItensOperacao(operacao.id);
            const stats = calcularEstatisticas(itens);

            return (
              <Card
                key={operacao.id}
                data-testid={`card-operacao-${operacao.id}`}
                className={
                  isDarkMode
                    ? "bg-[#2a2b2e] border border-[#44494d] shadow-sm"
                    : "bg-white border border-gray-200 shadow-sm"
                }
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-2">
                        {info.competicao} {info.mandante} vs {info.visitante}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div className="flex items-center gap-2">
                          <span>Partida: {info.dataFormatada} às {info.hora}</span>
                          <Badge variant="default" className="ml-1">Concluída</Badge>
                        </div>
                        {operacao.dataConclusao && (
                          <div>
                            em{" "}
                            {(() => {
                              const d = new Date(operacao.dataConclusao);
                              const dia = String(d.getDate()).padStart(2, "0");
                              const mes = String(d.getMonth() + 1).padStart(2, "0");
                              const ano = d.getFullYear();
                              const hora = String(d.getHours()).padStart(2, "0");
                              const min = String(d.getMinutes()).padStart(2, "0");
                              return `${dia}/${mes}/${ano} às ${hora}:${min}`;
                            })()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/operacoes/${operacao.partidaId}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/operacoes/${operacao.partidaId}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-muted/30 p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Itens</div>
                      <div className="text-lg font-mono font-bold">{stats.numItens}</div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Total Investido</div>
                      <div className="text-lg font-mono font-bold">
                        R$ {stats.totalStake.toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Resultado</div>
                      <div
                        className={`text-lg font-mono font-bold flex items-center gap-1 ${
                          stats.resultadoTotal > 0
                            ? "text-green-600 dark:text-green-400"
                            : stats.resultadoTotal < 0
                            ? "text-red-600 dark:text-red-400"
                            : ""
                        }`}
                      >
                        {stats.resultadoTotal > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : stats.resultadoTotal < 0 ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : null}
                        R$ {stats.resultadoTotal.toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">ROI</div>
                      <div
                        className={`text-lg font-mono font-bold ${
                          stats.roi > 0
                            ? "text-green-600 dark:text-green-400"
                            : stats.roi < 0
                            ? "text-red-600 dark:text-red-400"
                            : ""
                        }`}
                      >
                        {stats.roi.toFixed(2).replace(".", ",")}%
                      </div>
                    </div>
                  </div>

                  {itens.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Itens da Operação</h3>
                      <div className="space-y-1.5">
                        {itens.map((item) => {
                          const estrategiaInfo = getEstrategiaInfo(item.estrategiaId);
                          const resultado = item.resultadoFinanceiro
                            ? parseFloat(item.resultadoFinanceiro)
                            : 0;

                          return (
                            <div
                              key={item.id}
                              className="bg-muted/20 px-3 py-2 rounded-md text-sm flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline">
                                  {estrategiaInfo.mercadoNome}
                                </Badge>
                                <Badge>{estrategiaInfo.nome}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  Stake: R$ {parseFloat(item.stake).toFixed(2).replace(".", ",")}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Entrada: {parseFloat(item.oddEntrada).toFixed(2).replace(".", ",")}
                                </span>
                                {item.oddSaida && (
                                  <span className="text-xs text-muted-foreground">
                                    Saída: {parseFloat(item.oddSaida).toFixed(2).replace(".", ",")}
                                  </span>
                                )}
                              </div>
                              <div
                                className={`font-mono font-semibold flex-shrink-0 ${
                                  resultado > 0
                                    ? "text-green-600 dark:text-green-400"
                                    : resultado < 0
                                    ? "text-red-600 dark:text-red-400"
                                    : ""
                                }`}
                              >
                                R$ {resultado.toFixed(2).replace(".", ",")}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
