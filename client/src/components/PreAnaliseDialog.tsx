import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Settings } from "lucide-react";
import { useOpcoes } from "@/hooks/use-opcoes";

interface PreAnaliseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  partidaId: number;
  initialData?: any;
  isLoading: boolean;
}

const MOMENTO_OPTIONS_DEFAULT = ["Boa Fase", "Má Fase", "Regular"];
const MUST_WIN_OPTIONS_DEFAULT = [
  "Título",
  "Rebaixamento",
  "Classificação competições importantes",
  "Clássico",
  "Quebra de Tabus",
  "Classificação próxima fase",
  "Irrelevante",
];
const IMPORTANCIA_OPTIONS_DEFAULT = [
  "Mais importante",
  "Menos importante",
  "Mesma importância",
  "Sem importância",
];
const DESFALQUES_OPTIONS_DEFAULT = [
  "Goleador",
  "Capitão",
  "Técnico",
  "Jogador Importante",
  "Jogador Decisivo",
  "Sem desfalques importantes",
];
const TENDENCIA_OPTIONS_DEFAULT = [
  "M Dominante",
  "V Dominante",
  "Trocação",
  "Jogo Truncado",
  "Jogo Complexo",
  "Jogo Morno",
];
const DESEMPENHO_OPTIONS_DEFAULT = ["Ótimo", "Bom", "Regular", "Ruim", "Péssimo"];
const VALOR_OPTIONS_DEFAULT = [
  "Odds Justas",
  "Odds Esmagadas",
  "Odds sem Valor",
  "Odds Boas",
];

export function PreAnaliseDialog({
  open,
  onClose,
  onSubmit,
  partidaId,
  initialData,
  isLoading,
}: PreAnaliseDialogProps) {
  const { opcoes: momentoOptions, addOpcao: addMomento, deleteOpcao: deleteMomento } = useOpcoes("momento", MOMENTO_OPTIONS_DEFAULT);
  const { opcoes: mustWinOptions, addOpcao: addMustWin, deleteOpcao: deleteMustWin } = useOpcoes("mustWin", MUST_WIN_OPTIONS_DEFAULT);
  const { opcoes: importanciaOptions, addOpcao: addImportancia, deleteOpcao: deleteImportancia } = useOpcoes("importancia", IMPORTANCIA_OPTIONS_DEFAULT);
  const { opcoes: desfalquesOptions, addOpcao: addDesfalques, deleteOpcao: deleteDesfalques } = useOpcoes("desfalques", DESFALQUES_OPTIONS_DEFAULT);
  const { opcoes: tendenciaOptions, addOpcao: addTendencia, deleteOpcao: deleteTendencia } = useOpcoes("tendencia", TENDENCIA_OPTIONS_DEFAULT);
  const { opcoes: desempenhoOptions, addOpcao: addDesempenho, deleteOpcao: deleteDesempenho } = useOpcoes("desempenho", DESEMPENHO_OPTIONS_DEFAULT);
  const { opcoes: valorOptions, addOpcao: addValor, deleteOpcao: deleteValor } = useOpcoes("valor", VALOR_OPTIONS_DEFAULT);

  // Estados para gerenciamento de opções
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [managingField, setManagingField] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [newOptionValue, setNewOptionValue] = useState("");

  const schema = z.object({
    classificacaoM: z.string().max(2).optional(),
    classificacaoV: z.string().max(2).optional(),
    momentoM: z.string().max(30).optional(),
    momentoV: z.string().max(30).optional(),
    mustWinM: z.string().max(40).optional(),
    mustWinV: z.string().max(40).optional(),
    importanciaProxPartidaM: z.string().max(30).optional(),
    importanciaProxPartidaV: z.string().max(30).optional(),
    desfalquesM: z.string().max(30).optional(),
    desfalquesV: z.string().max(30).optional(),
    tendenciaEsperada: z.string().max(30).optional(),
    desempenhoCasaM: z.string().max(30).optional(),
    desempenhoForaV: z.string().max(30).optional(),
    valorPotencial: z.string().max(30).optional(),
    destaqueEssencial: z.string().max(300).optional(),
  });

  const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {
    classificacaoM: "",
    classificacaoV: "",
    momentoM: "",
    momentoV: "",
    mustWinM: "",
    mustWinV: "",
    importanciaProxPartidaM: "",
    importanciaProxPartidaV: "",
    desfalquesM: "",
    desfalquesV: "",
    tendenciaEsperada: "",
    desempenhoCasaM: "",
    desempenhoForaV: "",
    valorPotencial: "",
    destaqueEssencial: "",
  },
});

