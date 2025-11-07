import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Settings } from "lucide-react";
import { GerenciarOpcoesDialog } from "./GerenciarOpcoesDialog";
import { useOpcoes } from "@/hooks/use-opcoes";

type OperacaoItem = {
  id: number;
  operacaoId: number;
  mercadoId: number;
  estrategiaId: number;
  stake: string;
  oddEntrada: string;
  tipoEncerramento: string | null;
  oddSaida: string | null;
  resultadoFinanceiro: string | null;
  tempoExposicaoMin: number | null;
  seguiuPlano: boolean | null;
  estadoEmocional: string | null;
  motivacaoEntrada: string | null;
  autoavaliacao: string | null;
  motivacaoSaidaObservacao: string | null;
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

interface OperacaoItemDialogProps {
  open: boolean;
  onClose: () => void;
  operacaoId: number;
  item: OperacaoItem | null;
  mercados: Mercado[];
  estrategias: Estrategia[];
}

const tiposEncerramento = ['Automático', 'Manual', 'Parcial'];

const defaultEstadosEmocionais = [
  'Ansioso',
  'Calmo',
  'Eufórico',
  'Foda-se',
  'Frustrado',
  'Irritado',
  'Neutro',
  'Preocupado com o red',
];

const defaultMotivacoesEntrada = [
  'Aleatória',
  'Análise/Método Pré-Jogo',
  'Intuição/Feeling',
  'Medo de perder oportunidade',
  'Recuperar prejuízo',
  'Sinal técnico',
];

const defaultAutoavaliacoes = ['Excelente', 'Boa', 'Regular', 'Ruim', 'Péssima'];

export default function OperacaoItemDialog({
  open,
  onClose,
  operacaoId,
  item,
  mercados,
  estrategias,
}: OperacaoItemDialogProps) {
  const { toast } = useToast();
  const isEdit = !!item;

  // Usar hook para buscar opções do banco de dados
  const estadosEmocionais = useOpcoes('estadoEmocional', defaultEstadosEmocionais);
  const motivacoesEntrada = useOpcoes('motivacaoEntrada', defaultMotivacoesEntrada);
  const autoavaliacoes = useOpcoes('autoavaliacao', defaultAutoavaliacoes);

  const [showEstadoManager, setShowEstadoManager] = useState(false);
  const [showMotivacaoManager, setShowMotivacaoManager] = useState(false);
  const [showAutoavaliacaoManager, setShowAutoavaliacaoManager] = useState(false);

  const schema = z.object({
    mercadoId: z.number({ required_error: "Mercado é obrigatório" }).int().positive(),
    estrategiaId: z.number({ required_error: "Estratégia é obrigatória" }).int().positive(),
    stake: z.union([z.coerce.number().positive({ message: "Stake deve ser maior que 0" }), z.literal('')]),
    oddEntrada: z.union([z.coerce.number().min(1.01, { message: "Odd entrada deve ser maior que 1.01" }), z.literal('')]),
    tipoEncerramento: z.string().optional(),
    oddSaida: z.union([z.coerce.number().min(1.01), z.literal('')]).optional(),
    resultadoFinanceiro: z.union([z.coerce.number(), z.literal('')]).optional(),
    tempoExposicaoMin: z.union([z.coerce.number().int().min(0), z.literal('')]).optional(),
    seguiuPlano: z.boolean().optional(),
    estadoEmocional: z.string().optional(),
    motivacaoEntrada: z.string().optional(),
    autoavaliacao: z.string().optional(),
    motivacaoSaidaObservacao: z.string().max(400).optional(),
  }).refine((data) => {
    if (data.tipoEncerramento === 'Manual') {
      const oddSaida = data.oddSaida;
      if (!oddSaida || oddSaida === '') {
        return false;
      }
    }
    return true;
  }, {
    message: "Odd de Saída é obrigatória para encerramento Manual",
    path: ["oddSaida"],
  });

  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      mercadoId: undefined,
      estrategiaId: undefined,
      stake: '',
      oddEntrada: '',
      tipoEncerramento: undefined,
      oddSaida: '',
      resultadoFinanceiro: '',
      tempoExposicaoMin: '',
      seguiuPlano: false,
      estadoEmocional: undefined,
      motivacaoEntrada: undefined,
      autoavaliacao: undefined,
      motivacaoSaidaObservacao: '',
    },
  });

  const mercadoId = form.watch('mercadoId');
  const tipoEncerramento = form.watch('tipoEncerramento');
  const estrategiasFiltradas = mercadoId 
    ? estrategias.filter(e => e.mercadoId === mercadoId)
    : [];

  const motivacaoSaidaValue = form.watch('motivacaoSaidaObservacao') || '';
  const charCount = motivacaoSaidaValue.length;

  useEffect(() => {
    if (open && item) {
      form.reset({
        mercadoId: item.mercadoId,
        estrategiaId: item.estrategiaId,
        stake: parseFloat(item.stake),
        oddEntrada: parseFloat(item.oddEntrada),
        tipoEncerramento: item.tipoEncerramento || undefined,
        oddSaida: item.oddSaida ? parseFloat(item.oddSaida) : '',
        resultadoFinanceiro: item.resultadoFinanceiro ? parseFloat(item.resultadoFinanceiro) : '',
        tempoExposicaoMin: item.tempoExposicaoMin || '',
        seguiuPlano: item.seguiuPlano || false,
        estadoEmocional: item.estadoEmocional || undefined,
        motivacaoEntrada: item.motivacaoEntrada || undefined,
        autoavaliacao: item.autoavaliacao || undefined,
        motivacaoSaidaObservacao: item.motivacaoSaidaObservacao || '',
      });
    } else if (open && !item) {
      form.reset({
        mercadoId: undefined,
        estrategiaId: undefined,
        stake: '',
        oddEntrada: '',
        tipoEncerramento: undefined,
        oddSaida: '',
        resultadoFinanceiro: '',
        tempoExposicaoMin: '',
        seguiuPlano: false,
        estadoEmocional: undefined,
        motivacaoEntrada: undefined,
        autoavaliacao: undefined,
        motivacaoSaidaObservacao: '',
      });
    }
  }, [open, item, form]);

  useEffect(() => {
    if (tipoEncerramento === 'Automático') {
      form.setValue('oddSaida', '');
    }
  }, [tipoEncerramento, form]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        operacaoId,
        stake: data.stake === '' ? undefined : data.stake,
        oddEntrada: data.oddEntrada === '' ? undefined : data.oddEntrada,
        tipoEncerramento: data.tipoEncerramento || undefined,
        oddSaida: data.oddSaida === '' ? undefined : data.oddSaida,
        resultadoFinanceiro: data.resultadoFinanceiro === '' ? undefined : data.resultadoFinanceiro,
        tempoExposicaoMin: data.tempoExposicaoMin === '' ? undefined : data.tempoExposicaoMin,
      };
      return apiRequest(`/api/operacoes/${operacaoId}/itens`, 'POST', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/operacoes/${operacaoId}/itens`] });
      toast({
        title: "Item adicionado",
        description: "O item foi adicionado à operação com sucesso.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar",
        description: error.message || "Não foi possível adicionar o item.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        stake: data.stake === '' ? undefined : data.stake,
        oddEntrada: data.oddEntrada === '' ? undefined : data.oddEntrada,
        tipoEncerramento: data.tipoEncerramento || undefined,
        oddSaida: data.oddSaida === '' ? undefined : data.oddSaida,
        resultadoFinanceiro: data.resultadoFinanceiro === '' ? undefined : data.resultadoFinanceiro,
        tempoExposicaoMin: data.tempoExposicaoMin === '' ? undefined : data.tempoExposicaoMin,
      };
      return apiRequest(`/api/operacoes/itens/${item?.id}`, 'PUT', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/operacoes/${operacaoId}/itens`] });
      toast({
        title: "Item atualizado",
        description: "O item foi atualizado com sucesso.",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar o item.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-operacao-item">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Editar Item' : 'Adicionar Item'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Linha 1: Mercado, Estratégia, Stake */}
              <div className="grid grid-cols-[1fr_1fr_140px] gap-4">
                <FormField
                  control={form.control}
                  name="mercadoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mercado *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(parseInt(value));
                          form.setValue('estrategiaId', undefined);
                        }}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-mercado">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mercados.map((mercado) => (
                            <SelectItem key={mercado.id} value={mercado.id.toString()}>
                              {mercado.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estrategiaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estratégia *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                        disabled={!mercadoId}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-estrategia">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estrategiasFiltradas.map((estrategia) => (
                            <SelectItem key={estrategia.id} value={estrategia.id.toString()}>
                              {estrategia.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stake (R$) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="10.00"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-stake"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Linha 2: Odd de Entrada, Encerramento, Odd de Saída */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="oddEntrada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Odd de Entrada *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="1.50"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-odd-entrada"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipoEncerramento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Encerramento</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-tipo-encerramento">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposEncerramento.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="oddSaida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Odd de Saída {tipoEncerramento === 'Manual' && '*'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="2.00"
                          {...field}
                          value={field.value || ""}
                          disabled={tipoEncerramento === 'Automático'}
                          data-testid="input-odd-saida"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Linha 3: Resultado Financeiro, Tempo de Exposição, Seguiu o Plano */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="resultadoFinanceiro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resultado Financeiro (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="5.00"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-resultado-financeiro"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tempoExposicaoMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo de Exposição (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="15"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-tempo-exposicao"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seguiuPlano"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seguiu o Método?</FormLabel>
                      <div className="flex items-center h-9">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-seguiu-plano"
                            className="mr-2"
                          />
                        </FormControl>
                        <span className="text-sm">Sim</span>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Linha 4: Estado Emocional, Motivação de Entrada, Autoavaliação */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="estadoEmocional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado Emocional</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          if (value === '__manage__') {
                            setShowEstadoManager(true);
                          } else {
                            field.onChange(value);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-estado-emocional">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estadosEmocionais.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                          <SelectItem value="__manage__" className="text-primary font-medium">
                            <div className="flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              Gerenciar opções
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motivacaoEntrada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivação de Entrada</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          if (value === '__manage__') {
                            setShowMotivacaoManager(true);
                          } else {
                            field.onChange(value);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-motivacao-entrada">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {motivacoesEntrada.map((motivacao) => (
                            <SelectItem key={motivacao} value={motivacao}>
                              {motivacao}
                            </SelectItem>
                          ))}
                          <SelectItem value="__manage__" className="text-primary font-medium">
                            <div className="flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              Gerenciar opções
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoavaliacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Autoavaliação</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          if (value === '__manage__') {
                            setShowAutoavaliacaoManager(true);
                          } else {
                            field.onChange(value);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-autoavaliacao">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {autoavaliacoes.map((avaliacao) => (
                            <SelectItem key={avaliacao} value={avaliacao}>
                              {avaliacao}
                            </SelectItem>
                          ))}
                          <SelectItem value="__manage__" className="text-primary font-medium">
                            <div className="flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              Gerenciar opções
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="motivacaoSaidaObservacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivação de Saída / Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva a motivação para saída ou observações sobre a operação..."
                        {...field}
                        maxLength={400}
                        data-testid="textarea-motivacao-saida"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground text-right">
                      {charCount}/400 caracteres
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Salvando...' 
                    : isEdit ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <GerenciarOpcoesDialog
        open={showEstadoManager}
        onClose={() => setShowEstadoManager(false)}
        campo="estadoEmocional"
        fieldLabel="Estados Emocionais"
        defaultOptions={defaultEstadosEmocionais}
      />

      <GerenciarOpcoesDialog
        open={showMotivacaoManager}
        onClose={() => setShowMotivacaoManager(false)}
        campo="motivacaoEntrada"
        fieldLabel="Motivações de Entrada"
        defaultOptions={defaultMotivacoesEntrada}
      />

      <GerenciarOpcoesDialog
        open={showAutoavaliacaoManager}
        onClose={() => setShowAutoavaliacaoManager(false)}
        campo="autoavaliacao"
        fieldLabel="Autoavaliações"
        defaultOptions={defaultAutoavaliacoes}
      />
    </>
  );
}
