import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MetricCard from "@/components/MetricCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";
import {
  TrendingUp,
  Target,
  Award,
  BarChart3,
  ArrowRight,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,

} from "recharts";

import { useLocation } from "wouter";
import { format, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createPortal } from "react-dom";

function PortalTooltip({ children }) {
  return createPortal(children, document.body);
}

type Operacao = {
  id: number;
  partidaId: number;
  status: string;
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
};

type Mercado = { id: number; nome: string };
type Partida = {
  id: number;
  competicaoId: number;
  mandanteId: number;
  visitanteId: number;
  data: string;
};
type Equipe = { id: number; nome: string };
type Transacao = {
  id: number;
  tipo: "DEPOSITO" | "SAQUE";
  valor: string;
  data: string;
  descricao: string | null;
};

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [semanaBase, setSemanaBase] = useState(new Date());

  // Detecta e acompanha mudanças no tema (dark/light)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 🟢 Estado para controlar o hover nas bolhas
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 🔥 Tooltip do Heatmap
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tooltipData, setTooltipData] = useState(null);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDarkMode(root.classList.contains("dark"));
    update(); // checa já na montagem

    // Observa mudanças na classe do <html>
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const { data: relatoriosData, isLoading } = useQuery<{
    operacoes: Operacao[];
    itens: OperacaoItem[];
  }>({
    queryKey: ["/api/relatorios"],
  });

  const { data: mercados = [] } = useQuery<Mercado[]>({
    queryKey: ["/api/mercados"],
  });

  const { data: partidas = [] } = useQuery<Partida[]>({
    queryKey: ["/api/partidas"],
  });

  const { data: equipes = [] } = useQuery<Equipe[]>({
    queryKey: ["/api/equipes"],
  });

  const { data: transacoes = [] } = useQuery<Transacao[]>({
    queryKey: ["/api/transacoes"],
  });

  // Adicionando a consulta para as estratégias
  const { data: estrategias = [] } = useQuery<Estrategia[]>({
    queryKey: ["/api/estrategias"], // Aqui você busca as estratégias
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const operacoes = relatoriosData?.operacoes || [];
  const itens = relatoriosData?.itens || [];

  // Verifica se "estrategias" foi carregado
  console.log(estrategias);

  // Cálculos gerais
  const totalOperacoes = new Set(itens.map((item) => item.operacaoId)).size;
  const totalStake = itens.reduce(
    (acc, item) => acc + parseFloat(item.stake || "0"),
    0,
  );
  const lucroTotal = itens.reduce(
    (acc, item) => acc + parseFloat(item.resultadoFinanceiro || "0"),
    0,
  );
  const roi = totalStake > 0 ? (lucroTotal / totalStake) * 100 : 0;
  const operacoesLucrativas = itens.filter(
    (item) => parseFloat(item.resultadoFinanceiro || "0") > 0,
  ).length;
  const taxaAcerto =
    itens.length > 0 ? (operacoesLucrativas / itens.length) * 100 : 0;
  const mediaPorOperacao = totalOperacoes > 0 ? lucroTotal / totalOperacoes : 0;

  // Dados diários (últimos 30 dias)
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  const diasPassados = 30;
  const dailyData = [];

  for (let i = diasPassados - 1; i >= 0; i--) {
    const dia = new Date(hoje);
    dia.setDate(hoje.getDate() - i);
    const diaInicio = new Date(
      dia.getFullYear(),
      dia.getMonth(),
      dia.getDate(),
      0,
      0,
      0,
    );
    const diaFim = new Date(
      dia.getFullYear(),
      dia.getMonth(),
      dia.getDate(),
      23,
      59,
      59,
    );

    const operacoesDia = operacoes.filter((op) => {
      const partida = partidas.find((p) => p.id === op.partidaId);
      if (!partida) return false;
      const partidaDate = new Date(partida.data);
      return partidaDate >= diaInicio && partidaDate <= diaFim;
    });

    const operacaoIdsDia = new Set(operacoesDia.map((op) => op.id));
    const itensDia = itens.filter((item) =>
      operacaoIdsDia.has(item.operacaoId),
    );
    const lucroDia = itensDia.reduce(
      (acc, item) => acc + parseFloat(item.resultadoFinanceiro || "0"),
      0,
    );

    dailyData.push({
      dia: format(dia, "dd/MM", { locale: ptBR }),
      lucro: lucroDia,
      operacoes: operacoesDia.length,
    });
  }

  // Calcular saldo atual da banca
  const depositosTotal = transacoes
    .filter((t) => t.tipo === "DEPOSITO")
    .reduce((acc, t) => acc + parseFloat(t.valor || "0"), 0);

  const saquesTotal = transacoes
    .filter((t) => t.tipo === "SAQUE")
    .reduce((acc, t) => acc + parseFloat(t.valor || "0"), 0);

  const saldoBanca = depositosTotal - saquesTotal + lucroTotal;

  // Dados por mercado (todos os mercados do ano) em percentual
  const anoAtual = new Date().getFullYear();

  const abreviarMercado = (nome: string) => {
    if (nome === "Ambas Marcam") return "BTTS";
    if (nome === "Correct Score") return "CS";
    return nome;
  };

  // Garante que 'mercados', 'itens', 'operacoes' e 'partidas' estão definidos no escopo acima
  const marketData = mercados.map((mercado) => {
    // Filtra os itens do mercado apenas do ano atual
    const itensMercadoAno = itens.filter((item) => {
      const operacao = operacoes.find((op) => op.id === item.operacaoId);
      if (!operacao) return false;

      const partida = partidas.find((p) => p.id === operacao.partidaId);
      if (!partida) return false;

      const ano = new Date(partida.data + "T00:00:00").getFullYear();
      return item.mercadoId === mercado.id && ano === anoAtual;
    });

    // Cálculos de lucro e ROI (corrigidos)
    const lucro = itensMercadoAno.reduce(
      (acc, item) => acc + parseFloat(item.resultadoFinanceiro || "0"),
      0
    );

    const stakeTotal = itensMercadoAno.reduce(
      (acc, item) => acc + parseFloat(item.stake || "0"),
      0
    );

    const roi = stakeTotal > 0 ? (lucro / stakeTotal) * 100 : 0;

    return {
      name: abreviarMercado(mercado.nome),
      lucro, // Lucro em R$
      roi,   // ROI em %
      itens: itensMercadoAno.length, // Número de operações
    };
  });

  // Dados por estado emocional (versão compatível com o dashboard)
  const estadosEmocionais = [
    ...new Set(itens.map((item) => item.estadoEmocional).filter(Boolean)),
  ];

  const emotionalData = estadosEmocionais.map((estado) => {
    const itensEstado = itens.filter((item) => item.estadoEmocional === estado);

    const lucro = itensEstado.reduce(
      (acc, item) => acc + Number(item.resultadoFinanceiro || 0),
      0
    );

    const stakeTotal = itensEstado.reduce(
      (acc, item) => acc + Number(item.stake || 0),
      0
    );

    const roi = stakeTotal > 0 ? (lucro / stakeTotal) * 100 : 0;

    return {
      name: estado,
      lucro,
      roi,
      count: itensEstado.length,
    };
  });

    // ===============================
    // 🔥 MINI HEATMAP – MOTIVAÇÃO × AUTOAVALIAÇÃO (LUCRO)
    // ===============================
    
    // Categorias vindas do BD
    const avaliacoes = [
      ...new Set(itens.map((i) => i.autoavaliacao).filter(Boolean))
    ];
    
    const motivacoes = [
      ...new Set(itens.map((i) => i.motivacaoEntrada).filter(Boolean))
    ];
    
    // Matriz compacta
    const heatmapMini = motivacoes.map((motivacao) => {
      const linha: Record<string, any> = { motivacao };
    
      avaliacoes.forEach((av) => {
        const itensMatch = itens.filter(
          (i) => i.motivacaoEntrada === motivacao && i.autoavaliacao === av
        );
    
        const quantidade = itensMatch.length;
        const lucro = itensMatch.reduce(
          (acc, item) => acc + Number(item.resultadoFinanceiro || 0),
          0
        );
    
        const stakeTotal = itensMatch.reduce(
          (acc, item) => acc + Number(item.stake || 0),
          0
        );
    
        const roi = stakeTotal > 0 ? (lucro / stakeTotal) * 100 : 0;
    
        linha[av] = {
          quantidade,
          lucro,
          roi,
        };
      });
    
      return linha;
    });
  
  // Dados da semana (7 dias baseado na semanaBase)
  const diasDaSemana = Array.from({ length: 7 }, (_, i) => addDays(semanaBase, i));

  const dadosSemana = diasDaSemana.map((dia) => {
    const diaInicio = new Date(
      dia.getFullYear(),
      dia.getMonth(),
      dia.getDate(),
      0,
      0,
      0,
    );
    const diaFim = new Date(
      dia.getFullYear(),
      dia.getMonth(),
      dia.getDate(),
      23,
      59,
      59,
    );

    const operacoesDia = operacoes.filter((op) => {
      const partida = partidas.find((p) => p.id === op.partidaId);
      if (!partida) return false;
      const partidaDate = new Date(partida.data + "T00:00:00");
      return partidaDate >= diaInicio && partidaDate <= diaFim;
    });

    const operacaoIdsDia = new Set(operacoesDia.map((op) => op.id));
    const itensDia = itens.filter((item) =>
      operacaoIdsDia.has(item.operacaoId),
    );
    const lucroDia = itensDia.reduce(
      (acc, item) => acc + parseFloat(item.resultadoFinanceiro || "0"),
      0,
    );
    const percentualBanca = saldoBanca > 0 ? (lucroDia / saldoBanca) * 100 : 0;

    const diaAbrev = format(dia, "EEEE", { locale: ptBR });
    const diaFormatado =
      diaAbrev.substring(0, 3).charAt(0).toUpperCase() +
      diaAbrev.substring(1, 3).toLowerCase();

    return {
      data: dia,
      diaSemana: diaFormatado,
      lucro: lucroDia,
      percentualBanca,
      operacoes: operacoesDia.length,
      temDados: operacoesDia.length > 0,
    };
  });

  const textoSemana = `${format(semanaBase, "d", { locale: ptBR })} - ${format(addDays(semanaBase, 6), "d MMM yyyy", { locale: ptBR })}`;

  // Agregações por Estratégia
  const porEstrategia = (estrategias || [])
  .map((estrategia) => {
    const itensEstrategia = itens.filter(
      (item) => item.estrategiaId === estrategia.id
    );

    const stakeTotal = itensEstrategia.reduce(
      (acc, item) => acc + parseFloat(item.stake || "0"),
      0
    );

    const lucro = itensEstrategia.reduce(
      (acc, item) => acc + parseFloat(item.resultadoFinanceiro || "0"),
      0
    );

    const roiEstrategia = stakeTotal > 0 ? (lucro / stakeTotal) * 100 : 0;

    // 🔗 liga a estratégia ao nome do mercado correspondente
    const mercadoNome =
      mercados.find((m) => m.id === estrategia.mercadoId)?.nome || "Outros";

    return {
      estrategia: estrategia.nome,
      mercado: mercadoNome, // novo campo usado na cor da bolha
      lucro,
      roi: roiEstrategia,
      operacoes: itensEstrategia.length,
    };
  })
  .filter((item) => item.operacoes > 0);

  // Verificar se os dados foram corretamente agregados
  console.log("Dados por estratégia:", porEstrategia);


  // Análise comportamental
  const seguiuPlanoSim = itens.filter((item) => item.seguiuPlano === true);
  const seguiuPlanoNao = itens.filter((item) => item.seguiuPlano === false);

  const stakeSeguiuSim = seguiuPlanoSim.reduce(
    (acc, item) => acc + parseFloat(item.stake || "0"),
    0,
  );
  const lucroSeguiuSim = seguiuPlanoSim.reduce(
    (acc, item) => acc + parseFloat(item.resultadoFinanceiro || "0"),
    0,
  );
  const roiSeguiuSim =
    stakeSeguiuSim > 0 ? (lucroSeguiuSim / stakeSeguiuSim) * 100 : 0;

  const stakeSeguiuNao = seguiuPlanoNao.reduce(
    (acc, item) => acc + parseFloat(item.stake || "0"),
    0,
  );
  const lucroSeguiuNao = seguiuPlanoNao.reduce(
    (acc, item) => acc + parseFloat(item.resultadoFinanceiro || "0"),
    0,
  );
  const roiSeguiuNao =
    stakeSeguiuNao > 0 ? (lucroSeguiuNao / stakeSeguiuNao) * 100 : 0;

  // =======================
  // MAPA DE CORES (fora do JSX)
  // =======================
  const mercadosUsados = Array.from(new Set(porEstrategia.map((e) => e.mercado)));

  const coresDisponiveis = [
    "#3b82f6", // azul
      "#10b981", // verde
      "#8b5cf6", // roxo
      "#f59e0b", // laranja
      "#ec4899", // rosa
      "#06b6d4", // ciano
      "#94a3b8", // cinza fallback
  ];

  // Mapa consistente entre mercado e cor atribuída
  const mapaCores = mercadosUsados.reduce((acc, nome, i) => {
    acc[nome] = coresDisponiveis[i % coresDisponiveis.length];
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do seu desempenho em trading esportivo
          </p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <MetricCard
            title="Lucro Total"
            value={`R$ ${lucroTotal.toFixed(2).replace(".", ",")}`}
            icon={TrendingUp}
          />
          <MetricCard
            title="ROI"
            value={`${roi.toFixed(1).replace(".", ",")}%`}
            icon={Target}
          />
          <MetricCard
            title="Taxa de Acerto"
            value={`${taxaAcerto.toFixed(0)}%`}
            icon={Award}
          />
          <MetricCard
            title="Média por Operação"
            value={`R$ ${mediaPorOperacao.toFixed(2).replace(".", ",")}`}
            icon={BarChart3}
          />
        </div>

          {/* Linha compacta de Resultados Semanais */}
          <Card
            className={`relative p-4 mb-4 transition-all duration-300 overflow-visible ${
              isDarkMode
                ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-[0_0_15px_rgba(80,80,120,0.2)]"
                : "bg-white border border-gray-200 shadow-sm"
            }`}
          >
            {/* Seta esquerda fixa */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSemanaBase(subDays(semanaBase, 1))}
                className="h-8 w-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          
            {/* Conteúdo rolável com scrollbar oculta */}
            <div
              className="px-10 scroll-smooth overflow-x-auto"
              style={{
                scrollbarWidth: "none", // Firefox
                msOverflowStyle: "none", // IE 10+
              }}
            >
              <div
                className="flex items-center text-sm font-mono whitespace-nowrap flex-nowrap gap-3"
                style={{
                  overflow: "hidden",
                }}
              >
                {dadosSemana.map((dia, index) => {
                  const lucroPositivo = dia.percentualBanca >= 0;
                  const lucroCor = lucroPositivo
                    ? isDarkMode
                      ? "text-green-400"
                      : "text-green-600"
                    : isDarkMode
                    ? "text-red-400"
                    : "text-red-600";
          
                  return (
                    <React.Fragment key={index}>
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-md min-w-max ${
                          dia.temDados ? "" : "opacity-50"
                        }`}
                      >
                        <div className="flex gap-1 items-center">
                          <span className="text-primary font-bold">
                            {format(dia.data, "EEEE", { locale: ptBR }).charAt(0).toUpperCase()}
                          </span>
                          <span className="font-bold">
                            {format(dia.data, "dd/MM")}
                          </span>
                        </div>
          
                        {dia.temDados ? (
                          <div className="flex gap-1 items-center">
                            <span className={lucroCor}>
                              {dia.percentualBanca >= 0 ? "+" : ""}
                              {dia.percentualBanca.toFixed(1).replace(".", ",")}%
                            </span>
                            <span className={lucroCor}>
                              R$ {Math.abs(dia.lucro).toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-muted-foreground">{dia.operacoes} Op.</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sem dados</span>
                        )}
                      </div>
          
                      {index < dadosSemana.length - 1 && (
                        <span className="text-muted-foreground">|</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          
            {/* Seta direita fixa */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSemanaBase(addDays(semanaBase, 1))}
                className="h-8 w-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>    

          {/* Grid de gráficos e demais cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">    
          
          {/* Gráfico de Lucro Acumulado no Ano */}
            <Card
              className={`p-4 lg:col-span-6 transition-all duration-300 ${
                isDarkMode
                  ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-[0_0_15px_rgba(80,80,120,0.2)]"
                  : "bg-white border border-gray-200 shadow-sm"
              }`}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold" style={{ color: "#0099DD" }}>
                  Evolução do Lucro (Acumulado no Ano)
                </h3>
              </div>
            
              {(() => {
                const hoje = new Date();
                const anoAtual = hoje.getFullYear();
                const inicioAno = new Date(anoAtual, 0, 1);
                const fimAno = new Date(anoAtual, 11, 31, 23, 59, 59);
                const diasNoAno = Math.ceil((fimAno.getTime() - inicioAno.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            
                const dataAcumulada = [];
                let acumulado = 0;
            
                for (let i = 0; i < diasNoAno; i++) {
                  const dia = new Date(inicioAno);
                  dia.setDate(inicioAno.getDate() + i);
            
                  const diaInicio = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 0, 0, 0);
                  const diaFim = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), 23, 59, 59);
            
                  const operacoesDia = operacoes.filter((op) => {
                    const partida = partidas.find((p) => p.id === op.partidaId);
                    if (!partida) return false;
                    const partidaDate = new Date(partida.data);
                    return partidaDate >= diaInicio && partidaDate <= diaFim;
                  });
            
                  const operacaoIdsDia = new Set(operacoesDia.map((op) => op.id));
                  const itensDia = itens.filter((item) => operacaoIdsDia.has(item.operacaoId));
                  const lucroDia = itensDia.reduce((acc, item) => acc + parseFloat(item.resultadoFinanceiro || "0"), 0);
            
                  acumulado += lucroDia;
            
                  dataAcumulada.push({
                    dia: format(dia, "dd/MM", { locale: ptBR }),
                    acumulado,
                  });
                }
            
                return dataAcumulada.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={dataAcumulada}
                    margin={{ top: 5, right: 5, bottom: 5, left: 0 }}   // 🔥 bordas internas reduzidas
                    style={{
                      backgroundColor: isDarkMode ? "transparent" : "#ffffff",
                      borderRadius: "8px",
                      padding: "0px",   // 🔥 remove bordas internas
                    }}
                  >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDarkMode ? "hsl(var(--border))" : "#e2e8f0"}
                      />
                      <XAxis
                        dataKey="dia"
                        stroke={isDarkMode ? "hsl(var(--muted-foreground))" : "#334155"}
                        fontSize={10}
                        interval={30}
                      />
                      <YAxis
                        stroke={isDarkMode ? "hsl(var(--muted-foreground))" : "#334155"}
                        fontSize={12}
                      />
                      <Tooltip
                        wrapperStyle={{ background: "none", boxShadow: "none" }}
                        contentStyle={{
                          background: "none",
                          border: "none",
                          boxShadow: "none",
                          padding: 0,
                        }}
                        cursor={{
                          stroke: isDarkMode ? "hsl(var(--border))" : "#cbd5e1",
                          strokeWidth: 1,
                        }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const p = payload[0].payload;
                      
                            return (
                              <div
                                style={{
                                  backgroundColor: isDarkMode
                                    ? "rgba(20,20,30,0.9)"
                                    : "rgba(255,255,255,0.95)",
                                  border: isDarkMode
                                    ? "1px solid hsl(var(--border))"
                                    : "1px solid #cbd5e1",
                                  borderRadius: "8px",
                                  padding: "8px 10px",
                                  color: isDarkMode ? "#f8fafc" : "#0f172a",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  minWidth: "140px",
                                  boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                                  backdropFilter: "blur(6px)",
                                }}
                              >
                                <div style={{ fontWeight: 700, marginBottom: 4, color: "#0099DD" }}>
                                  {p.dia}
                                </div>
                      
                                <span style={{ color: p.acumulado >= 0 ? "#3b82f6" : "#ef4444" }}>
                                  R$ {p.acumulado.toFixed(2).replace(".", ",")}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="acumulado"
                        stroke={isDarkMode ? "hsl(var(--primary))" : "#2563eb"}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                );
              })()}
            </Card>

         {/* MINI HEATMAP – Motivação × Autoavaliação */}
          <Card
            className={`relative p-4 lg:col-span-6 transition-all duration-300 overflow-visible ${
              isDarkMode
                ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-[0_0_15px_rgba(80,80,120,0.2)]"
                : "bg-white border border-gray-200 shadow-sm"
            }`}
          >
            {/* TOOLTIP VIA PORTAL */}
            {tooltipData && (
              <PortalTooltip>
                <div
                  style={{
                    position: "fixed",
                    left: tooltipPos.x + 15,
                    top: tooltipPos.y + 15,
                    transform: "translateZ(999px)", // força camada superior
                    backgroundColor: isDarkMode
                      ? "rgba(30,41,59,0.88)"
                      : "rgba(255,255,255,0.96)",
                    border: isDarkMode
                      ? "1px solid rgba(255,255,255,0.15)"
                      : "1px solid #cbd5e1",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    color: isDarkMode ? "#f8fafc" : "#0f172a",
                    fontSize: 12,
                    fontWeight: 600,
                    boxShadow: "0 0 18px rgba(0,0,0,0.45)",
                    backdropFilter: "blur(8px)",
                    pointerEvents: "none",
                    zIndex: 9999999999,
                    maxWidth: "260px",
                    whiteSpace: "normal",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 6,
                      color: tooltipData.lucro >= 0
                        ? (isDarkMode ? "#22c55e" : "#16a34a") // VERDE OFICIAL
                        : "#dc2626",
                    }}
                  >
                    {tooltipData.motivacao}
                  </div>
          
                  <div style={{ marginBottom: 4 }}>
                    Avaliação: <b>{tooltipData.avaliacao}</b>
                  </div>
          
                  <div
                    style={{
                      color: tooltipData.lucro >= 0
                        ? (isDarkMode ? "#22c55e" : "#16a34a") // VERDE OFICIAL
                        : "#dc2626",
                    }}
                  >
                    Lucro:
                    <b> R$ {tooltipData.lucro.toFixed(2).replace(".", ",")}</b>
                  </div>
          
                  <div
                    style={{
                      color: tooltipData.roi >= 0 ? "#3b82f6" : "#ef4444",
                      marginTop: 2,
                    }}
                  >
                    ROI:
                    <b> {tooltipData.roi.toFixed(2).replace(".", ",")}%</b>
                  </div>
          
                  <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
                    {tooltipData.quantidade} operações
                  </div>
                </div>
              </PortalTooltip>
            )}
          
            <div className="mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "#0099DD" }}>
                Motivação × Autoavaliação (Lucro)
              </h3>
            </div>
          
            {/* Cabeçalho: Autoavaliações */}
            <div className="grid grid-cols-[140px_repeat(auto-fit,minmax(20px,1fr))] gap-2 mb-2">
              <div></div>
              {avaliacoes.map((av) => (
                <div
                  key={av}
                  className="text-[11px] text-center font-medium text-muted-foreground"
                >
                  {av}
                </div>
              ))}
            </div>
          
            {/* Linhas */}
            <div className="flex flex-col gap-3">
              {heatmapMini.map((linha) => (
                <div
                  key={linha.motivacao}
                  className="grid grid-cols-[140px_repeat(auto-fit,minmax(20px,1fr))] gap-2 items-center"
                >
                  {/* Motivação */}
                  <div className="text-xs font-semibold text-primary">
                    {linha.motivacao}
                  </div>
          
                  {/* CÉLULAS */}
                  {avaliacoes.map((av) => {
                    const cell = linha[av];
                    const lucro = cell.lucro;
                    const quantidade = cell.quantidade;
                    const roi = cell.roi;
          
                    // COR DO HEATMAP
                    let cor = isDarkMode
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.05)";
          
                    if (lucro > 0) {
                      cor = `rgba(16, 185, 129, ${
                        0.25 + Math.min(Math.abs(lucro) / 200, 0.65)
                      })`; // verde translúcido
                    } else if (lucro < 0) {
                      cor = `rgba(220,38,38,${
                        0.25 + Math.min(Math.abs(lucro) / 200, 0.65)
                      })`;
                    }
          
                    return (
                      <div
                        key={av}
                        className="w-full h-6 rounded-md border transition-all hover:scale-[1.08] cursor-pointer"
                        style={{
                          backgroundColor: cor,
                          borderColor: isDarkMode
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.1)",
                        }}
                        onMouseMove={(e) => {
                          setTooltipPos({ x: e.clientX, y: e.clientY });
                          setTooltipData({
                            motivacao: linha.motivacao,
                            avaliacao: av,
                            lucro,
                            roi,
                            quantidade,
                          });
                        }}
                        onMouseLeave={() => setTooltipData(null)}
                      ></div>
                    );
                  })}
                </div>
              ))}
            </div>
          </Card>

          {/* Gráfico de Lucro e ROI por Mercado */}
          <Card
            className={`p-4 lg:col-span-6 ${
              isDarkMode
                ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-[0_0_15px_rgba(80,80,120,0.2)]"
                : "bg-white border border-gray-200 shadow-sm"
            }`}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "#0099DD" }}>Lucro e ROI por Mercado</h3>
            </div>

            {marketData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={marketData}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
                >
                  {/* Efeito de brilho */}
                  <defs>
                    <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Grade e eixos */}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "hsl(var(--border))" : "#e2e8f0"}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke={isDarkMode ? "hsl(var(--muted-foreground))" : "#334155"}
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: isDarkMode ? "hsl(var(--border))" : "#cbd5e1" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke={isDarkMode ? "hsl(var(--muted-foreground))" : "#334155"}
                    fontSize={13}
                    width={110}
                    tickLine={false}
                    axisLine={{ stroke: isDarkMode ? "hsl(var(--border))" : "#cbd5e1" }}
                  />

                  <ReferenceLine
                    x={0}
                    stroke={isDarkMode ? "hsl(var(--border))" : "#94a3b8"}
                    strokeWidth={3}
                  />

                  {/* Tooltip com efeito vidro */}
                  <Tooltip
                    wrapperStyle={{ background: "none", boxShadow: "none" }}
                    contentStyle={{
                      background: "none",
                      border: "none",
                      boxShadow: "none",
                      padding: 0,
                    }}
                    cursor={{
                      stroke: isDarkMode ? "hsl(var(--border))" : "#cbd5e1",
                      strokeWidth: 1,
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const p = payload[0].payload;
                  
                        const corLucro = p.lucro >= 0 ? "#3b82f6" : "#ef4444";
                        const corRoi = p.roi >= 0 ? "#3b82f6" : "#ef4444";
                  
                        return (
                          <div
                            style={{
                              backgroundColor: isDarkMode
                                ? "rgba(20,20,30,0.9)"
                                : "rgba(255,255,255,0.95)",
                              border: isDarkMode
                                ? "1px solid hsl(var(--border))"
                                : "1px solid #cbd5e1",
                              borderRadius: "8px",
                              padding: "8px 10px",
                              color: isDarkMode ? "#f8fafc" : "#0f172a",
                              fontSize: 13,
                              fontWeight: 600,
                              minWidth: "150px",
                              boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                              backdropFilter: "blur(6px)",
                            }}
                          >
                            <div style={{ fontWeight: 700, color: "#0099DD", marginBottom: 6 }}>
                              {p.name}
                            </div>
                  
                            <div style={{ color: corLucro }}>
                              Lucro: R$ {p.lucro.toFixed(2).replace(".", ",")}
                            </div>
                  
                            <div style={{ color: corRoi }}>
                              ROI: {p.roi.toFixed(2).replace(".", ",")}%
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Legenda aprimorada */}
                  <Legend
                    align="center"
                    verticalAlign="bottom"
                    content={() => (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "50px",
                          marginTop: "10px",
                          fontSize: "11px",
                          color: isDarkMode ? "hsl(var(--muted-foreground))" : "#334155",
                          fontWeight: 500,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: "#3b82f6",
                              boxShadow: "0 0 6px #3b82f6",
                            }}
                          />
                          Lucro (R$)
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: "#ef4444",
                              boxShadow: "0 0 6px #ef4444",
                            }}
                          />
                          ROI (%)
                        </div>
                      </div>
                    )}
                  />

                  {/* Lucro (R$) */}
                  <Bar
                    dataKey="lucro"
                    name="Lucro (R$)"
                    barSize={16} // 🔹 aumentei de 12 → 16 para barras mais encorpadas
                    radius={[3, 3, 3, 3]} // 🔹 bordas suavemente arredondadas (menos exageradas)
                  >
                    {marketData.map((entry, index) => (
                      <Cell
                        key={`lucro-cell-${index}`}
                        fill={
                          entry.lucro >= 0
                            ? isDarkMode
                              ? "hsl(var(--primary))"
                              : "#2563eb"
                            : "#E74C3C"
                        }
                        filter={entry.lucro >= 0 ? "url(#glow-blue)" : "url(#glow-red)"}
                      />
                    ))}
                  </Bar>

                  {/* ROI (%) */}
                  <Bar
                    dataKey="roi"
                    name="ROI (%)"
                    barSize={16} // 🔹 igual ao lucro, mantém simetria
                    radius={[3, 3, 3, 3]}
                  >
                    {marketData.map((entry, index) => (
                      <Cell
                        key={`roi-cell-${index}`}
                        fill={
                          entry.roi >= 0
                            ? isDarkMode
                              ? "#38bdf8"
                              : "#0ea5e9"
                            : "#6366f1"
                        }
                        filter={entry.roi >= 0 ? "url(#glow-blue)" : "url(#glow-red)"}
                      />
                    ))}
                  </Bar>

                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </Card>

          {/* Resultado por Estado Emocional */}
          <Card
            className={`p-4 lg:col-span-6 transition-all ${
              isDarkMode
                ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-[0_0_15px_rgba(80,80,120,0.2)]"
                : "bg-white border border-gray-200 shadow-sm"
            }`}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "#0099DD" }}>Lucro e ROI por Estado Emocional</h3>
              {/*<p className="text-sm text-muted-foreground">Lucro e ROI por estado</p>*/}
            </div>

            {emotionalData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={emotionalData} margin={{ right: 10 }}>
                  {/* Grade */}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "hsl(var(--border))" : "#e2e8f0"}
                  />

                  {/* Eixo X */}
                  <XAxis
                    dataKey="name"
                    stroke={isDarkMode ? "hsl(var(--muted-foreground))" : "#334155"}
                    fontSize={12}
                  />

                  {/* Eixo Y */}
                  <YAxis
                    stroke={isDarkMode ? "hsl(var(--muted-foreground))" : "#334155"}
                    fontSize={13}
                  />

                  {/* Linha de referência (zero) */}
                  <ReferenceLine
                    y={0}
                    stroke={isDarkMode ? "hsl(var(--border))" : "#94a3b8"}
                    strokeWidth={3}
                  />

                  {/* Tooltip customizada */}
                  <Tooltip
                    wrapperStyle={{ background: "none", boxShadow: "none" }}
                    contentStyle={{
                      background: "none",
                      border: "none",
                      boxShadow: "none",
                      padding: 0,
                    }}
                    cursor={{
                      stroke: isDarkMode ? "hsl(var(--border))" : "#cbd5e1",
                      strokeWidth: 1,
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const p = payload[0].payload;
                  
                        const corLucro = p.lucro >= 0 ? "#3b82f6" : "#ef4444";
                        const corRoi = p.roi >= 0 ? "#3b82f6" : "#ef4444";
                  
                        return (
                          <div
                            style={{
                              backgroundColor: isDarkMode
                                ? "rgba(20,20,30,0.9)"
                                : "rgba(255,255,255,0.95)",
                              border: isDarkMode
                                ? "1px solid hsl(var(--border))"
                                : "1px solid #cbd5e1",
                              borderRadius: "8px",
                              padding: "8px 10px",
                              color: isDarkMode ? "#f8fafc" : "#0f172a",
                              fontSize: 13,
                              fontWeight: 600,
                              minWidth: "150px",
                              boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                              backdropFilter: "blur(6px)",
                            }}
                          >
                            <div style={{ fontWeight: 700, marginBottom: 6, color: "#0099DD" }}>
                              {p.name}
                            </div>
                  
                            <div style={{ color: corLucro }}>
                              Lucro: R$ {p.lucro.toFixed(2).replace(".", ",")}
                            </div>
                  
                            <div style={{ color: corRoi }}>
                              ROI: {p.roi.toFixed(2).replace(".", ",")}%
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    align="center"
                    verticalAlign="bottom"
                    content={() => (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "50px", // 👈 controla o espaçamento entre os nomes
                          marginTop: "6px",
                          fontSize: "12px",
                          color: isDarkMode ? "hsl(var(--muted-foreground))" : "#334155",
                          fontWeight: 500,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: "#3b82f6",
                            }}
                          ></span>
                          Lucro (R$)
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: "#ef4444",
                            }}
                          ></span>
                          ROI (%)
                        </div>
                      </div>
                    )}
                  />

                  {/* Linha de Lucro com brilho e cor dinâmica */}
                  <defs>
                    <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <Line
                    type="natural"
                    dataKey="lucro"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    filter="url(#glow-blue)"
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      const color = payload.lucro >= 0 ? "#3b82f6" : "#ef4444";
                      const filterId = payload.lucro >= 0 ? "url(#glow-blue)" : "url(#glow-red)";
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={4.5}
                          stroke={color}
                          fill={color}
                          strokeWidth={1}
                          filter={filterId}
                        />
                      );
                    }}
                    activeDot={(props) => {
                      const { cx, cy, payload } = props;
                      const color = payload.lucro >= 0 ? "#3b82f6" : "#ef4444";
                      const filterId = payload.lucro >= 0 ? "url(#glow-blue)" : "url(#glow-red)";
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={6}
                          stroke={color}
                          fill={color}
                          strokeWidth={1.5}
                          filter={filterId}
                        />
                      );
                    }}
                    name="Lucro (R$)"
                  />

                  {/* Linha de ROI com brilho vermelho suave */}
                  <Line
                    type="natural"
                    dataKey="roi"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    filter="url(#glow-red)"
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      const color = payload.roi >= 0 ? "#3b82f6" : "#ef4444";
                      const filterId = payload.roi >= 0 ? "url(#glow-blue)" : "url(#glow-red)";
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={4.5}
                          stroke={color}
                          fill={color}
                          strokeWidth={1}
                          filter={filterId}
                        />
                      );
                    }}
                    activeDot={(props) => {
                      const { cx, cy, payload } = props;
                      const color = payload.roi >= 0 ? "#3b82f6" : "#ef4444";
                      const filterId = payload.roi >= 0 ? "url(#glow-blue)" : "url(#glow-red)";
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={6}
                          stroke={color}
                          fill={color}
                          strokeWidth={1.5}
                          filter={filterId}
                        />
                      );
                    }}
                    name="ROI (%)"
                  />

                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </Card>
        </div>

        {/*// =======================
        // COMPONENTE DO GRÁFICO
        // =======================*/}
        <Card
          className={`p-4 lg:col-span-6 transition-all ${
            isDarkMode
              ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-[0_0_15px_rgba(80,80,120,0.2)]"
              : "bg-white border border-gray-200 shadow-sm"
          } mt-2`}
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold" style={{ color: "#0099DD" }}>Performance por Método</h3>
            <p className="text-sm text-muted-foreground">
              Relação entre Lucro (R$), ROI (%) e número de operações
            </p>
          </div>

          {porEstrategia.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "hsl(var(--border))" : "#e2e8f0"}
                />

                {/* Eixos */}
                <XAxis
                  type="number"
                  dataKey="roi"
                  name="ROI (%)"
                  label={{
                    value: "ROI (%)",
                    position: "bottom",
                    style: {
                      fill: isDarkMode ? "#e2e8f0" : "#1e293b",
                      fontSize: 12,
                      fontWeight: 500,
                    },
                  }}
                  stroke={isDarkMode ? "hsl(var(--muted-foreground))" : "#334155"}
                  fontSize={12}
                />
                <YAxis
                  type="number"
                  dataKey="lucro"
                  name="Lucro (R$)"
                  label={{
                    value: "Lucro (R$)",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      fill: isDarkMode ? "#e2e8f0" : "#1e293b",
                      fontSize: 12,
                      fontWeight: 500,
                    },
                  }}
                  stroke={isDarkMode ? "hsl(var(--muted-foreground))" : "#334155"}
                  fontSize={12}
                />
                <ZAxis dataKey="operacoes" range={[80, 500]} name="Operações" />

                {/* Tooltip */}
                <Tooltip
                  wrapperStyle={{ background: "none", boxShadow: "none" }}
                  contentStyle={{
                    background: "none",
                    border: "none",
                    boxShadow: "none",
                    padding: 0,
                  }}
                  cursor={{
                    stroke: isDarkMode ? "hsl(var(--border))" : "#cbd5e1",
                    strokeWidth: 1,
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const p = payload[0].payload;
                      const color = mapaCores[p.mercado] || "#94a3b8";

                      const corROI = p.roi >= 0 ? "#3b82f6" : "#ef4444";
                      const corLucro = p.lucro >= 0 ? "#3b82f6" : "#ef4444";

                      return (
                        <div
                          style={{
                            backgroundColor: isDarkMode
                              ? "rgba(20,20,30,0.9)"
                              : "rgba(255,255,255,0.95)",
                            border: isDarkMode
                              ? "1px solid hsl(var(--border))"
                              : "1px solid #cbd5e1",
                            borderRadius: "8px",
                            padding: "8px 10px",
                            color: isDarkMode ? "#f8fafc" : "#0f172a",
                            fontSize: 13,
                            fontWeight: 600,
                            minWidth: "160px",
                            boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                            backdropFilter: "blur(6px)",
                          }}
                        >
                          {/* Estratégia */}
                          <div style={{ fontWeight: 700, marginBottom: 6, color }}>
                            {p.estrategia}
                          </div>

                          {/* ROI e Lucro lado a lado com separador */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              gap: "8px", // espaçamento entre ROI e Lucro
                              marginBottom: 4,
                            }}
                          >
                            <span style={{ whiteSpace: "nowrap" }}>
                              ROI:{" "}
                              <span style={{ color: corROI, fontWeight: 700 }}>
                                {p.roi.toFixed(2).replace(".", ",")}%
                              </span>
                            </span>

                            <span style={{ opacity: 0.5 }}>|</span>

                            <span style={{ whiteSpace: "nowrap" }}>
                              Lucro:{" "}
                              <span style={{ color: corLucro, fontWeight: 700 }}>
                                R$ {p.lucro.toFixed(2).replace(".", ",")}
                              </span>
                            </span>
                          </div>

                          {/* Operações */}
                          <div
                            style={{
                              fontSize: 12,
                              opacity: 0.8,
                              textAlign: "left", // 👉 Alinha à esquerda
                              marginTop: "4px",
                            }}
                          >
                            Op: {p.operacoes}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Linhas de referência */}
                <ReferenceLine
                  y={0}
                  stroke={isDarkMode ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"}
                  strokeWidth={3}
                  strokeDasharray="4 3"
                  ifOverflow="extendDomain"
                />
                <ReferenceLine
                  x={0}
                  stroke={isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}
                  strokeWidth={3}
                  strokeDasharray="3 3"
                  ifOverflow="extendDomain"
                />

                {/* Bolhas */}
                <Scatter
                  name="Estratégias"
                  data={porEstrategia}
                  line={false}
                  shape={(props) => {
                    const { cx, cy, payload, index } = props;
                    const isHovered = hoveredIndex === index;
                    const baseSize = payload.operacoes * 0.4 + 6;

                    // 🎨 cor base por mercado
                    const corBase = mapaCores[payload.mercado] || "#94a3b8";

                    // 🎛️ ajusta brilho conforme tamanho (quanto mais operações → cor mais escura)
                    const minOps = Math.min(...porEstrategia.map((e) => e.operacoes));
                    const maxOps = Math.max(...porEstrategia.map((e) => e.operacoes));
                    const fator =
                      maxOps > minOps
                        ? (payload.operacoes - minOps) / (maxOps - minOps)
                        : 0.5; // evita divisão por zero

                    // 🔥 função pra escurecer cor base conforme fator
                    const escurecer = (hex: string, intensidade: number) => {
                      const c = hex.replace("#", "");
                      const r = parseInt(c.substring(0, 2), 16);
                      const g = parseInt(c.substring(2, 4), 16);
                      const b = parseInt(c.substring(4, 6), 16);
                      const novoR = Math.max(0, Math.floor(r * (1 - intensidade * 0.4)));
                      const novoG = Math.max(0, Math.floor(g * (1 - intensidade * 0.4)));
                      const novoB = Math.max(0, Math.floor(b * (1 - intensidade * 0.4)));
                      return `rgb(${novoR}, ${novoG}, ${novoB})`;
                    };

                    const corFinal = escurecer(corBase, fator);

                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? baseSize + 3 : baseSize}
                        fill={corFinal}
                        stroke={corFinal}
                        style={{
                          transition: "all 0.25s ease-out",
                          cursor: "pointer",
                          filter: `drop-shadow(0 0 ${isHovered ? "12px" : "6px"} ${corFinal})`,
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    );
                  }}
                />

                {/* Legenda dinâmica */}
                <Legend
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{ marginBottom: -10 }}
                  content={() => {
                    const minOps = Math.min(...porEstrategia.map((e) => e.operacoes));
                    const maxOps = Math.max(...porEstrategia.map((e) => e.operacoes));
                    const step = Math.round((maxOps - minOps) / 3) || 1;
                    const exemplos = [minOps, minOps + step, minOps + step * 2, maxOps];

                    return (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          width: "100%",
                          marginTop: "24px",
                          padding: "0 40px",
                        }}
                      >
                        {/* 🎨 Legenda de Mercados (à esquerda) */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            gap: "20px",
                            flexWrap: "wrap",
                            fontSize: "12px",
                            color: isDarkMode
                              ? "hsl(var(--muted-foreground))"
                              : "#334155",
                            fontWeight: 500,
                            maxWidth: "65%",
                          }}
                        >
                          {mercadosUsados.map((mercado) => (
                            <div
                              key={mercado}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  backgroundColor: mapaCores[mercado],
                                  boxShadow: `0 0 6px ${mapaCores[mercado]}`,
                                }}
                              />
                              <span>{mercado}</span>
                            </div>
                          ))}
                        </div>

                        {/* ⚪ Escala de Tamanho (à direita) */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "24px",
                            flexWrap: "wrap",
                            maxWidth: "35%",
                          }}
                        >
                          {exemplos.map((qtd, i) => {
                            const tamanho = qtd * 0.4 + 6;
                            return (
                              <div
                                key={i}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <div
                                  style={{
                                    width: tamanho * 1.4,   // bolhas maiores
                                    height: tamanho * 1.4,
                                    borderRadius: "50%",
                                    backgroundColor: "#089FD4",      // azul do logotipo MindTrade
                                    opacity: 0.75,
                                    border: "1px solid #067aa7",     // borda azul mais escura
                                    boxShadow: "0 0 8px #089FD4",    // brilho suave
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: "11px",
                                    color: isDarkMode
                                      ? "hsl(var(--muted-foreground))"
                                      : "#475569",
                                    fontWeight: 500,
                                  }}
                                >
                                  {qtd} ops
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }}
                />

              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </Card>


        {/* Análise Comportamental */}
        {(seguiuPlanoSim.length > 0 || seguiuPlanoNao.length > 0) && (
          <Card
            className={`p-4 mt-4 ${
              isDarkMode
                ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
                : "bg-white border border-gray-200 shadow-sm"
            }`}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "#0099DD" }}>Análise Comportamental</h3>
              <p className="text-sm text-muted-foreground">
                Impacto de seguir o método de trading
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card: Seguiu o Método */}
              <div
                className={`p-4 rounded-lg border transition-all ${
                  isDarkMode
                    ? "bg-card border-primary/20"
                    : "bg-gray-50 border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Seguiu o Método
                  </span>
                  <Award
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-green-400" : "text-green-600"
                    }`}
                  />
                </div>
                <p
                  className={`text-3xl font-bold font-mono mb-2 ${
                    lucroSeguiuSim >= 0
                      ? isDarkMode
                        ? "text-green-400"
                        : "text-green-600"
                      : isDarkMode
                      ? "text-red-400"
                      : "text-red-600"
                  }`}
                >
                  {lucroSeguiuSim >= 0 ? "+" : ""}R${" "}
                  {Math.abs(lucroSeguiuSim).toFixed(2).replace(".", ",")}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    ROI:{" "}
                    <span className="font-mono font-semibold">
                      {roiSeguiuSim.toFixed(1).replace(".", ",")}%
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    {seguiuPlanoSim.length} itens
                  </span>
                </div>
              </div>

              {/* Card: Não Seguiu o Método */}
              <div
                className={`p-4 rounded-lg border transition-all ${
                  isDarkMode
                    ? "bg-card border-primary/20"
                    : "bg-gray-50 border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Não Seguiu o Método
                  </span>
                  <TrendingDown
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-red-400" : "text-red-600"
                    }`}
                  />
                </div>
                <p
                  className={`text-3xl font-bold font-mono mb-2 ${
                    lucroSeguiuNao >= 0
                      ? isDarkMode
                        ? "text-green-400"
                        : "text-green-600"
                      : isDarkMode
                      ? "text-red-400"
                      : "text-red-600"
                  }`}
                >
                  {lucroSeguiuNao >= 0 ? "+" : ""}R${" "}
                  {Math.abs(lucroSeguiuNao).toFixed(2).replace(".", ",")}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    ROI:{" "}
                    <span className="font-mono font-semibold">
                      {roiSeguiuNao.toFixed(1).replace(".", ",")}%
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    {seguiuPlanoNao.length} itens
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