const [campoGerenciado, setCampoGerenciado] = useState<string | null>(null);

function handleOpenManageDialog(campo: string) {
  setCampoGerenciado(campo);
}

function handleCloseManageDialog() {
  setCampoGerenciado(null);
}
function getFieldLabel(campo: string | null): string {
  switch (campo) {
    case "momento": return "Momentos";
    case "importancia": return "Importância";
    case "desfalques": return "Desfalques";
    case "valor": return "Valor Potencial";
    case "tendencia": return "Tendência Esperada";
    case "desempenho": return "Desempenho";
    default: return "";
  }
}

function getDefaultOptions(campo: string | null): string[] {
  switch (campo) {
    case "momento": return defaultMomentoOptions;
    case "importancia": return defaultImportanciaOptions;
    case "desfalques": return defaultDesfalquesOptions;
    case "valor": return defaultValorOptions;
    case "tendencia": return defaultTendenciaOptions;
    case "desempenho": return defaultDesempenhoOptions;
    default: return [];
  }
}
  
  useEffect(() => {
    if (open) {
      form.reset({
        classificacaoM: initialData?.classificacaoM || "",
        classificacaoV: initialData?.classificacaoV || "",
        momentoM: initialData?.momentoM || "",
        momentoV: initialData?.momentoV || "",
        mustWinM: initialData?.mustWinM || "",
        mustWinV: initialData?.mustWinV || "",
        importanciaProxPartidaM: initialData?.importanciaProxPartidaM || "",
        importanciaProxPartidaV: initialData?.importanciaProxPartidaV || "",
        desfalquesM: initialData?.desfalquesM || "",
        desfalquesV: initialData?.desfalquesV || "",
        tendenciaEsperada: initialData?.tendenciaEsperada || "",
        desempenhoCasaM: initialData?.desempenhoCasaM || "",
        desempenhoForaV: initialData?.desempenhoForaV || "",
        valorPotencial: initialData?.valorPotencial || "",
        destaqueEssencial: initialData?.destaqueEssencial || "",
      });
    }
  }, [open, initialData, form]);

  // Funções auxiliares para gerenciar opções
const getOptionsForField = (field: string): string[] => {
  switch (field) {
    case "momento": return momentoOptions;
    case "mustWin": return mustWinOptions;
    case "importancia": return importanciaOptions;
    case "desfalques": return desfalquesOptions;
    case "tendencia": return tendenciaOptions;
    case "desempenho": return desempenhoOptions;
    case "valor": return valorOptions;
    default: return [];
  }
};

const handleOpenManageDialog = (field: string) => {
  setManagingField(field);
  setEditingIndex(null);
  setEditingValue("");
  setManageDialogOpen(true);
};

const handleCloseManageDialog = () => {
  setManageDialogOpen(false);
  setManagingField("");
  setEditingIndex(null);
  setEditingValue("");
  setNewOptionValue("");
};

const handleAddOption = () => {
  if (newOptionValue.trim()) {
    const valor = newOptionValue.trim();
    switch (managingField) {
      case "momento": addMomento(valor); break;
      case "mustWin": addMustWin(valor); break;
      case "importancia": addImportancia(valor); break;
      case "desfalques": addDesfalques(valor); break;
      case "tendencia": addTendencia(valor); break;
      case "desempenho": addDesempenho(valor); break;
      case "valor": addValor(valor); break;
    }
    setNewOptionValue("");
  }
};

const handleEditOption = (index: number) => {
  setEditingIndex(index);
  setEditingValue(getOptionsForField(managingField)[index]);
};

const handleSaveEdit = () => {
  // Edição persistente ainda não implementada no hook
  // Pode ser mantida local ou removida até implementar updateOpcao
  setEditingIndex(null);
  setEditingValue("");
};

const handleCancelEdit = () => {
  setEditingIndex(null);
  setEditingValue("");
};

const handleDeleteOption = (index: number) => {
  setDeleteIndex(index);
  setDeleteConfirmOpen(true);
};

