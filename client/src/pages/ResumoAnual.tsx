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

          {/* Gráfico Acumulado + Depósitos/Saques */}
          <Card
            className={`relative p-4 transition-all duration-300 overflow-visible ${
              isDarkMode
                ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-[0_0_15px_rgba(80,80,120,0.2)]"
                : "bg-white border border-gray-200 shadow-sm"
            }`}
          >
            <CardHeader>
              <CardTitle>
                Evolução Acumulada + Depósitos/Saques ({anoSelecionado})
              </CardTitle>
            </CardHeader>
          
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={dados}>
                  
                  {/* Eixo X */}
                  <XAxis dataKey="mes" tick={{ fill: isDarkMode ? "#fff" : "#000" }} />
          
                  {/* Eixo Y Principal */}
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: isDarkMode ? "#fff" : "#000" }}
                  />
          
                  {/* Eixo Y Secundário (invertido) */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: isDarkMode ? "#fff" : "#000" }}
                    reversed={true}
                  />
          
                  {/* Tooltip — TOTALMENTE LEGÍVEL */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#1f2937" : "#fff",
                      border: "1px solid #444",
                      borderRadius: "8px",
                      color: "#fff"
                    }}
                    itemStyle={{ color: "#fff" }} // <<< AQUI ESTÁ O FIX REAL
                    labelStyle={{ color: "#fff" }}
                    formatter={(value, name) => {
                      if (name === "Lucro Acumulado") {
                        return [value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Lucro Acumulado"];
                      }
                      if (name === "Lucro Mensal") {
                        return [value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Lucro Mensal"];
                      }
                      if (name === "Depósitos") {
                        return [value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Depósitos"];
                      }
                      if (name === "Saques") {
                        return [value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Saques"];
                      }
                      return value;
                    }}
                  />
          
                  {/* GRID */}
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          
                  {/* ÁREA — Lucro Acumulado */}
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="acumulado"
                    name="Lucro Acumulado"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.15}
                  />
          
                  {/* LINHA — Lucro Mensal */}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="lucro"
                    name="Lucro Mensal"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
          
                  {/* BARRA — Depósitos (ROXO MINDTRADE) */}
                  <Bar
                    yAxisId="right"
                    dataKey="depositos"
                    name="Depósitos"
                    fill="#A855F7"   // <<< ROXO FINAL REAL
                    barSize={20}
                  />
          
                  {/* BARRA — Saques */}
                  <Bar
                    yAxisId="right"
                    dataKey="saques"
                    name="Saques"
                    fill="#EF4444"   // vermelho
                    barSize={20}
                  />
          
                  {/* LEGENDA MELHORADA */}
                  <Legend
                    verticalAlign="top"
                    align="center"
                    wrapperStyle={{
                      paddingBottom: "12px",
                      color: isDarkMode ? "#fff" : "#000",
                    }}
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
