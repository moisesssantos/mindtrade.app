import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import OperacaoItemDialog from "@/components/OperacaoItemDialog";

// ================== Tipos ==================
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

interface OperacaoDialogProps {
  open: boolean;
  onClose: () => void;
  operacao: Operacao | null;
  partidas: Partida[];
  equipes: Equipe[];
  competicoes: Competicao[];
  mercados: Mercado[];
  estrategias: Estrategia[];
}

// ================== Componente ==================
export default function OperacaoDialog({
  open,
  onClose,
  operacao,
  partidas,
  equipes,
  competicoes,
  mercados,
  estrategias,
}: OperacaoDialogProps) {
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OperacaoItem | null>(null);
  const { toast } = useToast();

  const isEdit = !!operacao;
  const isCompleted = operacao?.status === "CONCLUIDA";

  const schema = z.object({
    partidaId: z
      .number({ required_error: "Partida é obrigatória" })
      .int()
      .positive(),
  });

  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      partidaId: undefined,
    },
  });

  // ================== Função para corrigir data ==================
  // Remove o deslocamento UTC e mantém a data exata cadastrada
  const corrigirDataLocal = (dataString: string) => {
    if (!dataString) return "";
    const d = new Date(dataString);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d;
  };

  // ================== Query: Itens da operação ==================
  const { data: itens = [], isLoading: isLoadingItens } = useQuery<OperacaoItem[]>({
    queryKey: ["/api/operacoes", operacao?.id, "itens"],
    enabled: isEdit,
  });

  useEffect(() => {
    if (open && operacao) {
      form.reset({ partidaId: operacao.partidaId });
    } else if (open && !operacao) {
      form.reset({ partidaId: undefined });
    }
  }, [open, operacao, form]);

  // ================== Mutations ==================
  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/operacoes", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operacoes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/partidas"] });
      toast({
        title: "Operação criada",
        description: "A operação foi criada com sucesso.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar",
        description: error.message || "Não foi possível criar a operação.",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: number) =>
      apiRequest(`/api/operacoes/itens/${itemId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/operacoes", operacao?.id, "itens"],
      });
      toast({
        title: "Item excluído",
        description: "O item foi excluído com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o item.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  const handleDeleteItem = (itemId: number) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      deleteItemMutation.mutate(itemId);
    }
  };

  const handleEditItem = (item: OperacaoItem) => {
    setSelectedItem(item);
    setItemDialogOpen(true);
  };

  // ================== Funções auxiliares ==================
  const getPartidaInfo = (partidaId: number) => {
    const partida = partidas.find((p) => p.id === partidaId);
    if (!partida)
      return { mandante: "", visitante: "", competicao: "", data: "", hora: "" };

    const mandante =
      equipes.find((e) => e.id === partida.mandanteId)?.nome || "";
    const visitante =
      equipes.find((e) => e.id === partida.visitanteId)?.nome || "";
    const competicao =
      competicoes.find((c) => c.id === partida.competicaoId)?.nome || "";

    return {
      mandante,
      visitante,
      competicao,
      data: partida.data,
      hora: partida.hora,
    };
  };

  const getMercadoNome = (id: number) =>
    mercados.find((m) => m.id === id)?.nome || "";

  const getEstrategiaNome = (id: number) =>
    estrategias.find((e) => e.id === id)?.nome || "";

  const calcularEstatisticas = () => {
    const totalStake = itens.reduce(
      (acc, item) => acc + parseFloat(item.stake || "0"),
      0
    );
    const resultadoTotal = itens.reduce(
      (acc, item) => acc + parseFloat(item.resultadoFinanceiro || "0"),
      0
    );
    const roi = totalStake > 0 ? (resultadoTotal / totalStake) * 100 : 0;

    return { totalStake, resultadoTotal, roi };
  };

  const stats = isEdit ? calcularEstatisticas() : null;

  const partidasDisponiveis = partidas.filter(
    (p) =>
      p.status === "OPERACAO_PENDENTE" ||
      (operacao && p.id === operacao.partidaId)
  );

  // ================== Render ==================
  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          data-testid="dialog-operacao"
        >
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Detalhes da Operação" : "Nova Operação"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {!isEdit && (
                <FormField
                  control={form.control}
                  name="partidaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partida *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-partida">
                            <SelectValue placeholder="Selecione uma partida" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {partidasDisponiveis.map((partida) => {
                            const info = getPartidaInfo(partida.id);
                            return (
                              <SelectItem
                                key={partida.id}
                                value={partida.id.toString()}
                              >
                                {info.mandante} vs {info.visitante} -{" "}
                                {format(
                                  corrigirDataLocal(info.data),
                                  "dd/MM/yyyy",
                                  { locale: ptBR }
                                )}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isEdit && operacao && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Informações da Partida
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(() => {
                        const info = getPartidaInfo(operacao.partidaId);
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Partida:
                              </span>
                              <span className="font-medium">
                                {info.mandante} vs {info.visitante}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Competição:
                              </span>
                              <span>{info.competicao}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Data/Hora:
                              </span>
                              <span>
                                {format(
                                  corrigirDataLocal(info.data),
                                  "dd/MM/yyyy",
                                  { locale: ptBR }
                                )}{" "}
                                às {info.hora}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Status:
                              </span>
                              <Badge
                                variant={
                                  operacao.status === "CONCLUIDA"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {operacao.status === "CONCLUIDA"
                                  ? "Concluída"
                                  : "Pendente"}
                              </Badge>
                            </div>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {stats && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Estatísticas</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Total Stake
                          </div>
                          <div className="text-lg font-bold font-mono">
                            R$ {stats.totalStake.toFixed(2).replace(".", ",")}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Resultado Total
                          </div>
                          <div
                            className={`text-lg font-bold font-mono ${
                              stats.resultadoTotal >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            R${" "}
                            {stats.resultadoTotal >= 0 ? "+" : ""}
                            {stats.resultadoTotal
                              .toFixed(2)
                              .replace(".", ",")}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">ROI</div>
                          <div
                            className={`text-lg font-bold font-mono ${
                              stats.roi >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {stats.roi >= 0 ? "+" : ""}
                            {stats.roi.toFixed(2).replace(".", ",")}%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Itens da Operação</h3>
                      {!isCompleted && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(null);
                            setItemDialogOpen(true);
                          }}
                          data-testid="button-add-item"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Item
                        </Button>
                      )}
                    </div>

                    {isLoadingItens ? (
                      <div className="text-center py-4">Carregando itens...</div>
                    ) : itens.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                          Nenhum item adicionado. Clique em "Adicionar Item" para
                          começar.
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {itens.map((item, index) => (
                          <Card key={item.id} data-testid={`card-item-${item.id}`}>
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-semibold mb-2">
                                    Item #{index + 1} - {getMercadoNome(item.mercadoId)} /{" "}
                                    {getEstrategiaNome(item.estrategiaId)}
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">
                                        Stake:
                                      </span>{" "}
                                      <span className="font-mono">
                                        R${" "}
                                        {parseFloat(item.stake)
                                          .toFixed(2)
                                          .replace(".", ",")}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Odd Entrada:
                                      </span>{" "}
                                      <span className="font-mono">
                                        {parseFloat(item.oddEntrada)
                                          .toFixed(2)
                                          .replace(".", ",")}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Odd Saída:
                                      </span>{" "}
                                      <span className="font-mono">
                                        {item.oddSaida
                                          ? parseFloat(item.oddSaida)
                                              .toFixed(2)
                                              .replace(".", ",")
                                          : "-"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">
                                        Resultado:
                                      </span>{" "}
                                      <span
                                        className={`font-mono ${
                                          item.resultadoFinanceiro &&
                                          parseFloat(item.resultadoFinanceiro) >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {item.resultadoFinanceiro
                                          ? `R$ ${parseFloat(
                                              item.resultadoFinanceiro
                                            )
                                              .toFixed(2)
                                              .replace(".", ",")}`
                                          : "-"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {!isCompleted && (
                                  <div className="flex gap-2 ml-4">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditItem(item)}
                                      data-testid={`button-edit-item-${item.id}`}
                                    >
                                      Editar
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteItem(item.id)}
                                      data-testid={`button-delete-item-${item.id}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  data-testid="button-cancel"
                >
                  {isEdit ? "Fechar" : "Cancelar"}
                </Button>
                {!isEdit && (
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createMutation.isPending ? "Criando..." : "Criar Operação"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {isEdit && operacao && (
        <OperacaoItemDialog
          open={itemDialogOpen}
          onClose={() => {
            setItemDialogOpen(false);
            setSelectedItem(null);
          }}
          operacaoId={operacao.id}
          item={selectedItem}
          mercados={mercados}
          estrategias={estrategias}
        />
      )}
    </>
  );
}
