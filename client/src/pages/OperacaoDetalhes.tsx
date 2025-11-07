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
  status: 'PENDENTE' | 'CONCLUIDA';
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
  tipoEncerramento: 'AUTOMATICO' | 'MANUAL' | 'PARCIAL';
  oddSaida: string | null;
  resultadoFinanceiro: string | null;
  tempoExposicaoMin: number | null;
  seguiuPlano: boolean | null;
  estadoEmocional: string | null;
  motivacaoEntrada: string | null;
  autoavaliacao: string | null;
  motivacaoSaidaObservacao: string | null;
};

type Equipe = {
  id: number;
  nome: string;
};

type Competicao = {
  id: number;
  nome: string;
};

type Mercado = {
  id: number;
  nome: string;
};

type Estrategia = {
  id: number;
  nome: string;
  mercadoId: number;
};

export default function OperacaoDetalhes() {
  const params = useParams<{ partidaId: string }>();
  const partidaId = parseInt(params.partidaId || '0');
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OperacaoItem | null>(null);
  const { toast } = useToast();

  // Queries
  const { data: operacoes = [], isLoading: isLoadingOperacoes } = useQuery<Operacao[]>({
    queryKey: ['/api/operacoes'],
  });

  const { data: partidas = [] } = useQuery<Partida[]>({
    queryKey: ['/api/partidas'],
  });

  const { data: equipes = [] } = useQuery<Equipe[]>({
    queryKey: ['/api/equipes'],
  });

  const { data: competicoes = [] } = useQuery<Competicao[]>({
    queryKey: ['/api/competicoes'],
  });

  const { data: mercados = [] } = useQuery<Mercado[]>({
    queryKey: ['/api/mercados'],
  });

  const { data: estrategias = [] } = useQuery<Estrategia[]>({
    queryKey: ['/api/estrategias'],
  });

  // Encontrar operação da partida
  const operacao = operacoes.find(op => op.partidaId === partidaId);
  const partida = partidas.find(p => p.id === partidaId);

  // Query para itens da operação
  const { data: itens = [], isLoading: isLoadingItens } = useQuery<OperacaoItem[]>({
    queryKey: [`/api/operacoes/${operacao?.id}/itens`],
    enabled: !!operacao?.id,
  });

  // Mutation para criar operação se não existir
  const createOperacaoMutation = useMutation({
    mutationFn: async (partidaId: number) => {
      return apiRequest('/api/operacoes', 'POST', { partidaId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/operacoes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/partidas'] });
      toast({
        title: "Operação criada",
        description: "A operação foi criada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar operação",
        description: error.message || "Não foi possível criar a operação.",
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar item
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return apiRequest(`/api/operacoes/itens/${itemId}`, 'DELETE');
    },
    onSuccess: () => {
      // Invalidar múltiplas queries relacionadas
      queryClient.invalidateQueries({ queryKey: [`/api/operacoes/${operacao?.id}/itens`] });
      queryClient.invalidateQueries({ queryKey: ['/api/operacoes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/partidas'] });
      toast({
        title: "Item excluído",
        description: "O item foi excluído com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir item",
        description: error.message || "Não foi possível excluir o item.",
        variant: "destructive",
      });
    },
  });

  // Mutation para concluir operação
  const concluirMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/operacoes/${id}/concluir`, 'PATCH');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/operacoes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/partidas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/relatorios'] });
      toast({
        title: "Operação concluída",
        description: "A operação foi marcada como concluída.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao concluir",
        description: error.message || "Não foi possível concluir a operação.",
        variant: "destructive",
      });
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

  const handleDeleteItem = (itemId: number) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      deleteItemMutation.mutate(itemId);
    }
  };

  const handleConcluir = () => {
    if (!operacao) return;

    const todosComResultado = itens.every(item => item.resultadoFinanceiro !== null);
    if (!todosComResultado) {
      toast({
        title: "Operação incompleta",
        description: "Todos os itens devem ter resultado financeiro preenchido antes de concluir.",
        variant: "destructive",
      });
      return;
    }

    if (confirm("Tem certeza que deseja concluir esta operação?")) {
      concluirMutation.mutate(operacao.id);
    }
  };

  const getMercadoNome = (mercadoId: number) => {
    return mercados.find(m => m.id === mercadoId)?.nome || '';
  };

  const getEstrategiaInfo = (estrategiaId: number) => {
    const estrategia = estrategias.find(e => e.id === estrategiaId);
    if (!estrategia) return { nome: '', mercadoNome: '' };
    
    const mercado = mercados.find(m => m.id === estrategia.mercadoId);
    return {
      nome: estrategia.nome,
      mercadoNome: mercado?.nome || '',
    };
  };

  const calcularEstatisticas = () => {
    const totalStake = itens.reduce((acc, item) => acc + parseFloat(item.stake || '0'), 0);
    const resultadoTotal = itens.reduce((acc, item) => acc + parseFloat(item.resultadoFinanceiro || '0'), 0);
    const roi = totalStake > 0 ? (resultadoTotal / totalStake) * 100 : 0;

    return { totalStake, resultadoTotal, roi };
  };

  if (!partida) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Partida não encontrada.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setLocation('/partidas')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Partidas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mandante = equipes.find(e => e.id === partida.mandanteId)?.nome || '';
  const visitante = equipes.find(e => e.id === partida.visitanteId)?.nome || '';
  const competicao = competicoes.find(c => c.id === partida.competicaoId)?.nome || '';

  const isLoading = isLoadingOperacoes || createOperacaoMutation.isPending;
  const stats = calcularEstatisticas();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation('/partidas')}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Partidas
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">
              {mandante} vs {visitante}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-muted-foreground">{competicao}</p>
              {operacao && (
                <Badge variant={operacao.status === 'CONCLUIDA' ? 'default' : 'secondary'}>
                  {operacao.status === 'CONCLUIDA' ? 'Concluída' : 'Pendente'}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(partida.data), 'dd/MM/yyyy', { locale: ptBR })} às {partida.hora}
            </p>
          </div>
          
          {operacao && (
            <div className="flex gap-2">
              <Button
                onClick={handleAddItem}
                data-testid="button-add-item"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
              {itens.length > 0 && operacao.status === 'PENDENTE' && (
                <Button
                  variant="default"
                  onClick={handleConcluir}
                  data-testid="button-concluir"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Concluir Operação
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Carregando operação...</p>
          </CardContent>
        </Card>
      ) : !operacao ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma operação encontrada para esta partida.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Estatísticas */}
          {itens.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Investido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-mono font-bold">
                    R$ {stats.totalStake.toFixed(2).replace('.', ',')}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Resultado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-mono font-bold ${
                    stats.resultadoTotal > 0 ? 'text-green-600' : 
                    stats.resultadoTotal < 0 ? 'text-red-600' : ''
                  }`}>
                    R$ {stats.resultadoTotal.toFixed(2).replace('.', ',')}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    ROI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-mono font-bold ${
                    stats.roi > 0 ? 'text-green-600' : 
                    stats.roi < 0 ? 'text-red-600' : ''
                  }`}>
                    {stats.roi.toFixed(2).replace('.', ',')}%
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Itens da Operação */}
          <Card>
            <CardHeader>
              <CardTitle>Itens da Operação</CardTitle>
            </CardHeader>
            <CardContent>
              {itens.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Nenhum item registrado nesta operação.
                  </p>
                  {operacao.status === 'PENDENTE' && (
                    <Button onClick={handleAddItem} data-testid="button-add-first-item">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Item
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {itens.map((item) => {
                    const estrategiaInfo = getEstrategiaInfo(item.estrategiaId);
                    const resultado = item.resultadoFinanceiro ? parseFloat(item.resultadoFinanceiro) : null;
                    
                    return (
                      <Card key={item.id} data-testid={`card-item-${item.id}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              {/* Linha única com todas as informações principais */}
                              <div className="flex items-center gap-3 flex-nowrap overflow-x-auto text-sm">
                                <Badge variant="outline" className="shrink-0">{estrategiaInfo.mercadoNome}</Badge>
                                <Badge className="shrink-0">{estrategiaInfo.nome}</Badge>
                                <div className="shrink-0">
                                  <span className="text-muted-foreground">Stake:</span>
                                  <span className="ml-1 font-mono font-semibold">
                                    R$ {parseFloat(item.stake).toFixed(2).replace('.', ',')}
                                  </span>
                                </div>
                                <div className="shrink-0">
                                  <span className="text-muted-foreground">Entrada:</span>
                                  <span className="ml-1 font-mono font-semibold">
                                    {parseFloat(item.oddEntrada).toFixed(2).replace('.', ',')}
                                  </span>
                                </div>
                                {item.oddSaida && (
                                  <div className="shrink-0">
                                    <span className="text-muted-foreground">Saída:</span>
                                    <span className="ml-1 font-mono font-semibold">
                                      {parseFloat(item.oddSaida).toFixed(2).replace('.', ',')}
                                    </span>
                                  </div>
                                )}
                                {resultado !== null && (
                                  <div className="shrink-0">
                                    <span className="text-muted-foreground">Resultado:</span>
                                    <span className={`ml-1 font-mono font-semibold ${
                                      resultado > 0 ? 'text-green-600' : 
                                      resultado < 0 ? 'text-red-600' : ''
                                    }`}>
                                      R$ {resultado.toFixed(2).replace('.', ',')}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {item.motivacaoEntrada && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Motivação:</span>
                                  <span className="ml-2">{item.motivacaoEntrada}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditItem(item)}
                                data-testid={`button-edit-item-${item.id}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                                data-testid={`button-delete-item-${item.id}`}
                              >
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
        </>
      )}

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
