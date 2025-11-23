import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Cell,
  Legend,
  LabelList,
} from "recharts";

interface MesData {
  mes: string;
  mesNumero: number;
  valorInicial: number;
  lucro: number;
  valorFinal: number;
  roi: number;
  depositos: number;
  saques: number;
}

export default function ResumoAnual() {
  const anoAtual = new Date().getFullYear();
  const [anoSelecionado, setAnoSelecionado] = useState(anoAtual);

  // Detectar automaticamente o modo escuro
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

  const { data: dadosMensais, isLoading } = useQuery<MesData[]>({
    queryKey: [`/api/resumo-anual/${anoSelecionado}`],
  });

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarPercentual = (valor: number) => {
    return `${valor.toFixed(2)}%`;
  };

  // Calcular totais anuais
  const totaisAnuais =
    dadosMensais?.reduce(
      (acc, m) => ({
        totalLucro: acc.totalLucro + m.lucro,
        totalDepositos: acc.totalDepositos + m.depositos,
        totalSaques: acc.totalSaques + m.saques,
      }),
      { totalLucro: 0, totalDepositos: 0, totalSaques: 0 }
    ) || { totalLucro: 0, totalDepositos: 0, totalSaques: 0 };

  const valorInicialAno = dadosMensais?.[0]?.valorInicial || 0;
  const valorFinalAno =
    dadosMensais?.[dadosMensais.length - 1]?.valorFinal || 0;
  const roiAnual =
    valorInicialAno > 0
      ? (totaisAnuais.totalLucro / valorInicialAno) * 100
      : 0;

  // Preparar dados para o gráfico (evolução acumulada)
  const dadosGrafico =
    dadosMensais?.reduce((acc, m) => {
      const lucroAcumulado =
        acc.length > 0
          ? acc[acc.length - 1].lucroAcumulado + m.lucro
          : m.lucro;

      acc.push({
        mes: m.mes,
        lucroAcumulado,
      });

      return acc;
    }, [] as { mes: string; lucroAcumulado: number }[]) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Resumo Anual</h1>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setAnoSelecionado((prev) => prev - 1)}
            data-testid="button-ano-anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div
            className="text-xl font-semibold min-w-[80px] text-center"
            data-testid="text-ano-selecionado"
          >
            {anoSelecionado}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setAnoSelecionado((prev) => prev + 1)}
            disabled={anoSelecionado >= anoAtual}
            data-testid="button-proximo-ano"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <>
          {/* Resumo de Totais Anuais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Lucro/Prejuízo Anual */}
            <Card
              className={
                isDarkMode
                  ? "bg-[#2a2b2e] border border-[#44494d]"
                  : "bg-white border border-gray-200 shadow-sm"
              }
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lucro/Prejuízo Anual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-mono font-bold ${
                    totaisAnuais.totalLucro >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                  data-testid="total-lucro-anual"
                >
                  {formatarMoeda(totaisAnuais.totalLucro)}
                </div>
              </CardContent>
            </Card>

            {/* ROI Anual */}
            <Card
              className={
                isDarkMode
                  ? "bg-[#2a2b2e] border border-[#44494d]"
                  : "bg-white border border-gray-200 shadow-sm"
              }
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  ROI Anual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-mono font-bold ${
                    roiAnual >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                  data-testid="roi-anual"
                >
                  {formatarPercentual(roiAnual)}
                </div>
              </CardContent>
            </Card>

            {/* Total de Depósitos */}
            <Card
              className={
                isDarkMode
                  ? "bg-[#2a2b2e] border border-[#44494d]"
                  : "bg-white border border-gray-200 shadow-sm"
              }
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Depósitos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl font-mono font-bold"
                  data-testid="total-depositos"
                >
                  {formatarMoeda(totaisAnuais.totalDepositos)}
                </div>
              </CardContent>
            </Card>

            {/* Total de Saques */}
            <Card
              className={
                isDarkMode
                  ? "bg-[#2a2b2e] border border-[#44494d]"
                  : "bg-white border border-gray-200 shadow-sm"
              }
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Saques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl font-mono font-bold"
                  data-testid="total-saques"
                >
                  {formatarMoeda(totaisAnuais.totalSaques)}
                </div>
              </CardContent>
            </Card>
          </div>

         {/* Gráfico: Lucro Mensal + Lucro Acumulado */}
          <Card
            className={
              isDarkMode
                ? "bg-[#2a2b2e] border-[#44494d]"
                : "bg-white border border-gray-200 shadow-sm"
            }
          >
            <CardHeader>
              <CardTitle>
                Lucro Mensal e Evolução Acumulada {anoSelecionado}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart
                  data={(dadosMensais || []).map((m, i) => ({
                    mes: m.mes,
                    lucro: m.lucro,
                    lucroAcumulado: dadosGrafico[i]?.lucroAcumulado ?? 0,
                  }))}
                  margin={{ top: 32, right: 24, bottom: 32, left: 24 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "hsl(var(--border))" : "#e2e8f0"}
                  />
          
                  <XAxis
                    dataKey="mes"
                    stroke={isDarkMode ? "hsl(var(--muted-foreground))" : "#334155"}
                  />
          
                  <YAxis
                    stroke={isDarkMode ? "hsl(var(--muted-foreground))" : "#334155"}
                    tickFormatter={(value) => formatarMoeda(value)}
                    domain={["dataMin", "dataMax"]}
                  />
          
                  {/* Tooltip apenas acumulado */}
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && Array.isArray(payload)) {
                        const acumulado = payload.find(
                          (p: any) => p?.dataKey === "lucroAcumulado"
                        );
                        if (acumulado && typeof acumulado.value === "number") {
                          return (
                            <div
                              style={{
                                backgroundColor: isDarkMode ? "#1e1f22" : "#ffffff",
                                color: isDarkMode ? "#ffffff" : "#000000",
                                borderRadius: 8,
                                border: isDarkMode ? "1px solid #555" : "1px solid #ccc",
                                padding: "8px",
                              }}
                            >
                              <p>{`Acumulado (${label}): ${formatarMoeda(acumulado.value)}`}</p>
                            </div>
                          );
                        }
                      }
                      return null;
                    }}
                  />
          
                  {/* Legenda customizada */}
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    content={() => (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "24px",
                          paddingTop: 20,
                          paddingBottom: 10,
                          fontSize: 14,
                          lineHeight: "28px",
                        }}
                      >
                        {/* Lucro Mensal */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              backgroundColor: "#22c55e", // verde
                              borderRadius: 2,
                              display: "inline-block",
                            }}
                          />
                          <span
                            style={{
                              color: isDarkMode ? "#c2c2c0" : "#334155",
                            }}
                          >
                            Lucro
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              backgroundColor: "#ef4444", // vermelho
                              borderRadius: 2,
                              display: "inline-block",
                            }}
                          />
                          <span
                            style={{
                              color: isDarkMode ? "#c2c2c0" : "#334155",
                            }}
                          >
                            Prejuízo
                          </span>
                        </div>
                        {/* Lucro Acumulado */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              width: 24,
                              height: 2,
                              backgroundColor: "hsl(var(--primary))", // cor da linha
                              display: "inline-block",
                            }}
                          />
                          <span
                            style={{
                              color: isDarkMode ? "#c2c2c0" : "#334155",
                            }}
                          >
                            Lucro Acumulado
                          </span>
                        </div>
                      </div>
                    )}
                  />
          
                  {/* Lucro Mensal */}
                  <Bar dataKey="lucro" barSize={26}>
                    {(dadosMensais || []).map((m, idx) => (
                      <Cell
                        key={`lm-${idx}`}
                        fill={m.lucro >= 0 ? "#22c55e" : "#ef4444"} // verde para lucro, vermelho para prejuízo
                      />
                    ))}
                    <LabelList
                      dataKey="lucro"
                      position="top"
                      content={(props: any) => {
                        const { x = 0, y = 0, value, width = 0, height = 0 } = props;
                        const cx = x + width / 2;
                        const cy = Number(value) < 0 ? y + height + 12 : y - 6;
                        return (
                          <text
                            x={cx}
                            y={cy}
                            fill={isDarkMode ? "#c2c2c0" : "#334155"}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={12}
                          >
                            {formatarMoeda(Number(value))}
                          </text>
                        );
                      }}
                    />
                  </Bar>
          
                  {/* Linha Lucro Acumulado */}
                  <Line
                    type="monotone"
                    dataKey="lucroAcumulado"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabela de Dados Mensais */}
          <Card
            className={
              isDarkMode
                ? "bg-[#2a2b2e] border border-[#44494d]"
                : "bg-white border border-gray-200 shadow-sm"
            }
          >
            <CardHeader>
              <CardTitle>Detalhamento Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <Table data-testid="table-resumo-anual">
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead className="text-right">
                      Valor Inicial
                    </TableHead>
                    <TableHead className="text-right">
                      Lucro/Prejuízo
                    </TableHead>
                    <TableHead className="text-right">
                      Valor Final
                    </TableHead>
                    <TableHead className="text-right">ROI</TableHead>
                    <TableHead className="text-right">Depósitos</TableHead>
                    <TableHead className="text-right">Saques</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dadosMensais?.map((mes) => (
                    <TableRow
                      key={mes.mesNumero}
                      data-testid={`row-mes-${mes.mesNumero}`}
                      className={
                        isDarkMode
                          ? "hover:bg-[#383a3e]"
                          : "hover:bg-gray-50"
                      }
                    >
                      <TableCell className="font-medium">
                        {mes.mes}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        data-testid={`valor-inicial-${mes.mesNumero}`}
                      >
                        {formatarMoeda(mes.valorInicial)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          mes.lucro >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                        data-testid={`lucro-${mes.mesNumero}`}
                      >
                        {formatarMoeda(mes.lucro)}
                      </TableCell>
                      <TableCell
                        className="text-right font-medium"
                        data-testid={`valor-final-${mes.mesNumero}`}
                      >
                        {formatarMoeda(mes.valorFinal)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          mes.roi >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                        data-testid={`roi-${mes.mesNumero}`}
                      >
                        {formatarPercentual(mes.roi)}
                      </TableCell>
                      <TableCell
                        className="text-right text-green-600 dark:text-green-400"
                        data-testid={`depositos-${mes.mesNumero}`}
                      >
                        {formatarMoeda(mes.depositos)}
                      </TableCell>
                      <TableCell
                        className="text-right text-red-600 dark:text-red-400"
                        data-testid={`saques-${mes.mesNumero}`}
                      >
                        {formatarMoeda(mes.saques)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
