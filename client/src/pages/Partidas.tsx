import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueries } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, TrendingUp, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, addHours } from "date-fns";
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
  status: "PRE_ANALISE" | "OPERACAO_PENDENTE" | "OPERACAO_CONCLUIDA" | "NAO_OPERADA";
}

interface Equipe {
  id: number;
  nome: string;
}

interface Competicao {
  id: number;
  nome: string;
}

// Helper function to validate if a date string is valid
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

  // ✅ Detectar modo escuro/claro (idêntico ao menu Pré-Análises)
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

  // Queries
  const { data: partidas = [], isLoading: isLoadingPartidas } = useQuery<Partida[]>({
    queryKey: ['/api/partidas'],
  });

  const { data: equipes = [] } = useQuery<Equipe[]>({
    queryKey: ['/api/equipes'],
  });

  const { data: competicoes = [] } = useQuery<Competicao[]>({
    queryKey: ['/api/competicoes'],
  });

  const { data: operacoes = [] } = useQuery<any[]>({
    queryKey: ['/api/operacoes'],
  });

  const { data: preAnalises = [] } = useQuery<any[]>({
    queryKey: ['/api/pre-analises'],
  });

  const { data: mercados = [] } = useQuery<any[]>({
    queryKey: ['/api/mercados'],
  });

  const { data: estrategias = [] } = useQuery<any[]>({
    queryKey: ['/api/estrategias'],
  });

  // Buscar itens de cada operação usando useQueries
  const itensQueries = useQueries({
    queries: operacoes.map((op: any) => ({
      queryKey: [`/api/operacoes/${op.id}/itens`],
      enabled: !!op.id,
    })),
  });

  // Combinar operações com seus itens
  const operacoesComItens = operacoes.map((op: any, index: number) => ({
    ...op,
    itens: itensQueries[index]?.data || []
  }));

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/partidas/${id}`, 'DELETE'),
    onSuccess: () => {
      // Invalidar múltiplas queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['/api/partidas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pre-analises'] });
      queryClient.invalidateQueries({ queryKey: ['/api/operacoes'] });
      toast({ title: "Partida excluída com sucesso" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao excluir partida", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const createPartidaMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/partidas', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partidas'] });
      toast({ title: "Partida criada com sucesso" });
      setPartidaDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar partida", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updatePartidaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest(`/api/partidas/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partidas'] });
      toast({ title: "Partida atualizada com sucesso" });
      setPartidaDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar partida", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const createPreAnaliseMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/pre-analises', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partidas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pre-analises'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pre-analises/com-partidas'] });
      toast({ title: "Pré-análise criada com sucesso" });
      setPreAnaliseDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar pré-análise", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updatePreAnaliseMutation = useMutation({
    mutationFn: ({ partidaId, data }: { partidaId: number; data: any }) => apiRequest(`/api/pre-analises/${partidaId}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partidas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pre-analises'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pre-analises/com-partidas'] });
      toast({ title: "Pré-análise atualizada com sucesso" });
      setPreAnaliseDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar pré-análise", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const createOperacaoMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/operacoes', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/operacoes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/partidas'] });
      toast({ title: "Operação criada com sucesso" });
      setLocation('/operacoes');
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar operação", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const arquivarPartidaMutation = useMutation({
    mutationFn: ({ id, justificativa }: { id: number; justificativa: string }) => 
      apiRequest(`/api/partidas/${id}/marcar-nao-operada`, 'PATCH', { justificativa }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partidas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pre-analises'] });
      toast({ title: "Partida arquivada com sucesso" });
      setArquivarDialogOpen(false);
      setSelectedPartida(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao arquivar partida", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleEdit = (partida: Partida) => {
    setSelectedPartida(partida);
    setPartidaDialogOpen(true);
  };

  const handleAddPreAnalise = (partida: Partida) => {
  setSelectedPartida(partida);

  // Busca a pré-análise da partida já carregada via React Query
  const existente = preAnalises.find((pa: any) => pa.partidaId === partida.id);

  if (existente) {
    setPreAnaliseData(existente);
  } else {
    setPreAnaliseData(null);
  }

  setPreAnaliseDialogOpen(true);
};

  const handleOperacao = (partida: Partida) => {
    // Navega direto para a página de detalhes da operação dessa partida
    // A página criará automaticamente uma operação se não existir
    setLocation(`/operacoes/${partida.id}`);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta partida?")) {
      deleteMutation.mutate(id);
    }
  };

  const handlePartidaSubmit = (data: any) => {
    if (selectedPartida?.id) {
      updatePartidaMutation.mutate({ id: selectedPartida.id, data });
    } else {
      createPartidaMutation.mutate(data);
    }
  };

  const handlePreAnaliseSubmit = (data: any) => {
    if (!selectedPartida) return;
    if (preAnaliseData) {
      // Atualizar pré-análise existente
      updatePreAnaliseMutation.mutate({ partidaId: selectedPartida.id, data });
    } else {
      // Criar nova pré-análise
      createPreAnaliseMutation.mutate(data);
    }
  };

  const handleArquivar = (partida: Partida) => {
    setSelectedPartida(partida);
    setArquivarDialogOpen(true);
  };

  const handleArquivarSubmit = (data: { justificativa: string }) => {
    if (!selectedPartida) return;
    arquivarPartidaMutation.mutate({ 
      id: selectedPartida.id, 
      justificativa: data.justificativa 
    });
  };

  // Verifica se passaram 24 horas da hora da partida
  const passou24Horas = (partida: Partida): boolean => {
    try {
      const dataHoraPartida = new Date(`${partida.data}T${partida.hora}`);
      const agora = new Date();
      const diferencaMs = agora.getTime() - dataHoraPartida.getTime();
      const diferencaHoras = diferencaMs / (1000 * 60 * 60);
      return diferencaHoras >= 24;
    } catch {
      return false;
    }
  };

  const getEquipeNome = (id: number) => {
    return equipes.find(e => e.id === id)?.nome || 'Carregando...';
  };

  const getCompeticaoNome = (id: number) => {
    return competicoes.find(c => c.id === id)?.nome || 'Carregando...';
  };

  const formatOdd = (odd: string | null) => {
    if (!odd) return '-';
    return parseFloat(odd).toFixed(2).replace('.', ',');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PRE_ANALISE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'OPERACAO_PENDENTE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'OPERACAO_CONCLUIDA': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'NAO_OPERADA': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PRE_ANALISE': return 'Pré-Análise';
      case 'OPERACAO_PENDENTE': return 'Operação Pendente';
      case 'OPERACAO_CONCLUIDA': return 'Operação Concluída';
      case 'NAO_OPERADA': return 'Não Operada';
      default: return status;
    }
  };

  const getPreAnalise = (partidaId: number) => {
    return preAnalises.find((pa: any) => pa.partidaId === partidaId);
  };

  const getOperacaoResumo = (partidaId: number) => {
    // Buscar operação da partida
    const operacao = operacoesComItens.find((o: any) => o.partidaId === partidaId);
    if (!operacao) return null;

    // Buscar itens da operação
    const itens = operacao.itens || [];
    if (itens.length === 0) return null;

    // Calcular totais
    const totalStake = itens.reduce((sum: number, item: any) => sum + parseFloat(item.stake || 0), 0);
    const totalResultado = itens.reduce((sum: number, item: any) => sum + parseFloat(item.resultadoFinanceiro || 0), 0);

    // Pegar informações do primeiro item (para exibir)
    const primeiroItem = itens[0];
    const mercado = mercados.find((m: any) => m.id === primeiroItem.mercadoId);
    const estrategia = estrategias.find((e: any) => e.id === primeiroItem.estrategiaId);

    return {
      mercado: mercado?.nome || '',
      estrategia: estrategia?.nome || '',
      stake: totalStake,
      resultado: totalResultado,
      qtdItens: itens.length
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filtrar apenas partidas em fluxo ativo (área de trabalho) e ordenar por data/hora
  const partidasAtivas = [...partidas]
    .filter(p => ['PENDENTE', 'PRE_ANALISE', 'OPERACAO_PENDENTE'].includes(p.status))
    .sort((a, b) => {
      const dateA = new Date(`${a.data}T${a.hora}`);
      const dateB = new Date(`${b.data}T${b.hora}`);
      return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Partidas</h1>
          <p className="text-muted-foreground">Gerencie partidas e pré-análises</p>
        </div>
        <Button onClick={() => {
          setSelectedPartida(null);
          setPartidaDialogOpen(true);
        }} data-testid="button-nova-partida">
          <Plus className="w-4 h-4 mr-2" />
          Nova Partida
        </Button>
      </div>

      {isLoadingPartidas ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Carregando partidas...</p>
        </Card>
      ) : partidasAtivas.length === 0 ? (
        <Card
          className={`p-6 transition-colors duration-300 ${
            isDarkMode
              ? "bg-[#2a2b2e] border border-[#44494d]"
              : "bg-white border border-gray-200 shadow-sm"
          }`}
        >
          <p className="text-center text-muted-foreground">
            Nenhuma partida ativa. As partidas concluídas estão disponíveis na tela de Operações.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {partidasAtivas.map((partida) => {
            const preAnalise = getPreAnalise(partida.id);
            const operacaoResumo = getOperacaoResumo(partida.id);
            const isConcluida = partida.status === 'OPERACAO_CONCLUIDA';
            // Desabilita pré-análise apenas se houver operação COM itens
            const operacaoComItens = operacoesComItens.find((o: any) => o.partidaId === partida.id);
            const temOperacao = operacaoComItens && operacaoComItens.itens && operacaoComItens.itens.length > 0;
            
            // "Arquivar" aparece sempre que existe pré-análise e não há itens na operação
          const podeArquivar = !!preAnalise && !(operacaoComItens?.itens?.length > 0);
            
            return (
              <Card
  key={partida.id}
  className={`p-4 transition-colors duration-300 ${
    isDarkMode
      ? "bg-[#2a2b2e] border border-[#44494d]"
      : "bg-white border border-gray-200 shadow-sm"
  }`}
  data-testid={`card-partida-${partida.id}`}
>

                <div className="space-y-2">
                  {/* Linha 1: Status, Data/Hora e Botões inline */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBadgeColor(partida.status)}`}>
                        {getStatusLabel(partida.status)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {partida.data && isValidDate(partida.data)
                          ? format(addHours(new Date(partida.data + 'T00:00:00'), 3), 'dd/MM/yyyy', { locale: ptBR })
                          : partida.data} às {partida.hora}
                      </span>
                    </div>
                    
                    {/* Botões inline */}
                    <div className="flex items-center gap-2">
                      {!isConcluida && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAddPreAnalise(partida)}
                            disabled={temOperacao}
                            data-testid={`button-pre-analise-${partida.id}`}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Pré-Análise
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOperacao(partida)}
                            data-testid={`button-operacao-${partida.id}`}
                          >
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Operação
                          </Button>
                          {podeArquivar && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleArquivar(partida)}
                              data-testid={`button-arquivar-${partida.id}`}
                            >
                              <Archive className="w-4 h-4 mr-1" />
                              Arquivar
                            </Button>
                          )}
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(partida)}
                        data-testid={`button-editar-${partida.id}`}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(partida.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-deletar-${partida.id}`}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                    
                  {/* Linha 2: Competição, Equipes e Resumo da Operação inline */}
                  <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
                    <div>
                      <span className="text-sm text-muted-foreground">{getCompeticaoNome(partida.competicaoId)}: </span>
                      <span className="text-base font-semibold">
                        {getEquipeNome(partida.mandanteId)} vs {getEquipeNome(partida.visitanteId)}
                      </span>
                    </div>
                    {operacaoResumo && (
                      <div className="text-sm flex flex-wrap items-baseline gap-x-2">
                        <span className="font-medium">{operacaoResumo.qtdItens} Op.</span>
                        <span className="text-muted-foreground">Total Investido:</span>
                        <span className="font-mono">{formatCurrency(operacaoResumo.stake)}</span>
                        <span className="text-muted-foreground">Resultado:</span>
                        <span className={`font-mono font-semibold ${operacaoResumo.resultado >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(operacaoResumo.resultado)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Odds - mais compactas */}
                  {(partida.oddMandante || partida.oddEmpate || partida.oddVisitante) && (
                    <div className="flex gap-6 text-sm">
                      <div className="flex gap-1">
                        <span className="text-muted-foreground">M:</span>
                        <span className="font-mono">{formatOdd(partida.oddMandante)}</span>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-muted-foreground">E:</span>
                        <span className="font-mono">{formatOdd(partida.oddEmpate)}</span>
                      </div>
                      <div className="flex gap-1">
                        <span className="text-muted-foreground">V:</span>
                        <span className="font-mono">{formatOdd(partida.oddVisitante)}</span>
                      </div>
                    </div>
                  )}

                  {/* Resumo da Pré-Análise em uma única linha */}
                  {preAnalise && (preAnalise.tendenciaEsperada || preAnalise.destaqueEssencial) && (
                    <div className="pt-2 border-t text-sm">
                      <span className="text-muted-foreground">Tendência: </span>
                      <span className="font-medium">{preAnalise.tendenciaEsperada || '-'}</span>
                      <span className="mx-2 text-muted-foreground">-</span>
                      <span className="text-muted-foreground">Destaque: </span>
                      <span className="font-medium">{preAnalise.destaqueEssencial || '-'}</span>
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
        onSubmit={handlePartidaSubmit}
        initialData={selectedPartida ? {
          id: selectedPartida.id,
          data: selectedPartida.data,
          hora: selectedPartida.hora,
          competicaoId: selectedPartida.competicaoId,
          mandanteId: selectedPartida.mandanteId,
          visitanteId: selectedPartida.visitanteId,
          oddMandante: selectedPartida.oddMandante ? parseFloat(selectedPartida.oddMandante) : undefined,
          oddVisitante: selectedPartida.oddVisitante ? parseFloat(selectedPartida.oddVisitante) : undefined,
          oddEmpate: selectedPartida.oddEmpate ? parseFloat(selectedPartida.oddEmpate) : undefined,
        } : undefined}
        equipes={equipes}
        competicoes={competicoes}
        isLoading={createPartidaMutation.isPending || updatePartidaMutation.isPending}
      />

      <PreAnaliseDialog
        open={preAnaliseDialogOpen}
        onClose={() => {
          setPreAnaliseDialogOpen(false);
          setSelectedPartida(null);
          setPreAnaliseData(null);
        }}
        onSubmit={handlePreAnaliseSubmit}
        partidaId={selectedPartida?.id || 0}
        initialData={preAnaliseData}
        isLoading={createPreAnaliseMutation.isPending || updatePreAnaliseMutation.isPending}
      />

      <ArquivarPartidaDialog
        open={arquivarDialogOpen}
        onClose={() => {
          setArquivarDialogOpen(false);
          setSelectedPartida(null);
        }}
        onSubmit={handleArquivarSubmit}
        isLoading={arquivarPartidaMutation.isPending}
      />
    </div>
  );
}
