import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const arquivarPartidaSchema = z.object({
  justificativa: z.string().min(1, "Justificativa é obrigatória").max(500, "Justificativa muito longa"),
});

type ArquivarPartidaFormData = z.infer<typeof arquivarPartidaSchema>;

interface ArquivarPartidaDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ArquivarPartidaFormData) => void;
  isLoading?: boolean;
}

export function ArquivarPartidaDialog({ 
  open, 
  onClose, 
  onSubmit, 
  isLoading = false 
}: ArquivarPartidaDialogProps) {
  const form = useForm<ArquivarPartidaFormData>({
    resolver: zodResolver(arquivarPartidaSchema),
    defaultValues: {
      justificativa: "",
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        justificativa: "",
      });
    }
  }, [open, form]);

  const handleSubmit = (data: ArquivarPartidaFormData) => {
    onSubmit(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md" data-testid="dialog-arquivar-partida">
        <DialogHeader>
          <DialogTitle>Arquivar Partida</DialogTitle>
          <DialogDescription>
            Informe o motivo pelo qual esta partida não foi operada
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="justificativa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da Não Operação</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ex: Odds desfavoráveis, lesão de jogador chave, condições climáticas adversas..."
                      rows={4}
                      {...field}
                      data-testid="input-justificativa"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                data-testid="button-cancelar"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-testid="button-arquivar"
              >
                {isLoading ? "Arquivando..." : "Arquivar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
