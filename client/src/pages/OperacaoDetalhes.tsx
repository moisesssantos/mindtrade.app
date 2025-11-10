import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Pencil, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import OperacaoItemDialog from "@/components/OperacaoItemDialog";

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
  tipoEncerramento: "AUTOMATICO" | "MANUAL" | "PARCIAL";
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

export default function OperacaoDetalhes() {
  const params = useParams<{ partidaId: string }>();
  const partidaId = parseInt(params.partidaId || "0");
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OperacaoItem | null>(null);
  const { toast } = useToast();

  // ✅ Detectar modo escuro/claro dinamicamente
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

  // Encontrar operação da partida
  const operacao = operacoes.find((op) => op.partidaId === partidaId);
  const partida = partidas.find((p) => p.id === partidaId);

  // Query para itens da operação
  const { data: itens = [], isLoading: isLoadingItens } = useQuery<OperacaoItem[]>({
    queryKey: [`/api/operacoes/${operacao?.id}/itens`],
    enabled: !!operacao?.id,
  });

  // Mutations (criar, excluir item, concluir operação)
  const createOperacaoMutation = useMutation({
    mutationFn: (partidaId: number) => apiRequest("/api/operacoes", "POST", { partidaId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operacoes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partidas"] });
      toast({ title: "Operação criada", description: "Operação criada com sucesso." });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => apiRequest(`/api/operacoes/itens/${itemId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/operacoes/${operacao?.id}/itens`] });
      queryClient.invalidateQueries({ queryKey: ["/api/operacoes"] });
      toast({ title: "Item excluído", description: "O item foi excluído com sucesso." });
    },
  });

  const concluirMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/operacoes/${id}/concluir`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operacoes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partidas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/relatorios"] });
      toast({ title: "Operação concluída", description: "A operação foi marcada como concluída." });
    },
  });

  // Criar operação se não existir
  useEffect(() => {
    if (!isLoadingOperacoes && !operacao && partidaId && partida) {
      createOperacaoMutation.mutate(partidaId);
    }
  }, [isLoadingOperacoes, operacao, partidaId, partida]);
  const handleAddItem = () => {
    setSelectedItem(null);
    setDialogOpen(true);
  };

  const handleEditItem = (item: OperacaoItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleDeleteItem = (id: number) => {
    if (confirm("Deseja realmente excluir este item?")) {
      deleteItemMutation.mutate(id);
    }
  };

  const handleConcluir = () => {
    if (!operacao) return;
    const todosComResultado = itens.every((i) => i.resultadoFinanceiro !== null);
    if (!todosComResultado) {
      toast({
        title: "Operação incompleta",
        description: "Todos os itens devem ter resultado financeiro antes de concluir.",
        variant: "destructive",
      });
      return;
    }
    if (confirm("Concluir esta operação?")) concluirMutation.mutate(operacao.id);
  };

  const getEstrategiaInfo = (id: number) => {
    const e = estrategias.find((e) => e.id === id);
    const m = mercados.find((m) => m.id === e?.mercadoId);
    return { nome: e?.nome || "", mercadoNome: m?.nome || "" };
  };

  const calcularEstatisticas = () => {
    const stake = itens.reduce((s, i) => s + parseFloat(i.stake || "0"), 0);
    const res = itens.reduce((s, i) => s + parseFloat(i.resultadoFinanceiro || "0"), 0);
    return { stake, res, roi: stake ? (res / stake) * 100 : 0 };
  };

  if (!partida)
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground mb-4">Partida não encontrada.</p>
        <Button onClick={() => setLocation("/partidas")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    );

  const mandante = equipes.find((e) => e.id === partida.mandanteId)?.nome || "";
  const visitante = equipes.find((e) => e.id === partida.visitanteId)?.nome || "";
  const competicao = competicoes.find((c) => c.id === partida.competicaoId)?.nome || "";
  const stats = calcularEstatisticas();

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => setLocation("/partidas")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Partidas
      </Button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{mandante} vs {visitante}</h1>
          <div className="flex gap-2 mt-1 items-center">
            <p className="text-muted-foreground">{competicao}</p>
            {operacao && (
              <Badge variant={operacao.status === "CONCLUIDA" ? "default" : "secondary"}>
                {operacao.status === "CONCLUIDA" ? "Concluída" : "Pendente"}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(partida.data), "dd/MM/yyyy", { locale: ptBR })} às {partida.hora}
          </p>
        </div>

        {operacao && (
          <div className="flex gap-2">
            <Button onClick={handleAddItem}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Item
            </Button>
            {itens.length > 0 && operacao.status === "PENDENTE" && (
              <Button onClick={handleConcluir} variant="default">
                <Check className="w-4 h-4 mr-2" /> Concluir
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Estatísticas */}
      {itens.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Investido", value: `R$ ${stats.stake.toFixed(2).replace(".", ",")}` },
            { label: "Resultado", value: `R$ ${stats.res.toFixed(2).replace(".", ",")}`, color: stats.res > 0 ? "text-green-600" : stats.res < 0 ? "text-red-600" : "" },
            { label: "ROI", value: `${stats.roi.toFixed(2).replace(".", ",")}%`, color: stats.roi > 0 ? "text-green-600" : stats.roi < 0 ? "text-red-600" : "" },
          ].map((s, i) => (
            <Card
              key={i}
              className={`transition-colors duration-300 ${
                isDarkMode
                  ? "bg-[#2a2b2e] border border-[#44494d]"
                  : "bg-white border border-gray-200 shadow-sm"
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-mono font-bold ${s.color}`}>{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Itens da Operação */}
      <Card className={`transition-colors duration-300 ${
        isDarkMode
          ? "bg-[#2a2b2e] border border-[#44494d]"
          : "bg-white border border-gray-200 shadow-sm"
      }`}>
        <CardHeader><CardTitle>Itens da Operação</CardTitle></CardHeader>
        <CardContent>
          {itens.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Nenhum item registrado.</p>
              {operacao?.status === "PENDENTE" && (
                <Button onClick={handleAddItem}>
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Primeiro Item
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {itens.map((item) => {
                const info = getEstrategiaInfo(item.estrategiaId);
                const resultado = item.resultadoFinanceiro ? parseFloat(item.resultadoFinanceiro) : 0;
                return (
                  <Card
                    key={item.id}
                    className={`transition-colors duration-300 ${
                      isDarkMode
                        ? "bg-[#2a2b2e] border border-[#44494d]"
                        : "bg-white border border-gray-200 shadow-sm"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <Badge variant="outline">{info.mercadoNome}</Badge>
                            <Badge>{info.nome}</Badge>
                            <span className="text-muted-foreground">Stake:</span>
                            <span className="font-mono font-semibold">
                              R$ {parseFloat(item.stake).toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-muted-foreground">Entrada:</span>
                            <span className="font-mono font-semibold">
                              {parseFloat(item.oddEntrada).toFixed(2).replace(".", ",")}
                            </span>
                            {item.oddSaida && (
                              <>
                                <span className="text-muted-foreground">Saída:</span>
                                <span className="font-mono font-semibold">
                                  {parseFloat(item.oddSaida).toFixed(2).replace(".", ",")}
                                </span>
                              </>
                            )}
                            <span className="text-muted-foreground">Resultado:</span>
                            <span className={`font-mono font-semibold ${
                              resultado > 0 ? "text-green-600" : resultado < 0 ? "text-red-600" : ""
                            }`}>
                              R$ {resultado.toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                          {item.motivacaoEntrada && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Motivação:</span>{" "}
                              {item.motivacaoEntrada}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {operacao && (
        <OperacaoItemDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setSelectedItem(null);
          }}
          operacaoId={operacao.id}
          item={selectedItem}
          mercados={mercados}
          estrategias={estrategias}
        />
      )}
    </div>
  );
}
