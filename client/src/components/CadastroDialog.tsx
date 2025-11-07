import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BaseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  description?: string;
  isLoading?: boolean;
}

interface EquipeDialogProps extends BaseDialogProps {
  initialData?: { id: number; nome: string };
}

export function EquipeDialog({ open, onClose, onSubmit, title, description, initialData, isLoading }: EquipeDialogProps) {
  const schema = z.object({
    nome: z.string().min(1, "Nome é obrigatório").max(30, "Máximo 30 caracteres"),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nome: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ nome: initialData?.nome || "" });
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Equipe</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-nome-equipe" placeholder="Ex: Flamengo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancelar">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-salvar">
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface CompeticaoDialogProps extends BaseDialogProps {
  initialData?: { id: number; nome: string };
}

export function CompeticaoDialog({ open, onClose, onSubmit, title, description, initialData, isLoading }: CompeticaoDialogProps) {
  const schema = z.object({
    nome: z.string().min(1, "Nome é obrigatório").max(30, "Máximo 30 caracteres"),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nome: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ nome: initialData?.nome || "" });
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Competição</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-nome-competicao" placeholder="Ex: Brasileirão Série A" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancelar">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-salvar">
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface MercadoDialogProps extends BaseDialogProps {
  initialData?: { id: number; nome: string };
}

export function MercadoDialog({ open, onClose, onSubmit, title, description, initialData, isLoading }: MercadoDialogProps) {
  const schema = z.object({
    nome: z.string().min(1, "Nome é obrigatório").max(30, "Máximo 30 caracteres"),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nome: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ nome: initialData?.nome || "" });
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Mercado</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-nome-mercado" placeholder="Ex: Match Odds" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancelar">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-salvar">
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface EstrategiaDialogProps extends BaseDialogProps {
  initialData?: { id: number; nome: string; mercadoId?: number };
  mercados: Array<{ id: number; nome: string }>;
}

export function EstrategiaDialog({ open, onClose, onSubmit, title, description, initialData, mercados, isLoading }: EstrategiaDialogProps) {
  const schema = z.object({
    nome: z.string().min(1, "Nome é obrigatório").max(30, "Máximo 30 caracteres"),
    mercadoId: z.number({ required_error: "Mercado é obrigatório" }).int().positive(),
  });

  const form = useForm<{ nome: string; mercadoId?: number }>({
    resolver: zodResolver(schema),
    defaultValues: { 
      nome: "",
      mercadoId: undefined as any,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ 
        nome: initialData?.nome || "",
        mercadoId: initialData?.mercadoId as any,
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Estratégia</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-nome-estrategia" placeholder="Ex: Lay 0-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mercadoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mercado</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value ? field.value.toString() : undefined}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-mercado">
                        <SelectValue placeholder="Selecione o mercado" />
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
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancelar">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-salvar">
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
