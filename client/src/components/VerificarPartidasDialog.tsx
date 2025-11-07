import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Partida = {
  id: number;
  data: string;
  hora: string;
  competicaoId: number;
  mandanteId: number;
  visitanteId: number;
  status: string;
};

type Equipe = {
  id: number;
  nome: string;
};

type Competicao = {
  id: number;
  nome: string;
};

type PartidaComResposta = Partida & {
  resposta?: 'SIM' | 'NAO' | null;
  justificativa?: string;
};

export default function VerificarPartidasDialog() {
  const [, setLocation] = useLocation();
  const [partidasPendentes, setPartidasPendentes] = useState<PartidaComResposta[]>([]);
  const [indexAtual, setIndexAtual] = useState(0);
  const [justificativa, setJustificativa] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Queries
  const { data: partidas = [], refetch } = useQuery<Partida[]>({
    queryKey: ['/api/partidas/pendentes-verificacao'],
    enabled: true,
  });

  const { data: equipes = [] } = useQuery<Equipe[]>({
    queryKey: ['/api/equipes'],
  });

  const { data: competicoes = [] } = useQuery<Competicao[]>({
    queryKey: ['/api/competicoes'],
  });

  // Mutation para marcar como não operada
  const marcarNaoOperadaMutation = useMutation({
    mutationFn: async ({ id, justificativa }: { id: number; justificativa: string }) => {
      return apiRequest(`/api/partidas/${id}/marcar-nao-operada`, 'PATCH', { justificativa });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partidas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/partidas/pendentes-verificacao'] });
    },
  });

  // Mutation para marcar como verificada (quando usuário responde SIM)
  const marcarVerificadaMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/partidas/${id}/marcar-verificada`, 'PATCH');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partidas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/partidas/pendentes-verificacao'] });
    },
  });

  // Inicializar partidas quando carregadas
  useEffect(() => {
    if (partidas.length > 0) {
      setPartidasPendentes(partidas.map(p => ({ ...p, resposta: null, justificativa: '' })));
      setIndexAtual(0);
      setDialogOpen(true);
    }
  }, [partidas]);

  const partidaAtual = partidasPendentes[indexAtual];

  const getPartidaInfo = (partida: Partida) => {
    const mandante = equipes.find(e => e.id === partida.mandanteId)?.nome || '';
    const visitante = equipes.find(e => e.id === partida.visitanteId)?.nome || '';
    const competicao = competicoes.find(c => c.id === partida.competicaoId)?.nome || '';
    return { mandante, visitante, competicao };
  };

  const handleSim = async () => {
    if (!partidaAtual) return;
    
    try {
      // Marcar partida como verificada para não aparecer novamente
      await marcarVerificadaMutation.mutateAsync(partidaAtual.id);
      
      // Fechar dialog e navegar para operação
      setDialogOpen(false);
      setLocation(`/operacoes/${partidaAtual.id}`);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível marcar a partida.",
        variant: "destructive",
      });
    }
  };

  const handleNao = async () => {
    if (!partidaAtual) return;
    
    if (!justificativa.trim()) {
      toast({
        title: "Justificativa obrigatória",
        description: "Por favor, informe o motivo de não ter operado esta partida.",
        variant: "destructive",
      });
      return;
    }

    try {
      await marcarNaoOperadaMutation.mutateAsync({
        id: partidaAtual.id,
        justificativa: justificativa.trim(),
      });

      toast({
        title: "Partida marcada",
        description: "A partida foi marcada como não operada.",
      });

      // Limpar justificativa e avançar
      setJustificativa("");
      
      // Se há mais partidas, ir para próxima
      if (indexAtual < partidasPendentes.length - 1) {
        setIndexAtual(indexAtual + 1);
      } else {
        // Fechar dialog
        setDialogOpen(false);
        refetch();
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível marcar a partida.",
        variant: "destructive",
      });
    }
  };

  const handlePular = () => {
    setJustificativa("");
    if (indexAtual < partidasPendentes.length - 1) {
      setIndexAtual(indexAtual + 1);
    } else {
      setDialogOpen(false);
    }
  };

  if (!partidaAtual) return null;

  const info = getPartidaInfo(partidaAtual);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-2xl" data-testid="dialog-verificar-partidas">
        <DialogHeader>
          <DialogTitle>
            Verificar Partidas Não Operadas
            {partidasPendentes.length > 1 && (
              <span className="text-sm text-muted-foreground ml-2">
                ({indexAtual + 1} de {partidasPendentes.length})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">
                {info.mandante} vs {info.visitante}
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{info.competicao}</div>
                <div>
                  {format(new Date(partidaAtual.data), 'dd/MM/yyyy', { locale: ptBR })} às {partidaAtual.hora}
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Label className="text-base font-medium">
              Esta partida foi operada?
            </Label>
            
            <div className="flex gap-3">
              <Button
                variant="default"
                className="flex-1"
                onClick={handleSim}
                data-testid="button-sim"
              >
                Sim, foi operada
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {}}
                data-testid="button-nao"
              >
                Não foi operada
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="justificativa">
                Justificativa (obrigatória se não foi operada)
              </Label>
              <Textarea
                id="justificativa"
                placeholder="Ex: Odds fora do intervalo esperado, mudança de contexto da partida, etc."
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                rows={4}
                data-testid="textarea-justificativa"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={handlePular}
              data-testid="button-pular"
            >
              Pular esta partida
            </Button>
            
            <Button
              variant="default"
              onClick={handleNao}
              disabled={!justificativa.trim()}
              data-testid="button-confirmar-nao-operada"
            >
              Confirmar Não Operada
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
