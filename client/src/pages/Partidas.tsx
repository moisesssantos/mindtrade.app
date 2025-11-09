import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueries } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, TrendingUp, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLocation } from "wouter";
import { PartidaDialog } from "@/components/PartidaDialog";
import { PreAnaliseDialog } from "@/components/PreAnaliseDialog";
import { ArquivarPartidaDialog } from "@/components/ArquivarPartidaDialog";

interface Partida {
  id: number;
  data: string;
  hora: string;
  competicaoId: number;
  mandanteId: number;
  visitanteId: number;
  oddMandante: string | null;
  oddVisitante: string | null;
  oddEmpate: string | null;
  status:
    | "PRE_ANALISE"
    | "OPERACAO_PENDENTE"
    | "OPERACAO_CONCLUIDA"
    | "NAO_OPERADA";
}

interface Equipe {
  id: number;
  nome: string;
}

interface Competicao {
  id: number;
  nome: string;
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString + "T00:00:00");
  return !isNaN(date.getTime());
}

export default function Partidas() {
  const [partidaDialogOpen, setPartidaDialogOpen] = useState(false);
  const [preAnaliseDialogOpen, setPreAnaliseDialogOpen] = useState(false);
  const [arquivarDialogOpen, setArquivarDialogOpen] = useState(false);
  const [selectedPartida, setSelectedPartida] = useState<Partida | null>(null);
  const [preAnaliseData, setPreAnaliseData] = useState<any>(null);
  const { toast } = useToast();
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
  const { data: partidas = [], isLoading: isLoadingPartidas } =
    useQuery<Partida[]>({
      queryKey: ["/api/partidas"],
    });

  const { data: equipes = [] } = useQuery<Equipe[]>({
    queryKey: ["/api/equipes"],
  });

  const { data: competicoes = [] } = useQuery<Competicao[]>({
    queryKey: ["/api/competicoes"],
  });

  const { data: operacoes = [] } = useQuery<any[]>({
    queryKey: ["/api/operacoes"],
  });

  const { data: preAnalises = [] } = useQuery<any[]>({
    queryKey: ["/api/pre-analises"],
  });

  const { data: mercados = [] } = useQuery<any[]>({
    queryKey: ["/api/mercados"],
  });

  const { data: estrategias = [] } = useQuery<any[]>({
    queryKey: ["/api/estrategias"],
  });

  const itensQueries = useQueries({
    queries: operacoes.map((op: any) => ({
      queryKey: [`/api/operacoes/${op.id}/itens`],
      enabled: !!op.id,
    })),
  });

  const operacoesComItens = operacoes.map((op: any, index: number) => ({
    ...op,
    itens: itensQueries[index]?.data || [],
  }));

  // === Mutations ===
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/partidas/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partidas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pre-analises"] });
      queryClient.invalidateQueries({ queryKey: ["/api/operacoes"] });
      toast({ title: "Partida excluída com sucesso" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir partida",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createPartidaMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/partidas", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partidas"] });
      toast({ title: "Partida criada com sucesso" });
      setPartidaDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar partida",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePartidaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/partidas/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partidas"] });
      toast({ title: "Partida atualizada com sucesso" });
      setPartidaDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar partida",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createPreAnaliseMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/pre-analises", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partidas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pre-analises"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/pre-analises/com-partidas"],
      });
      toast({ title: "Pré-análise criada com sucesso" });
      setPreAnaliseDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar pré-análise",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePreAnaliseMutation = useMutation({
    mutationFn: ({ partidaId, data }: { partidaId: number; data: any }) =>
      apiRequest(`/api/pre-analises/${partidaId}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partidas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pre-analises"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/pre-analises/com-partidas"],
      });
      toast({ title: "Pré-análise atualizada com sucesso" });
      setPreAnaliseDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar pré-análise",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createOperacaoMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/operacoes", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operacoes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partidas"] });
      toast({ title: "Operação criada com sucesso" });
      setLocation("/operacoes");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar operação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const arquivarPartidaMutation = useMutation({
    mutationFn: ({ id, justificativa }: { id: number; justificativa: string }) =>
      apiRequest(`/api/partidas/${id}/marcar-nao-operada`, "PATCH", {
        justificativa,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partidas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pre-analises"] });
      toast({ title: "Partida arquivada com sucesso" });
      setArquivarDialogOpen(false);
      setSelectedPartida(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao arquivar partida",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // === Auxiliares ===
  const getEquipeNome = (id: number) =>
    equipes.find((e) => e.id === id)?.nome || "Carregando...";
  const getCompeticaoNome = (id: number) =>
    competicoes.find((c) => c.id === id)?.nome || "Carregando...";
  const formatOdd = (odd: string | null) =>
    odd ? parseFloat(odd).toFixed(2).replace(".", ",") : "-";
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      value
    );

  const partidasAtivas = [...partidas]
    .filter((p) =>
      ["PENDENTE", "PRE_ANALISE", "OPERACAO_PENDENTE"].includes(p.status)
    )
    .sort((a, b) => {
      const dateA = new Date(`${a.data}T${a.hora}`);
      const dateB = new Date(`${b.data}T${b.hora}`);
      return dateA.getTime() - dateB.getTime();
    });

  // === UI ===
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Partidas</h1>
          <p className="text-muted-foreground">
            Gerencie partidas e pré-análises
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedPartida(null);
            setPartidaDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Partida
        </Button>
      </div>

      {isLoadingPartidas ? (
        <Card
          className={
            isDarkMode
              ? "p-6 bg-[#2a2b2e] border border-[#44494d]"
              : "p-6 bg-white border border-gray-200 shadow-sm"
          }
        >
          <p className="text-center text-muted-foreground">
            Carregando partidas...
          </p>
        </Card>
      ) : partidasAtivas.length === 0 ? (
        <Card
          className={
            isDarkMode
              ? "p-6 bg-[#2a2b2e] border border-[#44494d]"
              : "p-6 bg-white border border-gray-200 shadow-sm"
          }
        >
          <p className="text-center text-muted-foreground">
            Nenhuma partida ativa. As partidas concluídas estão disponíveis na
            tela de Operações.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {partidasAtivas.map((partida) => {
            const preAnalise = preAnalises.find(
              (pa: any) => pa.partidaId === partida.id
            );
            const operacaoResumo = operacoesComItens.find(
              (op: any) => op.partidaId === partida.id
            );

            return (
              <Card
                key={partida.id}
                className={
                  isDarkMode
                    ? "p-4 bg-[#2a2b2e] border border-[#44494d]"
                    : "p-4 bg-white border border-gray-200 shadow-sm"
                }
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800">
                        {partida.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(
                          new Date(partida.data + "T00:00:00"),
                          "dd/MM/yyyy",
                          { locale: ptBR }
                        )}{" "}
                        às {partida.hora}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-1" />
                        Pré-Análise
                      </Button>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Operação
                      </Button>
                      <Button variant="outline" size="sm">
                        <Archive className="w-4 h-4 mr-1" />
                        Arquivar
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      {getCompeticaoNome(partida.competicaoId)}:{" "}
                    </span>
                    <span className="font-semibold">
                      {getEquipeNome(partida.mandanteId)} vs{" "}
                      {getEquipeNome(partida.visitanteId)}
                    </span>
                  </div>

                  {(partida.oddMandante ||
                    partida.oddEmpate ||
                    partida.oddVisitante) && (
                    <div className="flex gap-6 text-sm">
                      <div className="flex gap-1">
                        <span className="text-muted-foreground">M:</span>
                        <span className="font-mono">
                          {formatOdd(partida.oddMandante)}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-muted-foreground">E:</span>
                        <span className="font-mono">
                          {formatOdd(partida.oddEmpate)}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-muted-foreground">V:</span>
                        <span className="font-mono">
                          {formatOdd(partida.oddVisitante)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <PartidaDialog
        open={partidaDialogOpen}
        onClose={() => {
          setPartidaDialogOpen(false);
          setSelectedPartida(null);
        }}
        onSubmit={() => {}}
        equipes={equipes}
        competicoes={competicoes}
      />

      <PreAnaliseDialog
        open={preAnaliseDialogOpen}
        onClose={() => {
          setPreAnaliseDialogOpen(false);
          setSelectedPartida(null);
          setPreAnaliseData(null);
        }}
        onSubmit={() => {}}
      />

      <ArquivarPartidaDialog
        open={arquivarDialogOpen}
        onClose={() => {
          setArquivarDialogOpen(false);
          setSelectedPartida(null);
        }}
        onSubmit={() => {}}
      />
    </div>
  );
}
