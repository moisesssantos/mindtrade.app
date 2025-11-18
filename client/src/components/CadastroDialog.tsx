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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BaseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  description?: string;
  isLoading?: boolean;
}

/* ============================================================
   EQUIPE DIALOG COM VALIDAÇÃO DE DUPLICADOS
============================================================ */
interface EquipeDialogProps extends BaseDialogProps {
  initialData?: { id: number; nome: string };
  existentes: Array<{ id: number; nome: string }>;
}

export function EquipeDialog({
  open,
  onClose,
  onSubmit,
  title,
  description,
  initialData,
  existentes,
  isLoading,
}: EquipeDialogProps) {
  const [erroDuplicado, setErroDuplicado] = useState("");

  const schema = z.object({
    nome: z.string().min(1, "Nome é obrigatório").max(30, "Máximo 30 caracteres"),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nome: "" },
  });

  useEffect(() => {
    if (open) {
      setErroDuplicado("");
      form.reset({ nome: initialData?.nome || "" });
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: any) => {
    const jaExiste = existentes.some(
      (e) =>
        e.nome.trim().toLowerCase() === data.nome.trim().toLowerCase() &&
        e.id !== initialData?.id
    );

    if (jaExiste) {
      setErroDuplicado("Essa equipe já foi cadastrada.");
      return;
    }

    setErroDuplicado("");
    onSubmit(data);
  };

  const handleClose = () => {
    form.reset();
    setErroDuplicado("");
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
            {/* Campo Nome */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Equipe</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Flamengo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Erro de duplicado */}
            {erroDuplicado && (
              <p className="text-red-500 text-sm font-semibold">{erroDuplicado}</p>
            )}

            {/* Botões */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   COMPETIÇÃO DIALOG COM VALIDAÇÃO DE DUPLICADOS
============================================================ */
interface CompeticaoDialogProps extends BaseDialogProps {
  initialData?: { id: number; nome: string };
  existentes: Array<{ id: number; nome: string }>;
}

export function CompeticaoDialog({
  open,
  onClose,
  onSubmit,
  title,
  description,
  initialData,
  existentes,
  isLoading,
}: CompeticaoDialogProps) {
  const [erroDuplicado, setErroDuplicado] = useState("");

  const schema = z.object({
    nome: z.string().min(1, "Nome é obrigatório").max(30, "Máximo 30 caracteres"),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nome: "" },
  });

  useEffect(() => {
    if (open) {
      setErroDuplicado("");
      form.reset({ nome: initialData?.nome || "" });
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: any) => {
    const jaExiste = existentes.some(
      (c) =>
        c.nome.trim().toLowerCase() === data.nome.trim().toLowerCase() &&
        c.id !== initialData?.id
    );

    if (jaExiste) {
      setErroDuplicado("Essa competição já foi cadastrada.");
      return;
    }

    setErroDuplicado("");
    onSubmit(data);
  };

  const handleClose = () => {
    form.reset();
    setErroDuplicado("");
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
                    <Input {...field} placeholder="Ex: Brasileirão Série A" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {erroDuplicado && (
              <p className="text-red-500 text-sm font-semibold">{erroDuplicado}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   MERCADO DIALOG COM VALIDAÇÃO DE DUPLICADOS
============================================================ */
interface MercadoDialogProps extends BaseDialogProps {
  initialData?: { id: number; nome: string };
  existentes: Array<{ id: number; nome: string }>;
}

export function MercadoDialog({
  open,
  onClose,
  onSubmit,
  title,
  description,
  initialData,
  existentes,
  isLoading,
}: MercadoDialogProps) {
  const [erroDuplicado, setErroDuplicado] = useState("");

  const schema = z.object({
    nome: z.string().min(1, "Nome é obrigatório").max(30, "Máximo 30 caracteres"),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nome: "" },
  });

  useEffect(() => {
    if (open) {
      setErroDuplicado("");
      form.reset({ nome: initialData?.nome || "" });
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: any) => {
    const jaExiste = existentes.some(
      (m) =>
        m.nome.trim().toLowerCase() === data.nome.trim().toLowerCase() &&
        m.id !== initialData?.id
    );

    if (jaExiste) {
      setErroDuplicado("Esse mercado já foi cadastrado.");
      return;
    }

    setErroDuplicado("");
    onSubmit(data);
  };

  const handleClose = () => {
    form.reset();
    setErroDuplicado("");
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
                    <Input {...field} placeholder="Ex: Match Odds" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {erroDuplicado && (
              <p className="text-red-500 text-sm font-semibold">{erroDuplicado}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================
   ESTRATÉGIA DIALOG COM VALIDAÇÃO (NOME + MERCADO)
============================================================ */
interface EstrategiaDialogProps extends BaseDialogProps {
  initialData?: { id: number; nome: string; mercadoId?: number };
  mercados: Array<{ id: number; nome: string }>;
  existentes: Array<{ id: number; nome: string; mercadoId: number }>;
}

export function EstrategiaDialog({
  open,
  onClose,
  onSubmit,
  title,
  description,
  initialData,
  mercados,
  existentes,
  isLoading,
}: EstrategiaDialogProps) {
  const [erroDuplicado, setErroDuplicado] = useState("");

  const schema = z.object({
    nome: z.string().min(1, "Nome é obrigatório").max(30, "Máximo 30 caracteres"),
    mercadoId: z.number({ required_error: "Mercado é obrigatório" })
      .int()
      .positive(),
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
      setErroDuplicado("");
      form.reset({
        nome: initialData?.nome || "",
        mercadoId: initialData?.mercadoId as any,
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: any) => {
    const nomeNovo = data.nome.trim().toLowerCase();

    const jaExiste = existentes.some(
      (e) =>
        e.nome.trim().toLowerCase() === nomeNovo &&
        e.mercadoId === data.mercadoId &&
        e.id !== initialData?.id
    );

    if (jaExiste) {
      setErroDuplicado("Essa estratégia já foi cadastrada para este mercado.");
      return;
    }

    setErroDuplicado("");
    onSubmit(data);
  };

  const handleClose = () => {
    form.reset();
    setErroDuplicado("");
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
                    <Input {...field} placeholder="Ex: Lay 0-1" />
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
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o mercado" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {mercados.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {erroDuplicado && (
              <p className="text-red-500 text-sm font-semibold">{erroDuplicado}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
