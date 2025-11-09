import { useState, useEffect } from "react";
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
import { TrendingUp, Target, Award, BarChart3 } from "lucide-react";
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

  // ✅ Detectar modo escuro (igual à tela de Resumo)
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

  // === Consultas principais ===
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

  // === Preparação de dados ===
  const operacoes = relatoriosData?.operacoes || [];
  const itens = relatoriosData?.itens || [];

  let itensFiltrados = itens;

  // === Filtros (data, competição, equipe) ===
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
        filtros.competicaoId &&
        filtros.competicaoId !== "all" &&
        partida.competicaoId !== parseInt(filtros.competicaoId)
      )
        return false;
      if (filtros.equipeId && filtros.equipeId !== "all") {
        const equipeIdNum = parseInt(filtros.equipeId);
        if (
          partida.mandanteId !== equipeIdNum &&
          partida.visitanteId !== equipeIdNum
        )
          return false;
      }
      return true;
    });

    const operacaoIdsFiltrados = new Set(operacoesFiltradas.map((op) => op.id));
    itensFiltrados = itens.filter((item) =>
      operacaoIdsFiltrados.has(item.operacaoId)
    );
  }

  // === Filtros (mercado, estratégia) ===
  if (filtros.mercadoId && filtros.mercadoId !== "all") {
    itensFiltrados = itensFiltrados.filter(
      (item) => item.mercadoId === parseInt(filtros.mercadoId)
    );
  }

  if (filtros.estrategiaId && filtros.estrategiaId !== "all") {
    itensFiltrados = itensFiltrados.filter(
      (item) => item.estrategiaId === parseInt(filtros.estrategiaId)
    );
  }

  // === Cálculos principais ===
  const totalOperacoes = new Set(itensFiltrados.map((item) => item.operacaoId))
    .size;
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
          ...itensFiltrados.map((item) =>
            parseFloat(item.resultadoFinanceiro || "0")
          )
        )
      : 0;

  // === Agregações por mercado ===
  const porMercado = mercados
    .map((mercado) => {
      const itensMercado = itensFiltrados.filter(
        (item) => item.mercadoId === mercado.id
      );
      const stakeTotal = itensMercado.reduce(
        (acc, item) => acc + parseFloat(item.stake || "0"),
        0
      );
      const lucro = itensMercado.reduce(
        (acc, item) => acc + parseFloat(item.resultadoFinanceiro || "0"),
        0
      );
      const roiMercado = stakeTotal > 0 ? (lucro / stakeTotal) * 100 : 0;
      const numOperacoes = itensMercado.length;

      return {
        mercado: mercado.nome,
        lucro,
        roi: roiMercado,
        operacoes: numOperacoes,
      };
    })
    .filter((item) => item.operacoes > 0);

  // === Agregações por estratégia ===
  const porEstrategia = estrategias
    .map((estrategia) => {
      const itensEstrategia = itensFiltrados.filter(
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
      const numOperacoes = itensEstrategia.length;
      const mercado = mercados.find((m) => m.id === estrategia.mercadoId);

      return {
        estrategia: estrategia.nome,
        mercado: mercado?.nome || "",
        lucro,
        roi: roiEstrategia,
        operacoes: numOperacoes,
      };
    })
    .filter((item) => item.operacoes > 0);

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

  // === Por estado emocional ===
  const estadosSet = new Set(
    itensFiltrados.map((item) => item.estadoEmocional).filter(Boolean)
  );
  const estadosEmocionais = Array.from(estadosSet);
  const porEstadoEmocional = estadosEmocionais.map((estado) => {
    const itensEstado = itensFiltrados.filter(
      (item) => item.estadoEmocional === estado
    );
    const stakeTotal = itensEstado.reduce(
      (acc, item) => acc + parseFloat(item.stake || "0"),
      0
    );
    const lucro = itensEstado.reduce(
      (acc, item) => acc + parseFloat(item.resultadoFinanceiro || "0"),
      0
    );
    const roiEstado = stakeTotal > 0 ? (lucro / stakeTotal) * 100 : 0;
    return { estado, lucro, roi: roiEstado, operacoes: itensEstado.length };
  });

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

        {/* Filtros */}
<Card
  className={
    isDarkMode
      ? "p-6 bg-[#2a2b2e] border border-[#44494d]"
      : "p-6 bg-white border border-gray-200 shadow-sm"
  }
>
  <h3 className="text-lg font-semibold mb-4">Filtros</h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="space-y-2">
      <Label>Data Início</Label>
      <Input
        type="date"
        value={filtros.dataInicio}
        onChange={(e) =>
          setFiltros({ ...filtros, dataInicio: e.target.value })
        }
        data-testid="input-data-inicio"
      />
    </div>
    <div className="space-y-2">
      <Label>Data Fim</Label>
      <Input
        type="date"
        value={filtros.dataFim}
        onChange={(e) =>
          setFiltros({ ...filtros, dataFim: e.target.value })
        }
        data-testid="input-data-fim"
      />
    </div>
    <div className="space-y-2">
      <Label>Competição</Label>
      <Select
        value={filtros.competicaoId}
        onValueChange={(value) =>
          setFiltros({ ...filtros, competicaoId: value })
        }
      >
        <SelectTrigger data-testid="select-competicao">
          <SelectValue placeholder="Todas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {competicoes.map((comp) => (
            <SelectItem key={comp.id} value={comp.id.toString()}>
              {comp.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Equipe</Label>
      <Select
        value={filtros.equipeId}
        onValueChange={(value) =>
          setFiltros({ ...filtros, equipeId: value })
        }
      >
        <SelectTrigger data-testid="select-equipe">
          <SelectValue placeholder="Todas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {equipes.map((equipe) => (
            <SelectItem key={equipe.id} value={equipe.id.toString()}>
              {equipe.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Mercado</Label>
      <Select
        value={filtros.mercadoId}
        onValueChange={(value) =>
          setFiltros({ ...filtros, mercadoId: value })
        }
      >
        <SelectTrigger data-testid="select-mercado">
          <SelectValue placeholder="Todos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {mercados.map((mercado) => (
            <SelectItem key={mercado.id} value={mercado.id.toString()}>
              {mercado.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Estratégia</Label>
      <Select
        value={filtros.estrategiaId}
        onValueChange={(value) =>
          setFiltros({ ...filtros, estrategiaId: value })
        }
      >
        <SelectTrigger data-testid="select-estrategia">
          <SelectValue placeholder="Todas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {estrategias.map((estrategia) => (
            <SelectItem key={estrategia.id} value={estrategia.id.toString()}>
              {estrategia.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
  <div className="mt-4">
    <Button
      variant="outline"
      onClick={limparFiltros}
      data-testid="button-limpar-filtros"
    >
      Limpar Filtros
    </Button>
  </div>
</Card>

{/* Métricas principais */}
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

{/* Tabs */}
<Tabs defaultValue="geral" className="space-y-4">
  <TabsList data-testid="tabs-report">
    <TabsTrigger value="geral">Geral</TabsTrigger>
    <TabsTrigger value="mercado">Por Mercado</TabsTrigger>
    <TabsTrigger value="estrategia">Por Estratégia</TabsTrigger>
    <TabsTrigger value="comportamental">Comportamental</TabsTrigger>
  </TabsList>

  {/* Geral */}
  <TabsContent value="geral">
    <Card
      className={
        isDarkMode
          ? "p-6 bg-[#2a2b2e] border border-[#44494d]"
          : "p-6 bg-white border border-gray-200 shadow-sm"
      }
    >
      <h3 className="text-lg font-semibold mb-4">Resumo Geral</h3>
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

  {/* Por Mercado */}
  <TabsContent value="mercado">
    <Card
      className={
        isDarkMode
          ? "p-6 bg-[#2a2b2e] border border-[#44494d]"
          : "p-6 bg-white border border-gray-200 shadow-sm"
      }
    >
      <h3 className="text-lg font-semibold mb-4">
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

  {/* Por Estratégia */}
  <TabsContent value="estrategia">
    <Card
      className={
        isDarkMode
          ? "p-6 bg-[#2a2b2e] border border-[#44494d]"
          : "p-6 bg-white border border-gray-200 shadow-sm"
      }
    >
      <h3 className="text-lg font-semibold mb-4">
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
              {porEstrategia.map((row, index) => (
                <TableRow key={index}>
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

  {/* Comportamental */}
  <TabsContent value="comportamental">
    <Card
      className={
        isDarkMode
          ? "p-6 bg-[#2a2b2e] border border-[#44494d]"
          : "p-6 bg-white border border-gray-200 shadow-sm"
      }
    >
      <h3 className="text-lg font-semibold mb-4">
        Análise Comportamental
      </h3>
      <div className="space-y-6">
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
                {lucroSeguiuSim >= 0 ? "+" : ""}R$ {lucroSeguiuSim
                  .toFixed(2)
                  .replace(".", ",")}
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
                {lucroSeguiuNao >= 0 ? "+" : ""}R$ {lucroSeguiuNao
                  .toFixed(2)
                  .replace(".", ",")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ROI: {roiSeguiuNao.toFixed(1).replace(".", ",")}%
              </p>
            </div>
          </div>
        </div>

        {porEstadoEmocional.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">
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

