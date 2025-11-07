import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type OpcaoCustomizada = {
  id: number;
  campo: string;
  opcao: string;
  ordem: number;
};

interface GerenciarOpcoesDialogProps {
  open: boolean;
  onClose: () => void;
  campo: string;
  fieldLabel: string;
  defaultOptions: string[];
}

export function GerenciarOpcoesDialog({
  open,
  onClose,
  campo,
  fieldLabel,
  defaultOptions,
}: GerenciarOpcoesDialogProps) {
  const { toast } = useToast();
  const [newOptionValue, setNewOptionValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data: opcoesCustomizadas = [] } = useQuery<OpcaoCustomizada[]>({
    queryKey: [`/api/opcoes/${campo}`],
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: (opcao: string) => {
      const ordem = opcoesCustomizadas.length + defaultOptions.length;
      return apiRequest("/api/opcoes", "POST", { campo, opcao, ordem });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/opcoes/${campo}`] });
      setNewOptionValue("");
      toast({
        title: "Opção adicionada",
        description: "A nova opção foi adicionada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar",
        description: error.message || "Não foi possível adicionar a opção.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, opcao }: { id: number; opcao: string }) => 
      apiRequest(`/api/opcoes/${id}`, "PUT", { opcao }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/opcoes/${campo}`] });
      setEditingId(null);
      setEditingValue("");
      toast({
        title: "Opção atualizada",
        description: "A opção foi atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar a opção.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/opcoes/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/opcoes/${campo}`] });
      setDeleteId(null);
      setDeleteConfirmOpen(false);
      toast({
        title: "Opção excluída",
        description: "A opção foi excluída com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir a opção.",
        variant: "destructive",
      });
    },
  });

  const handleAddOption = () => {
    const trimmed = newOptionValue.trim();
    if (trimmed) {
      createMutation.mutate(trimmed);
    }
  };

  const handleEditOption = (id: number, opcao: string) => {
    setEditingId(id);
    setEditingValue(opcao);
  };

  const handleSaveEdit = () => {
    const trimmed = editingValue.trim();
    if (editingId !== null && trimmed) {
      updateMutation.mutate({ id: editingId, opcao: trimmed });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const handleDeleteOption = (id: number) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId);
    }
  };

  const handleClose = () => {
    setEditingId(null);
    setEditingValue("");
    setNewOptionValue("");
    onClose();
  };

  const allOptions = [
    ...defaultOptions.map((opt, idx) => ({ id: -idx - 1, campo, opcao: opt, ordem: idx, isDefault: true })),
    ...opcoesCustomizadas.map(opt => ({ ...opt, isDefault: false })),
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar {fieldLabel}</DialogTitle>
            <DialogDescription>
              Adicione, edite ou remova as opções personalizadas
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
            <Input
              value={newOptionValue}
              onChange={(e) => setNewOptionValue(e.target.value)}
              placeholder="Nova opção..."
              className="flex-1"
              maxLength={100}
              data-testid="input-new-option"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOption();
                }
              }}
              disabled={createMutation.isPending}
            />
            <Button 
              onClick={handleAddOption} 
              size="sm" 
              variant="default" 
              data-testid="button-add-option"
              disabled={createMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {allOptions.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2 p-2 rounded-md border bg-card">
                {editingId === option.id && !option.isDefault ? (
                  <>
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="flex-1"
                      maxLength={100}
                      data-testid={`input-edit-option-${index}`}
                      disabled={updateMutation.isPending}
                    />
                    <Button 
                      onClick={handleSaveEdit} 
                      size="sm" 
                      variant="default" 
                      data-testid={`button-save-edit-${index}`}
                      disabled={updateMutation.isPending}
                    >
                      Salvar
                    </Button>
                    <Button 
                      onClick={handleCancelEdit} 
                      size="sm" 
                      variant="outline" 
                      data-testid={`button-cancel-edit-${index}`}
                      disabled={updateMutation.isPending}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1">{option.opcao}</span>
                    {!option.isDefault && (
                      <>
                        <Button 
                          onClick={() => handleEditOption(option.id, option.opcao)} 
                          size="sm" 
                          variant="ghost" 
                          data-testid={`button-edit-${index}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteOption(option.id)} 
                          size="sm" 
                          variant="ghost" 
                          data-testid={`button-delete-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleClose} variant="outline" data-testid="button-close-manage">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta opção? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              data-testid="button-confirm-delete"
              disabled={deleteMutation.isPending}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
