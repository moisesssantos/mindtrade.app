import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertTransacaoFinanceiraSchema } from "@shared/schema";

const formSchema = insertTransacaoFinanceiraSchema.extend({
  valor: z.coerce.number().positive({ message: "Valor deve ser maior que 0" }),
});

interface TransacaoDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  initialData?: any;
  isLoading: boolean;
  onSubmit: (data: any) => void;
}

export function TransacaoDialog({ open, onClose, title, initialData, isLoading, onSubmit }: TransacaoDialogProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: '',
      hora: '',
      valor: 0,
      tipo: undefined as any,
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        data: initialData.data || '',
        hora: initialData.hora || '',
        valor: parseFloat(initialData.valor) || 0,
        tipo: initialData.tipo || undefined,
      });
    } else if (open && !initialData) {
      const hoje = new Date().toISOString().split('T')[0];
      const horaAtual = new Date().toTimeString().split(' ')[0].substring(0, 5);
      form.reset({
        data: hoje,
        hora: horaAtual,
        valor: 0,
        tipo: undefined,
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-data" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hora"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} data-testid="input-hora" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} data-testid="input-valor" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-tipo">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DEPOSITO">Depósito</SelectItem>
                        <SelectItem value="SAQUE">Saque</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancelar">
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