const confirmDelete = () => {
  if (deleteIndex !== null) {
    const valor = getOptionsForField(managingField)[deleteIndex];
    switch (managingField) {
      case "momento": deleteMomento(valor); break;
      case "mustWin": deleteMustWin(valor); break;
      case "importancia": deleteImportancia(valor); break;
      case "desfalques": deleteDesfalques(valor); break;
      case "tendencia": deleteTendencia(valor); break;
      case "desempenho": deleteDesempenho(valor); break;
      case "valor": deleteValor(valor); break;
    }
    setDeleteIndex(null);
    setDeleteConfirmOpen(false);
  }
};

const getFieldLabel = (field: string): string => {
  switch (field) {
    case "momento": return "Momento";
    case "mustWin": return "Must Win";
    case "importancia": return "Importância";
    case "desfalques": return "Desfalques";
    case "tendencia": return "Tendência";
    case "desempenho": return "Desempenho";
    case "valor": return "Valor Potencial";
    default: return "";
  }
};

const handleSubmit = (data: any) => {
  const payload = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== "")
  );
  onSubmit({ ...payload, partidaId });
};

const handleClose = () => {
  form.reset();
  onClose();
};

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Pré-Análise" : "Nova Pré-Análise"}</DialogTitle>
          <DialogDescription>
            Preencha os campos da pré-análise da partida. M = Mandante, V = Visitante
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
            
            {/* Classificação M vs V + Momento M e V na mesma linha */}
