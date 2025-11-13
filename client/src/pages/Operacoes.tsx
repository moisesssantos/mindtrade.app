import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, TrendingDown, TrendingUp, Edit } from "lucide-react";
import { useLocation } from "wouter";
import DateNavigator from "@/components/DateNavigator";
import { isSameDay, parseISO } from "date-fns";
import { ListFilter } from "lucide-react";

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
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [mostrarTudo, setMostrarTudo] = useState(true);

  // === Queries principais ===
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
    .filter((op) => {
      if (mostrarTudo) return true;
      const partida = partidas.find((p) => p.id === op.partidaId);
      if (!partida) return false;
      const dataPartida = parseISO(partida.data);
      return isSameDay(dataPartida, dataSelecionada);
    })
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

  // === Modo escuro ===
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

  if (isLoadingOperacoes) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">Carregando operações...</div>
      </div>
    );
  }

  // === Renderização ===
  return (
    <div className="container mx-auto px-4 py-8">

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold">Operações Concluídas</h1>
          <p className="text-muted-foreground mt-1">
            Histórico de operações finalizadas com resumos completos
          </p>
        </div>

        <div className="flex-shrink-0 flex gap-2 flex-wrap justify-end">
          <DateNavigator
            onChange={(novaData) => {
              setDataSelecionada(novaData);
              setMostrarTudo(false);
            }}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarTudo(true)}
            className="flex items-center gap-1"
          >
            <ListFilter className="w-4 h-4" />
            <span className="hidden sm:inline">Tudo</span>
          </Button>
        </div>
      </div>

      {operacoesConcluidas.length === 0 ? (
        <Card className={isDarkMode ? "bg-[#2a2b2e] border border-[#44494d]" : "bg-white border border-gray-200"}>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma operação concluída até o momento.
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
                className={isDarkMode ? "bg-[#2a2b2e] border border-[#44494d]" : "bg-white border border-gray-200"}
              >
                <CardHeader>

                  {/* 📌 TÍTULO AJUSTADO */}
                  <CardTitle className="text-lg mb-1">
                    {info.competicao} - {info.mandante} vs {info.visitante}
                  </CardTitle>
                  
                  <p className="text-sm text-muted-foreground">
                    {info.dataFormatada} às {info.hora} — <Badge>Concluída</Badge>
                  </p>
                </CardHeader>
                <CardContent>

                  {/* 📌 MÉTRICAS EM LINHA */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-muted/30 p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Itens</div>
                      <div className="text-lg font-mono font-bold">{stats.numItens}</div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Total Investido</div>
                      <div className="text-lg font-mono font-bold">R$ {stats.totalStake.toFixed(2).replace(".", ",")}</div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">Resultado</div>
                      <div className={`text-lg font-mono font-bold flex items-center gap-1 ...`}>
                        ...
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-md">
                      <div className="text-xs text-muted-foreground mb-1">ROI</div>
                      <div className={`text-lg font-mono font-bold ...`}>
                        {stats.roi.toFixed(2).replace(".", ",")}% 
                      </div>
                    </div>
                  </div>

                  {/* ==== ITENS DA OPERAÇÃO ==== */}
                  {itens.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Operações</h3>

                      <div className="space-y-1.5">
                        {itens.map((item) => {
                          const estrategiaInfo = getEstrategiaInfo(item.estrategiaId);
                          const resultado = item.resultadoFinanceiro
                            ? parseFloat(item.resultadoFinanceiro)
                            : 0;

                          return (
                            <div
                              key={item.id}
                              className={`px-3 py-2 rounded-md flex justify-between gap-2 ${
                                isDarkMode
                                  ? "bg-[#2a2b2e] border border-[#44494d]"
                                  : "bg-white border border-gray-200"
                              }`}
                            >
                              {/* ESQUERDA */}
                              <div className="flex flex-col gap-2 flex-1">
                                <div className="flex flex-wrap items-center gap-2 w-full">
                                  <Badge variant="outline">{estrategiaInfo.mercadoNome}</Badge>
                                  <Badge>{estrategiaInfo.nome}</Badge>

                                  <span className="text-xs text-muted-foreground">
                                    <strong>Stake:</strong> R$ {parseFloat(item.stake).toFixed(2).replace(".", ",")}
                                  </span>

                                  <span className="text-xs text-muted-foreground">
                                    Entrada: {parseFloat(item.oddEntrada).toFixed(2).replace(".", ",")}
                                  </span>

                                  {item.oddSaida && (
                                    <span className="text-xs text-muted-foreground">
                                      Saída: {parseFloat(item.oddSaida).toFixed(2).replace(".", ",")}
                                    </span>
                                  )}

                                  {/* RESULTADO → topo direita */}
                                  <span
                                    className={`ml-auto font-mono font-semibold text-xs ${
                                      resultado > 0
                                        ? "text-green-600 dark:text-green-400"
                                        : resultado < 0
                                        ? "text-red-600 dark:text-red-400"
                                        : ""
                                    }`}
                                  >
                                    R$ {resultado.toFixed(2).replace(".", ",")}
                                  </span>
                                </div>

                                {/* OBSERVAÇÃO */}
                                {item.motivacaoSaidaObservacao && (
                                  <div className="mt-1 w-full rounded-md bg-muted/30 p-2 text-xs text-muted-foreground whitespace-pre-wrap">
                                    <span
                                      className="font-semibold text-white px-2 py-0.5 rounded"
                                      style={{ backgroundColor: "#5F2C82" }}
                                    >
                                      Obs:
                                    </span>{" "}
                                    {item.motivacaoSaidaObservacao}
                                  </div>
                                )}
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
