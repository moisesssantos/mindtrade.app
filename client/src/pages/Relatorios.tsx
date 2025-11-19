import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import MetricCard from "@/components/MetricCard";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, Target, Award, BarChart3, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
type Estrategia = { id: number; nome: string; mercadoId: number };
type Competicao = { id: number; nome: string };
type Equipe = { id: number; nome: string };
type Partida = {
  id: number;
  competicaoId: number;
  mandanteId: number;
  visitanteId: number;
  data: string;
};

export default function Relatorios() {
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    competicaoId: "all",
    equipeId: "all",
    mercadoId: "all",
    estrategiaId: "all",
  });

  // === Tema ===
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

  // === Consultas ===
  const { data: relatoriosData, isLoading } = useQuery<{
    operacoes: Operacao[];
    itens: OperacaoItem[];
  }>({
    queryKey: ["/api/relatorios"],
  });

  const { data: mercados = [] } = useQuery<Mercado[]>({
    queryKey: ["/api/mercados"],
  });

  const { data: estrategias = [] } = useQuery<Estrategia[]>({
    queryKey: ["/api/estrategias"],
  });

  const { data: competicoes = [] } = useQuery<Competicao[]>({
    queryKey: ["/api/competicoes"],
  });

  const { data: equipes = [] } = useQuery<Equipe[]>({
    queryKey: ["/api/equipes"],
  });

  const { data: partidas = [] } = useQuery<Partida[]>({
    queryKey: ["/api/partidas"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando relatórios...</div>
      </div>
    );
  }

  // === Preparação ===
  const operacoes = relatoriosData?.operacoes || [];
  const itens = relatoriosData?.itens || [];

  let itensFiltrados = itens;

  // === Filtros básicos ===
  if (
    filtros.dataInicio ||
    filtros.dataFim ||
    (filtros.competicaoId && filtros.competicaoId !== "all") ||
    (filtros.equipeId && filtros.equipeId !== "all")
  ) {
    const operacoesFiltradas = operacoes.filter((op) => {
      const partida = partidas.find((p) => p.id === op.partidaId);
      if (!partida) return false;

      if (filtros.dataInicio && partida.data < filtros.dataInicio) return false;
      if (filtros.dataFim && partida.data > filtros.dataFim) return false;

      if (
        filtros.competicaoId !== "all" &&
        partida.competicaoId !== parseInt(filtros.competicaoId)
      )
        return false;

      if (filtros.equipeId !== "all") {
        const eq = parseInt(filtros.equipeId);
        if (partida.mandanteId !== eq && partida.visitanteId !== eq)
          return false;
      }

      return true;
    });

    const ids = new Set(operacoesFiltradas.map((op) => op.id));
    itensFiltrados = itens.filter((item) => ids.has(item.operacaoId));
  }

  // === Filtro Mercado ===
  if (filtros.mercadoId !== "all") {
    itensFiltrados = itensFiltrados.filter(
      (item) => item.mercadoId === parseInt(filtros.mercadoId)
    );
  }

  // === Filtro Estratégia ===
  if (filtros.estrategiaId !== "all") {
    itensFiltrados = itensFiltrados.filter(
      (item) => item.estrategiaId === parseInt(filtros.estrategiaId)
    );
  }

  // === Estatísticas ===
  const totalOperacoes = new Set(itensFiltrados.map((i) => i.operacaoId)).size;
  const totalStake = itensFiltrados.reduce(
    (acc, item) => acc + parseFloat(item.stake || "0"),
    0
  );
  const lucroTotal = itensFiltrados.reduce(
    (acc, item) => acc + parseFloat(item.resultadoFinanceiro || "0"),
    0
  );
  const roi = totalStake > 0 ? (lucroTotal / totalStake) * 100 : 0;

  const operacoesLucrativas = itensFiltrados.filter(
    (item) => parseFloat(item.resultadoFinanceiro || "0") > 0
  ).length;

  const taxaAcerto =
    itensFiltrados.length > 0
      ? (operacoesLucrativas / itensFiltrados.length) * 100
      : 0;

  const mediaPorOperacao =
    totalOperacoes > 0 ? lucroTotal / totalOperacoes : 0;

  const maiorGanho =
    itensFiltrados.length > 0
      ? Math.max(
          ...itensFiltrados.map((i) =>
            parseFloat(i.resultadoFinanceiro || "0")
          )
        )
      : 0;

  // === Por Mercado ===
  const porMercado = mercados
    .map((mercado) => {
      const itensMercado = itensFiltrados.filter(
        (i) => i.mercadoId === mercado.id
      );

      const stake = itensMercado.reduce(
        (acc, i) => acc + parseFloat(i.stake || "0"),
        0
      );
      const lucro = itensMercado.reduce(
        (acc, i) => acc + parseFloat(i.resultadoFinanceiro || "0"),
        0
      );

      return {
        mercado: mercado.nome,
        lucro,
        roi: stake > 0 ? (lucro / stake) * 100 : 0,
        operacoes: itensMercado.length,
      };
    })
    .filter((i) => i.operacoes > 0)
    .sort((a, b) => b.lucro - a.lucro);

  // === Por Estratégia ===
  const porEstrategia = estrategias
    .map((est) => {
      const itensEstrategia = itensFiltrados.filter(
        (i) => i.estrategiaId === est.id
      );

      const stake = itensEstrategia.reduce(
        (acc, i) => acc + parseFloat(i.stake || "0"),
        0
      );
      const lucro = itensEstrategia.reduce(
        (acc, i) => acc + parseFloat(i.resultadoFinanceiro || "0"),
        0
      );

      const mercado = mercados.find((m) => m.id === est.mercadoId);

      return {
        estrategia: est.nome,
        mercado: mercado?.nome || "",
        lucro,
        roi: stake > 0 ? (lucro / stake) * 100 : 0,
        operacoes: itensEstrategia.length,
      };
    })
    .filter((i) => i.operacoes > 0)
    .sort((a, b) => b.lucro - a.lucro);

  // === Por Competição — CORRIGIDO ===
  const [mostrarPioresCompeticoes, setMostrarPioresCompeticoes] =
    useState(false);

  const competicoesOrdenadas = useMemo(() => {
    // guard clause
    if (
      !operacoes.length ||
      !partidas.length ||
      !competicoes.length ||
      !itensFiltrados.length
    )
      return [];

    const mapa = new Map<
      number,
      { lucro: number; stake: number; operacoes: number }
    >();

    itensFiltrados.forEach((item) => {
      const operacao = operacoes.find((o) => o.id === item.operacaoId);
      if (!operacao) return;

      const partida = partidas.find((p) => p.id === operacao.partidaId);
      if (!partida) return;

      const id = partida.competicaoId;

      const atual = mapa.get(id) || {
        lucro: 0,
        stake: 0,
        operacoes: 0,
      };

      atual.lucro += parseFloat(item.resultadoFinanceiro || "0");
      atual.stake += parseFloat(item.stake || "0");
      atual.operacoes += 1;

      mapa.set(id, atual);
    });

    const lista = Array.from(mapa.entries()).map(([id, dados]) => ({
      competicao: competicoes.find((c) => c.id === id)?.nome || "Desconhecida",
      lucro: dados.lucro,
      roi: dados.stake > 0 ? (dados.lucro / dados.stake) * 100 : 0,
      operacoes: dados.operacoes,
    }));

    return mostrarPioresCompeticoes
      ? lista.sort((a, b) => a.lucro - b.lucro)
      : lista.sort((a, b) => b.lucro - a.lucro);
  }, [
    JSON.stringify(itensFiltrados),
    JSON.stringify(operacoes),
    JSON.stringify(partidas),
    JSON.stringify(competicoes),
    mostrarPioresCompeticoes,
  ]);

  // === Por Equipe — CORRIGIDO ===
  const [mostrarPioresEquipes, setMostrarPioresEquipes] = useState(false);

  const equipesOrdenadas = useMemo(() => {
    if (
      !operacoes.length ||
      !partidas.length ||
      !equipes.length ||
      !itensFiltrados.length
    )
      return [];

    const mapa = new Map<
      number,
      { lucro: number; stake: number; operacoes: number }
    >();

    itensFiltrados.forEach((item) => {
      const operacao = operacoes.find((o) => o.id === item.operacaoId);
      if (!operacao) return;

      const partida = partidas.find((p) => p.id === operacao.partidaId);
      if (!partida) return;

      [partida.mandanteId, partida.visitanteId].forEach((id) => {
        const atual = mapa.get(id) || {
          lucro: 0,
          stake: 0,
          operacoes: 0,
        };

        atual.lucro += parseFloat(item.resultadoFinanceiro || "0");
        atual.stake += parseFloat(item.stake || "0");
        atual.operacoes += 1;

        mapa.set(id, atual);
      });
    });

    const lista = Array.from(mapa.entries()).map(([id, dados]) => ({
      equipe: equipes.find((e) => e.id === id)?.nome || "Desconhecida",
      lucro: dados.lucro,
      roi: dados.stake > 0 ? (dados.lucro / dados.stake) * 100 : 0,
      operacoes: dados.operacoes,
    }));

    return mostrarPioresEquipes
      ? lista.sort((a, b) => a.lucro - b.lucro)
      : lista.sort((a, b) => b.lucro - a.lucro);
  }, [
    JSON.stringify(itensFiltrados),
    JSON.stringify(operacoes),
    JSON.stringify(partidas),
    JSON.stringify(equipes),
    mostrarPioresEquipes,
  ]);

  // === Comportamental ===
  const seguiuPlanoSim = itensFiltrados.filter(
    (item) => item.seguiuPlano === true
  );

  const seguiuPlanoNao = itensFiltrados.filter(
    (item) => item.seguiuPlano === false
  );

  const stakeSeguiuSim = seguiuPlanoSim.reduce(
    (acc, item) => acc + parseFloat(item.stake || "0"),
    0
  );

  const lucroSeguiuSim = seguiuPlanoSim.reduce(
    (acc, item) => acc + parseFloat(item.resultadoFinanceiro || "0"),
    0
  );

  const roiSeguiuSim =
    stakeSeguiuSim > 0 ? (lucroSeguiuSim / stakeSeguiuSim) * 100 : 0;

  const stakeSeguiuNao = seguiuPlanoNao.reduce(
    (acc, item) => acc + parseFloat(item.stake || "0"),
    0
  );

  const lucroSeguiuNao = seguiuPlanoNao.reduce(
    (acc, item) => acc + parseFloat(item.resultadoFinanceiro || "0"),
    0
  );

  const roiSeguiuNao =
    stakeSeguiuNao > 0 ? (lucroSeguiuNao / stakeSeguiuNao) * 100 : 0;

  // === Estados emocionais ===
  const estadosSet = new Set(
    itensFiltrados.map((item) => item.estadoEmocional).filter(Boolean)
  );

  const estadosEmocionais = Array.from(estadosSet);

  const porEstadoEmocional = estadosEmocionais
    .map((estado) => {
      const itensEstado = itensFiltrados.filter(
        (item) => item.estadoEmocional === estado
      );

      const stake = itensEstado.reduce(
        (acc, i) => acc + parseFloat(i.stake || "0"),
        0
      );

      const lucro = itensEstado.reduce(
        (acc, i) => acc + parseFloat(i.resultadoFinanceiro || "0"),
        0
      );

      return {
        estado,
        lucro,
        roi: stake > 0 ? (lucro / stake) * 100 : 0,
        operacoes: itensEstado.length,
      };
    })
    .sort((a, b) => b.lucro - a.lucro);

  // === Reset filtros ===
  const limparFiltros = () => {
    setFiltros({
      dataInicio: "",
      dataFim: "",
      competicaoId: "all",
      equipeId: "all",
      mercadoId: "all",
      estrategiaId: "all",
    });
  };

  // === UI ===
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Relatórios
        </h1>
        <p className="text-muted-foreground mt-1">
          Análise de performance e resultados
        </p>
      </div>

      <div className="space-y-6">
        {/* === Filtros === */}
        <Card
          className={
            isDarkMode
              ? "p-6 bg-[#2a2b2e] border border-[#44494d]"
              : "p-6 bg-white border border-gray-200 shadow-sm"
          }
        >
          <div className="mb-4 pb-3 border-b border-border/40">
            <h3 className="text-lg font-semibold" style={{ color: "#0099DD" }}>
              Filtros
            </h3>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            {/* Início */}
            <div className="flex flex-col w-[120px]">
              <Label className="text-sm">Início</Label>
              <Input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) =>
                  setFiltros({ ...filtros, dataInicio: e.target.value })
                }
                className="h-9 text-sm"
              />
            </div>

            {/* Fim */}
            <div className="flex flex-col w-[120px]">
              <Label className="text-sm">Fim</Label>
              <Input
                type="date"
                value={filtros.dataFim}
                onChange={(e) =>
                  setFiltros({ ...filtros, dataFim: e.target.value })
                }
                className="h-9 text-sm"
              />
            </div>

            {/* Competição */}
            <div className="flex flex-col flex-1 min-w-[140px]">
              <Label className="text-sm">Competição</Label>
              <Select
                value={filtros.competicaoId}
                onValueChange={(v) =>
                  setFiltros({ ...filtros, competicaoId: v })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {competicoes.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipe */}
            <div className="flex flex-col flex-1 min-w-[140px]">
              <Label className="text-sm">Equipe</Label>
              <Select
                value={filtros.equipeId}
                onValueChange={(v) => setFiltros({ ...filtros, equipeId: v })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {equipes.map((e) => (
                    <SelectItem key={e.id} value={e.id.toString()}>
                      {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mercado */}
            <div className="flex flex-col flex-1 min-w-[140px]">
              <Label className="text-sm">Mercado</Label>
              <Select
                value={filtros.mercadoId}
                onValueChange={(v) => setFiltros({ ...filtros, mercadoId: v })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {mercados.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estratégia */}
            <div className="flex flex-col flex-1 min-w-[140px]">
              <Label className="text-sm">Estratégia</Label>
              <Select
                value={filtros.estrategiaId}
                onValueChange={(v) =>
                  setFiltros({ ...filtros, estrategiaId: v })
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {estrategias.map((e) => (
                    <SelectItem key={e.id} value={e.id.toString()}>
                      {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botão */}
            <div className="flex flex-col w-[90px]">
              <Label className="text-sm opacity-0 select-none">.</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={limparFiltros}
                className="h-9 text-sm"
              >
                <XCircle className="w-4 h-4" />
                Limpar
              </Button>
            </div>
          </div>
        </Card>

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* === Tabs === */}
        <Tabs defaultValue="geral" className="space-y-4">
          <TabsList>
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="mercado">Por Mercado</TabsTrigger>
            <TabsTrigger value="estrategia">Por Estratégia</TabsTrigger>
            <TabsTrigger value="comportamental">Comportamental</TabsTrigger>
            <TabsTrigger value="competicao">Por Competição</TabsTrigger>
            <TabsTrigger value="equipe">Por Equipe</TabsTrigger>
          </TabsList>

          {/* === GERAL === */}
          <TabsContent value="geral">
            <Card
              className={
                isDarkMode
                  ? "p-6 bg-[#2a2b2e] border border-[#44494d]"
                  : "p-6 bg-white border border-gray-200 shadow-sm"
              }
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#0099DD" }}>
                Resumo Geral
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Operações</p>
                  <p className="text-2xl font-bold font-mono">{totalOperacoes}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Itens Lucrativos</p>
                  <p className="text-2xl font-bold font-mono">{operacoesLucrativas}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Total Investido</p>
                  <p className="text-2xl font-bold font-mono">
                    R$ {totalStake.toFixed(2).replace(".", ",")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Maior Ganho</p>
                  <p
                    className={`text-2xl font-bold font-mono ${
                      maiorGanho >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    R$ {maiorGanho.toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* === MERCADO === */}
          <TabsContent value="mercado">
            <Card
              className={
                isDarkMode
                  ? "p-6 bg-[#2a2b2e] border border-[#44494d]"
                  : "p-6 bg-white border border-gray-200 shadow-sm"
              }
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#0099DD" }}>
                Performance por Mercado
              </h3>

              {porMercado.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum dado disponível
                </p>
              ) : (
                <div className="rounded-lg border dark:border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mercado</TableHead>
                        <TableHead className="text-right">Lucro</TableHead>
                        <TableHead className="text-right">ROI</TableHead>
                        <TableHead className="text-right">Itens</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {porMercado.map((row) => (
                        <TableRow key={row.mercado}>
                          <TableCell className="font-medium">{row.mercado}</TableCell>
                          <TableCell
                            className={`text-right font-mono ${
                              row.lucro >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            R$ {row.lucro.toFixed(2).replace(".", ",")}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {row.roi.toFixed(1).replace(".", ",")}%
                          </TableCell>

                          <TableCell className="text-right font-mono">
                            {row.operacoes}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* === ESTRATÉGIA === */}
          <TabsContent value="estrategia">
            <Card
              className={
                isDarkMode
                  ? "p-6 bg-[#2a2b2e] border border-[#44494d]"
                  : "p-6 bg-white border border-gray-200 shadow-sm"
              }
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#0099DD" }}>
                Performance por Estratégia
              </h3>

              {porEstrategia.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum dado disponível
                </p>
              ) : (
                <div className="rounded-lg border dark:border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estratégia</TableHead>
                        <TableHead>Mercado</TableHead>
                        <TableHead className="text-right">Lucro</TableHead>
                        <TableHead className="text-right">ROI</TableHead>
                        <TableHead className="text-right">Itens</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {porEstrategia.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {row.estrategia}
                          </TableCell>

                          <TableCell className="text-muted-foreground">
                            {row.mercado}
                          </TableCell>

                          <TableCell
                            className={`text-right font-mono ${
                              row.lucro >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            R$ {row.lucro.toFixed(2).replace(".", ",")}
                          </TableCell>

                          <TableCell className="text-right font-mono">
                            {row.roi.toFixed(1).replace(".", ",")}%
                          </TableCell>

                          <TableCell className="text-right font-mono">
                            {row.operacoes}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* === COMPETIÇÃO === */}
          <TabsContent value="competicao">
            <Card
              className={
                isDarkMode
                  ? "p-6 bg-[#2a2b2e] border border-[#44494d]"
                  : "p-6 bg-white border border-gray-200 shadow-sm"
              }
            >
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: "#0099DD" }}>
                  Performance por Competição
                </h3>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setMostrarPioresCompeticoes((prev) => !prev)
                  }
                  className={`text-sm ${
                    mostrarPioresCompeticoes ? "text-[#0099DD]" : "text-red-600"
                  }`}
                >
                  {mostrarPioresCompeticoes ? "Ver Melhores" : "Ver Piores"}
                </Button>
              </div>

              {competicoesOrdenadas.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum dado disponível
                </p>
              ) : (
                <div className="rounded-lg border dark:border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Competição</TableHead>
                        <TableHead className="text-right">Lucro</TableHead>
                        <TableHead className="text-right">ROI</TableHead>
                        <TableHead className="text-right">Itens</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {competicoesOrdenadas.slice(0, 10).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {row.competicao}
                          </TableCell>

                          <TableCell
                            className={`text-right font-mono ${
                              row.lucro >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            R$ {row.lucro.toFixed(2).replace(".", ",")}
                          </TableCell>

                          <TableCell className="text-right font-mono">
                            {row.roi.toFixed(1).replace(".", ",")}%
                          </TableCell>

                          <TableCell className="text-right font-mono">
                            {row.operacoes}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* === EQUIPE === */}
          <TabsContent value="equipe">
            <Card
              className={
                isDarkMode
                  ? "p-6 bg-[#2a2b2e] border border-[#44494d]"
                  : "p-6 bg-white border border-gray-200 shadow-sm"
              }
            >
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: "#0099DD" }}>
                  Performance por Equipe
                </h3>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarPioresEquipes((prev) => !prev)}
                  className={`text-sm ${
                    mostrarPioresEquipes ? "text-[#0099DD]" : "text-red-600"
                  }`}
                >
                  {mostrarPioresEquipes ? "Ver Melhores" : "Ver Piores"}
                </Button>
              </div>

              {equipesOrdenadas.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum dado disponível
                </p>
              ) : (
                <div className="rounded-lg border dark:border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipe</TableHead>
                        <TableHead className="text-right">Lucro</TableHead>
                        <TableHead className="text-right">ROI</TableHead>
                        <TableHead className="text-right">Itens</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {equipesOrdenadas.slice(0, 20).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {row.equipe}
                          </TableCell>

                          <TableCell
                            className={`text-right font-mono ${
                              row.lucro >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            R$ {row.lucro.toFixed(2).replace(".", ",")}
                          </TableCell>

                          <TableCell className="text-right font-mono">
                            {row.roi.toFixed(1).replace(".", ",")}%
                          </TableCell>

                          <TableCell className="text-right font-mono">
                            {row.operacoes}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* === COMPORTAMENTAL === */}
          <TabsContent value="comportamental">
            <Card
              className={
                isDarkMode
                  ? "p-6 bg-[#2a2b2e] border border-[#44494d]"
                  : "p-6 bg-white border border-gray-200 shadow-sm"
              }
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#0099DD" }}>
                Análise Comportamental
              </h3>

              <div className="space-y-6">
                {/* Seguiu Método */}
                <div>
                  <h4 className="text-sm font-medium mb-3">
                    Performance: Seguiu o Método
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border dark:border-border">
                      <p className="text-sm text-muted-foreground mb-1">
                        Sim ({seguiuPlanoSim.length} itens)
                      </p>

                      <p
                        className={`text-xl font-bold font-mono ${
                          lucroSeguiuSim >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {lucroSeguiuSim >= 0 ? "+" : ""}R${" "}
                        {lucroSeguiuSim.toFixed(2).replace(".", ",")}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        ROI: {roiSeguiuSim.toFixed(1).replace(".", ",")}%
                      </p>
                    </div>

                    <div className="p-4 rounded-lg border dark:border-border">
                      <p className="text-sm text-muted-foreground mb-1">
                        Não ({seguiuPlanoNao.length} itens)
                      </p>

                      <p
                        className={`text-xl font-bold font-mono ${
                          lucroSeguiuNao >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {lucroSeguiuNao >= 0 ? "+" : ""}R${" "}
                        {lucroSeguiuNao.toFixed(2).replace(".", ",")}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        ROI: {roiSeguiuNao.toFixed(1).replace(".", ",")}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estados Emocionais */}
                {porEstadoEmocional.length > 0 && (
                  <div>
                    <h4
                      className="text-sm font-medium mb-3"
                      style={{ color: "#0099DD" }}
                    >
                      Performance por Estado Emocional
                    </h4>

                    <div className="rounded-lg border dark:border-border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Lucro</TableHead>
                            <TableHead className="text-right">ROI</TableHead>
                            <TableHead className="text-right">Itens</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {porEstadoEmocional.map((row) => (
                            <TableRow key={row.estado}>
                              <TableCell className="font-medium">
                                {row.estado}
                              </TableCell>

                              <TableCell
                                className={`text-right font-mono ${
                                  row.lucro >= 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                R${" "}
                                {row.lucro.toFixed(2).replace(".", ",")}
                              </TableCell>

                              <TableCell className="text-right font-mono">
                                {row.roi.toFixed(1).replace(".", ",")}%
                              </TableCell>

                              <TableCell className="text-right font-mono">
                                {row.operacoes}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