<div className="grid grid-cols-[80px_80px_1fr_1fr] gap-3">
  <FormField
    control={form.control}
    name="classificacaoM"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Classif. M</FormLabel>
        <FormControl>
          <Input
            {...field}
            placeholder="M"
            maxLength={2}
            data-testid="input-classificacao-m"
            className="text-center"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  <FormField
    control={form.control}
    name="classificacaoV"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Classif. V</FormLabel>
        <FormControl>
          <Input
            {...field}
            placeholder="V"
            maxLength={2}
            data-testid="input-classificacao-v"
            className="text-center"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />

  <FormField
    control={form.control}
    name="momentoM"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Momento M</FormLabel>
        <Select
          onValueChange={(value) => {
            if (value === "__manage__") {
              handleOpenManageDialog("momento");
            } else {
              field.onChange(value);
            }
          }}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger data-testid="select-momento-m">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {(momentoOptions ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="__manage__">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Gerenciar opções...</span>
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
    name="momentoV"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Momento V</FormLabel>
        <Select
          onValueChange={(value) => {
            if (value === "__manage__") {
              handleOpenManageDialog("momento");
            } else {
              field.onChange(value);
            }
          }}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger data-testid="select-momento-v">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {(momentoOptions ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="__manage__">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Gerenciar opções...</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
</div>

           {/* Must Win M e V */}
<div className="grid grid-cols-2 gap-3">
  <FormField
    control={form.control}
    name="mustWinM"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Must Win M</FormLabel>
        <Select
          onValueChange={(value) => {
            if (value === "__manage__") {
              handleOpenManageDialog("mustWin");
            } else {
              field.onChange(value);
            }
          }}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger data-testid="select-must-win-m">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {(mustWinOptions ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="__manage__">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Gerenciar opções...</span>
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
    name="mustWinV"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Must Win V</FormLabel>
        <Select
          onValueChange={(value) => {
            if (value === "__manage__") {
              handleOpenManageDialog("mustWin");
            } else {
              field.onChange(value);
            }
          }}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger data-testid="select-must-win-v">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {(mustWinOptions ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="__manage__">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Gerenciar opções...</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
</div>

            {/* Importância Próx. Partida M e V */}
<div className="grid grid-cols-2 gap-3">
  <FormField
    control={form.control}
    name="importanciaProxPartidaM"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Importância Próx. M</FormLabel>
        <Select
          onValueChange={(value) => {
            if (value === "__manage__") {
              handleOpenManageDialog("importancia");
            } else {
              field.onChange(value);
            }
          }}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger data-testid="select-importancia-m">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {(importanciaOptions ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="__manage__">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Gerenciar opções...</span>
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
    name="importanciaProxPartidaV"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Importância Próx. V</FormLabel>
        <Select
          onValueChange={(value) => {
            if (value === "__manage__") {
              handleOpenManageDialog("importancia");
            } else {
              field.onChange(value);
            }
          }}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger data-testid="select-importancia-v">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {(importanciaOptions ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="__manage__">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Gerenciar opções...</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
</div>

            {/* Desfalques M, V e Valor Potencial */}
<div className="grid grid-cols-3 gap-3">
  <FormField
    control={form.control}
    name="desfalquesM"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Desfalques M</FormLabel>
        <Select
          onValueChange={(value) => {
            if (value === "__manage__") {
              handleOpenManageDialog("desfalques");
            } else {
              field.onChange(value);
            }
          }}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger data-testid="select-desfalques-m">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {(desfalquesOptions ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="__manage__">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Gerenciar opções...</span>
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
    name="desfalquesV"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Desfalques V</FormLabel>
        <Select
          onValueChange={(value) => {
            if (value === "__manage__") {
              handleOpenManageDialog("desfalques");
            } else {
              field.onChange(value);
            }
          }}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger data-testid="select-desfalques-v">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {(desfalquesOptions ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="__manage__">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Gerenciar opções...</span>
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
    name="valorPotencial"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Valor Potencial</FormLabel>
        <Select
          onValueChange={(value) => {
            if (value === "__manage__") {
              handleOpenManageDialog("valor");
            } else {
              field.onChange(value);
            }
          }}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger data-testid="select-valor-potencial">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {(valorOptions ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="__manage__">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Gerenciar opções...</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
</div>

            {/* Tendência Esperada + Desempenho Casa M + Desempenho Fora V na mesma linha */}
<div className="grid grid-cols-3 gap-3">
  <FormField
    control={form.control}
    name="tendenciaEsperada"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Tendência Esperada</FormLabel>
        <Select
          onValueChange={(value) => {
            if (value === "__manage__") {
              handleOpenManageDialog("tendencia");
            } else {
              field.onChange(value);
            }
          }}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger data-testid="select-tendencia">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {(tendenciaOptions ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="__manage__">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Gerenciar opções...</span>
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
    name="desempenhoCasaM"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Desempenho Casa M</FormLabel>
        <Select
          onValueChange={(value) => {
            if (value === "__manage__") {
              handleOpenManageDialog("desempenho");
            } else {
              field.onChange(value);
            }
          }}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger data-testid="select-desempenho-casa">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {(desempenhoOptions ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="__manage__">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Gerenciar opções...</span>
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
    name="desempenhoForaV"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Desempenho Fora V</FormLabel>
        <Select
          onValueChange={(value) => {
            if (value === "__manage__") {
              handleOpenManageDialog("desempenho");
            } else {
              field.onChange(value);
            }
          }}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger data-testid="select-desempenho-fora">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {(desempenhoOptions ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
            <SelectItem value="__manage__">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Gerenciar opções...</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
</div>

            {/* Destaques Importantes */}
            <FormField
              control={form.control}
              name="destaqueEssencial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destaques Importantes</FormLabel>
                  <FormControl>
                    <Textarea {...field} maxLength={300} rows={2} data-testid="textarea-destaque" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancelar" size="sm">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-salvar" size="sm">
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      {/* Dialog de Gerenciamento de Opções */}
      <Dialog open={manageDialogOpen} onOpenChange={handleCloseManageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar {getFieldLabel(managingField)}</DialogTitle>
            <DialogDescription>
              Adicione, edite ou remova as opções personalizadas
            </DialogDescription>
          </DialogHeader>
          
          {/* Campo para adicionar nova opção */}
          <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
            <Input
              value={newOptionValue}
              onChange={(e) => setNewOptionValue(e.target.value)}
              placeholder="Nova opção..."
              className="flex-1"
              maxLength={40}
              data-testid="input-new-option"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOption();
                }
              }}
            />
            <Button onClick={handleAddOption} size="sm" variant="default" data-testid="button-add-option">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {/* Lista de opções existentes */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {getOptionsForField(managingField).map((option, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded-md border bg-card">
                {editingIndex === index ? (
                  <>
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="flex-1"
                      maxLength={40}
                      data-testid={`input-edit-option-${index}`}
                    />
                    <Button onClick={handleSaveEdit} size="sm" variant="default" data-testid={`button-save-edit-${index}`}>
                      Salvar
                    </Button>
                    <Button onClick={handleCancelEdit} size="sm" variant="outline" data-testid={`button-cancel-edit-${index}`}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{option}</span>
                    <Button onClick={() => handleEditOption(index)} size="sm" variant="ghost" data-testid={`button-edit-${index}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDeleteOption(index)} size="sm" variant="ghost" data-testid={`button-delete-${index}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCloseManageDialog} variant="outline" data-testid="button-close-manage">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta opção? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="button-confirm-delete">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
