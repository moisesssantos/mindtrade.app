import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Cell, Legend } from "recharts";

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

  // ✅ Detectar automaticamente o modo escuro
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
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
  const totaisAnuais = dadosMensais?.reduce((acc, m) => ({
    totalLucro: acc.totalLucro + m.lucro,
    totalDepositos: acc.totalDepositos + m.depositos,
    totalSaques: acc.totalSaques + m.saques,
  }), { totalLucro: 0, totalDepositos: 0, totalSaques: 0 }) || { totalLucro: 0, totalDepositos: 0, totalSaques: 0 };

  const valorInicialAno = dadosMensais?.[0]?.valorInicial || 0;
  const valorFinalAno = dadosMensais?.[dadosMensais.length - 1]?.valorFinal || 0;
  const roiAnual = valorInicialAno > 0 ? (totaisAnuais.totalLucro / valorInicialAno) * 100 : 0;

  // Preparar dados para o gráfico (evolução acumulada)
  const dadosGrafico = dadosMensais?.reduce((acc, m) => {
    const lucroAcumulado = acc.length > 0 
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
            onClick={() => setAnoSelecionado(prev => prev - 1)}
            data-testid="button-ano-anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-xl font-semibold min-w-[80px] text-center" data-testid="text-ano-selecionado">
            {anoSelecionado}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setAnoSelecionado(prev => prev + 1)}
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

          {/* GRÁFICO AJUSTADO */}
          <Card className={isDarkMode ? "bg-[#2a2b2e] border-[#44494d]" : "bg-white border border-gray-200 shadow-sm"}>
            <CardHeader>
              <CardTitle>
                Fluxo Mensal e Evolução Acumulada {anoSelecionado}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={360}>
                <ComposedChart
                  data={(dadosMensais || []).map((m, i) => ({
                    mes: m.mes,
                    lucro: m.lucro,
                    depositos: Math.abs(m.depositos),
                    saques: -Math.abs(m.saques),
                    lucroAcumulado: dadosGrafico[i]?.lucroAcumulado ?? 0,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "hsl(var(--border))" : "#e2e8f0"} />
          
                  <XAxis dataKey="mes" stroke={isDarkMode ? "hsl(var(--muted-foreground))" : "#334155"} />
          
                  <YAxis
                    stroke={isDarkMode ? "hsl(var(--muted-foreground))" : "#334155"}
                    tickFormatter={(v) => `R$ ${v.toLocaleString("pt-BR")}`}
                  />
          
                  {/* Tooltip com visual corrigido para dark/light */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1f1f23" : "#ffffff",
                      border: isDarkMode ? "1px solid #3f3f46" : "1px solid #e2e8f0",
                      color: isDarkMode ? "#f8fafc" : "#0f172a",
                    }}
                    formatter={(value: number, name: string) => {
                      const labelMap: any = {
                        lucro: "Lucro Mensal",
                        depositos: "Depósitos",
                        saques: "Saques",
                        lucroAcumulado: "Lucro Acumulado",
                      };
                      return [formatarMoeda(value), labelMap[name] || name];
                    }}
                  />
          
                  {/* LEGEND ajustada */}
                  <Legend
                    layout="horizontal"
                    verticalAlign="top"
                    align="center"
                    wrapperStyle={{ paddingBottom: 20, fontSize: 13 }}
                  />
          
                  {/* Depósitos ROXO MindTrade */}
                  <Bar
                    dataKey="depositos"
                    name="Depósitos"
                    barSize={20}
                    fill="hsl(var(--primary))"
                  />
          
                  {/* Saques */}
                  <Bar
                    dataKey="saques"
                    name="Saques"
                    barSize={20}
                    fill="#f97316"
                  />
          
                  {/* Lucro Mensal dinâmico */}
                  <Bar dataKey="lucro" name="Lucro Mensal" barSize={26}>
                    {(dadosMensais || []).map((m, idx) => (
                      <Cell
                        key={`lm-${idx}`}
                        fill={m.lucro >= 0 ? "#22c55e" : "#ef4444"}
                      />
                    ))}
                  </Bar>
          
                  {/* Linha do acumulado */}
                  <Line
                    type="monotone"
                    dataKey="lucroAcumulado"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                    name="Lucro Acumulado"
                  />
          
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tabela de Dados Mensais */}
          <Card
            className={
              isDarkMode
                ? "bg-[#2a2b2e] border border-[#44494d]" // fundo e borda no modo escuro
                : "bg-white border border-gray-200 shadow-sm" // fundo e borda no modo claro
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
                    <TableHead className="text-right">Valor Inicial</TableHead>
                    <TableHead className="text-right">Lucro/Prejuízo</TableHead>
                    <TableHead className="text-right">Valor Final</TableHead>
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
                          ? "hover:bg-[#383a3e]" // linha com leve destaque no modo escuro
                          : "hover:bg-gray-50" // destaque suave no modo claro
                      }
                    >
                      <TableCell className="font-medium">{mes.mes}</TableCell>
                      <TableCell className="text-right" data-testid={`valor-inicial-${mes.mesNumero}`}>
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
