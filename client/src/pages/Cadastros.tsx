import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import CadastroTable from "@/components/CadastroTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EquipeDialog, CompeticaoDialog, MercadoDialog, EstrategiaDialog } from "@/components/CadastroDialog";
import { TransacaoDialog } from "@/components/TransacaoDialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Equipe, Competicao, Mercado, Estrategia, TransacaoFinanceira } from "@shared/schema";
import { format, parseISO } from "date-fns";

type DialogState = {
  type: 'equipe' | 'competicao' | 'mercado' | 'estrategia' | 'transacao' | null;
  mode: 'add' | 'edit';
  data?: any;
};

export default function Cadastros() {
  const [dialogState, setDialogState] = useState<DialogState>({ type: null, mode: 'add' });
  const { toast } = useToast();

  // Queries
  const { data: equipes = [], isLoading: isLoadingEquipes } = useQuery<Equipe[]>({
    queryKey: ['/api/equipes'],
  });

  const { data: competicoes = [], isLoading: isLoadingCompeticoes } = useQuery<Competicao[]>({
    queryKey: ['/api/competicoes'],
  });

  const { data: mercados = [], isLoading: isLoadingMercados } = useQuery<Mercado[]>({
    queryKey: ['/api/mercados'],
  });

  const { data: estrategias = [], isLoading: isLoadingEstrategias } = useQuery<Estrategia[]>({
    queryKey: ['/api/estrategias'],
  });

  const { data: transacoes = [], isLoading: isLoadingTransacoes } = useQuery<TransacaoFinanceira[]>({
    queryKey: ['/api/transacoes'],
  });

  // Mutations - Equipes
  const createEquipeMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/equipes', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipes'] });
      toast({ title: "Equipe criada com sucesso" });
      setDialogState({ type: null, mode: 'add' });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar equipe", 
        description: error.message || "Tente novamente",
        variant: "destructive" 
      });
    },
  });

  const updateEquipeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/equipes/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipes'] });
      toast({ title: "Equipe atualizada com sucesso" });
      setDialogState({ type: null, mode: 'add' });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar equipe", 
        description: error.message || "Tente novamente",
        variant: "destructive" 
      });
    },
  });

  const deleteEquipeMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/equipes/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipes'] });
      toast({ title: "Equipe excluída com sucesso" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao excluir equipe", 
        description: error.message || "Esta equipe pode estar vinculada a partidas",
        variant: "destructive" 
      });
    },
  });

  // Mutations - Competições
  const createCompeticaoMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/competicoes', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/competicoes'] });
      toast({ title: "Competição criada com sucesso" });
      setDialogState({ type: null, mode: 'add' });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar competição", 
        description: error.message || "Tente novamente",
        variant: "destructive" 
      });
    },
  });

  const updateCompeticaoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/competicoes/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/competicoes'] });
      toast({ title: "Competição atualizada com sucesso" });
      setDialogState({ type: null, mode: 'add' });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar competição", 
        description: error.message || "Tente novamente",
        variant: "destructive" 
      });
    },
  });

  const deleteCompeticaoMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/competicoes/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/competicoes'] });
      toast({ title: "Competição excluída com sucesso" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao excluir competição", 
        description: error.message || "Esta competição pode estar vinculada a partidas",
        variant: "destructive" 
      });
    },
  });

  // Mutations - Mercados
  const createMercadoMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/mercados', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mercados'] });
      toast({ title: "Mercado criado com sucesso" });
      setDialogState({ type: null, mode: 'add' });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar mercado", 
        description: error.message || "Tente novamente",
        variant: "destructive" 
      });
    },
  });

  const updateMercadoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/mercados/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mercados'] });
      toast({ title: "Mercado atualizado com sucesso" });
      setDialogState({ type: null, mode: 'add' });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar mercado", 
        description: error.message || "Tente novamente",
        variant: "destructive" 
      });
    },
  });

  const deleteMercadoMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/mercados/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mercados'] });
      toast({ title: "Mercado excluído com sucesso" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao excluir mercado", 
        description: error.message || "Este mercado pode estar vinculado a estratégias ou operações",
        variant: "destructive" 
      });
    },
  });

  // Mutations - Estratégias
  const createEstrategiaMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/estrategias', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/estrategias'] });
      toast({ title: "Estratégia criada com sucesso" });
      setDialogState({ type: null, mode: 'add' });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar estratégia", 
        description: error.message || "Tente novamente",
        variant: "destructive" 
      });
    },
  });

  const updateEstrategiaMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/estrategias/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/estrategias'] });
      toast({ title: "Estratégia atualizada com sucesso" });
      setDialogState({ type: null, mode: 'add' });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar estratégia", 
        description: error.message || "Tente novamente",
        variant: "destructive" 
      });
    },
  });

  const deleteEstrategiaMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/estrategias/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/estrategias'] });
      toast({ title: "Estratégia excluída com sucesso" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao excluir estratégia", 
        description: error.message || "Esta estratégia pode estar vinculada a operações",
        variant: "destructive" 
      });
    },
  });

  // Mutations - Transações Financeiras
  const createTransacaoMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/transacoes', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transacoes'] });
      toast({ title: "Transação criada com sucesso" });
      setDialogState({ type: null, mode: 'add' });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar transação", description: error.message, variant: "destructive" });
    },
  });

  const updateTransacaoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest(`/api/transacoes/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transacoes'] });
      toast({ title: "Transação atualizada com sucesso" });
      setDialogState({ type: null, mode: 'add' });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar transação", description: error.message, variant: "destructive" });
    },
  });

  const deleteTransacaoMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/transacoes/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transacoes'] });
      toast({ title: "Transação excluída com sucesso" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao excluir transação", description: error.message, variant: "destructive" });
    },
  });

  // Preparar dados de estratégias com nome do mercado
  const estrategiasComMercado = estrategias.map(estrategia => {
    const mercado = mercados.find(m => m.id === estrategia.mercadoId);
    return { ...estrategia, mercado: mercado?.nome || 'N/A' };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Cadastros</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie equipes, competições, mercados e estratégias
          </p>
        </div>

        <Tabs defaultValue="equipes" className="space-y-6">
          <TabsList data-testid="tabs-cadastros">
            <TabsTrigger value="equipes">Equipes</TabsTrigger>
            <TabsTrigger value="competicoes">Competições</TabsTrigger>
            <TabsTrigger value="mercados">Mercados</TabsTrigger>
            <TabsTrigger value="estrategias">Estratégias</TabsTrigger>
            <TabsTrigger value="transacoes">Transações</TabsTrigger>
          </TabsList>

          <TabsContent value="equipes">
            <CadastroTable
              title="Equipes"
              items={equipes}
              isLoading={isLoadingEquipes}
              onAdd={() => setDialogState({ type: 'equipe', mode: 'add' })}
              onEdit={(item) => setDialogState({ type: 'equipe', mode: 'edit', data: item })}
              onDelete={(item) => {
                if (confirm(`Tem certeza que deseja excluir ${item.nome}?`)) {
                  deleteEquipeMutation.mutate(item.id);
                }
              }}
            />
          </TabsContent>

          <TabsContent value="competicoes">
            <CadastroTable
              title="Competições"
              items={competicoes}
              isLoading={isLoadingCompeticoes}
              onAdd={() => setDialogState({ type: 'competicao', mode: 'add' })}
              onEdit={(item) => setDialogState({ type: 'competicao', mode: 'edit', data: item })}
              onDelete={(item) => {
                if (confirm(`Tem certeza que deseja excluir ${item.nome}?`)) {
                  deleteCompeticaoMutation.mutate(item.id);
                }
              }}
            />
          </TabsContent>

          <TabsContent value="mercados">
            <CadastroTable
              title="Mercados"
              items={mercados}
              isLoading={isLoadingMercados}
              onAdd={() => setDialogState({ type: 'mercado', mode: 'add' })}
              onEdit={(item) => setDialogState({ type: 'mercado', mode: 'edit', data: item })}
              onDelete={(item) => {
                if (confirm(`Tem certeza que deseja excluir ${item.nome}?`)) {
                  deleteMercadoMutation.mutate(item.id);
                }
              }}
            />
          </TabsContent>

          <TabsContent value="estrategias">
            <CadastroTable
              title="Estratégias"
              items={estrategiasComMercado}
              isLoading={isLoadingEstrategias}
              showMercado={true}
              onAdd={() => setDialogState({ type: 'estrategia', mode: 'add' })}
              onEdit={(item) => setDialogState({ type: 'estrategia', mode: 'edit', data: item })}
              onDelete={(item) => {
                if (confirm(`Tem certeza que deseja excluir ${item.nome}?`)) {
                  deleteEstrategiaMutation.mutate(item.id);
                }
              }}
            />
          </TabsContent>

          <TabsContent value="transacoes">
            <CadastroTable
              title="Transações Financeiras"
              items={transacoes.map(t => {
                const dataFormatada = format(parseISO(t.data), 'dd/MM/yyyy');
                const valorFormatado = `R$ ${parseFloat(t.valor).toFixed(2).replace('.', ',')}`;
                const tipoLabel = t.tipo === 'DEPOSITO' ? 'Depósito' : 'Saque';
                return {
                  ...t,
                  nome: `${tipoLabel} - ${dataFormatada} - ${valorFormatado}`,
                  data_formatada: dataFormatada,
                  valor_formatado: valorFormatado,
                  tipo_label: tipoLabel
                };
              })}
              isLoading={isLoadingTransacoes}
              onAdd={() => setDialogState({ type: 'transacao', mode: 'add' })}
              onEdit={(item) => setDialogState({ type: 'transacao', mode: 'edit', data: item })}
              onDelete={(item) => {
                if (confirm(`Tem certeza que deseja excluir esta transação?`)) {
                  deleteTransacaoMutation.mutate(item.id);
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {dialogState.type === 'equipe' && (
        <EquipeDialog
          open={true}
          onClose={() => setDialogState({ type: null, mode: 'add' })}
          title={dialogState.mode === 'add' ? 'Adicionar Equipe' : 'Editar Equipe'}
          initialData={dialogState.data}
          isLoading={createEquipeMutation.isPending || updateEquipeMutation.isPending}
          onSubmit={(data) => {
            if (dialogState.mode === 'edit') {
              updateEquipeMutation.mutate({ id: dialogState.data.id, data });
            } else {
              createEquipeMutation.mutate(data);
            }
          }}
        />
      )}

      {dialogState.type === 'competicao' && (
        <CompeticaoDialog
          open={true}
          onClose={() => setDialogState({ type: null, mode: 'add' })}
          title={dialogState.mode === 'add' ? 'Adicionar Competição' : 'Editar Competição'}
          initialData={dialogState.data}
          isLoading={createCompeticaoMutation.isPending || updateCompeticaoMutation.isPending}
          onSubmit={(data) => {
            if (dialogState.mode === 'edit') {
              updateCompeticaoMutation.mutate({ id: dialogState.data.id, data });
            } else {
              createCompeticaoMutation.mutate(data);
            }
          }}
        />
      )}

      {dialogState.type === 'mercado' && (
        <MercadoDialog
          open={true}
          onClose={() => setDialogState({ type: null, mode: 'add' })}
          title={dialogState.mode === 'add' ? 'Adicionar Mercado' : 'Editar Mercado'}
          initialData={dialogState.data}
          isLoading={createMercadoMutation.isPending || updateMercadoMutation.isPending}
          onSubmit={(data) => {
            if (dialogState.mode === 'edit') {
              updateMercadoMutation.mutate({ id: dialogState.data.id, data });
            } else {
              createMercadoMutation.mutate(data);
            }
          }}
        />
      )}

      {dialogState.type === 'estrategia' && (
        <EstrategiaDialog
          open={true}
          onClose={() => setDialogState({ type: null, mode: 'add' })}
          title={dialogState.mode === 'add' ? 'Adicionar Estratégia' : 'Editar Estratégia'}
          initialData={dialogState.data}
          mercados={mercados}
          isLoading={createEstrategiaMutation.isPending || updateEstrategiaMutation.isPending}
          onSubmit={(data) => {
            if (dialogState.mode === 'edit') {
              updateEstrategiaMutation.mutate({ id: dialogState.data.id, data });
            } else {
              createEstrategiaMutation.mutate(data);
            }
          }}
        />
      )}

      {dialogState.type === 'transacao' && (
        <TransacaoDialog
          open={true}
          onClose={() => setDialogState({ type: null, mode: 'add' })}
          title={dialogState.mode === 'add' ? 'Adicionar Transação' : 'Editar Transação'}
          initialData={dialogState.data}
          isLoading={createTransacaoMutation.isPending || updateTransacaoMutation.isPending}
          onSubmit={(data) => {
            if (dialogState.mode === 'edit') {
              updateTransacaoMutation.mutate({ id: dialogState.data.id, data });
            } else {
              createTransacaoMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
}
