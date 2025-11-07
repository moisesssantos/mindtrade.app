import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PartidaDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: {
    id?: number;
    data: string;
    hora: string;
    competicaoId: number;
    mandanteId: number;
    visitanteId: number;
    oddMandante?: number;
    oddVisitante?: number;
    oddEmpate?: number;
  };
  equipes: Array<{ id: number; nome: string }>;
  competicoes: Array<{ id: number; nome: string }>;
  isLoading: boolean;
}

export function PartidaDialog({ 
  open, 
  onClose, 
  onSubmit, 
  initialData, 
  equipes, 
  competicoes, 
  isLoading 
}: PartidaDialogProps) {
  const schema = z.object({
    data: z.string().min(1, "Data é obrigatória"),
    hora: z.string().min(1, "Hora é obrigatória"),
    competicaoId: z.number({ required_error: "Competição é obrigatória" }).int().positive(),
    mandanteId: z.number({ required_error: "Mandante é obrigatório" }).int().positive(),
    visitanteId: z.number({ required_error: "Visitante é obrigatório" }).int().positive(),
    oddMandante: z.union([z.coerce.number().min(1.01), z.literal('')]).optional(),
    oddVisitante: z.union([z.coerce.number().min(1.01), z.literal('')]).optional(),
    oddEmpate: z.union([z.coerce.number().min(1.01), z.literal('')]).optional(),
  });

  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      data: "",
      hora: "",
      competicaoId: undefined,
      mandanteId: undefined,
      visitanteId: undefined,
      oddMandante: "",
      oddVisitante: "",
      oddEmpate: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        data: initialData?.data || "",
        hora: initialData?.hora || "",
        competicaoId: initialData?.competicaoId as any,
        mandanteId: initialData?.mandanteId as any,
        visitanteId: initialData?.visitanteId as any,
        oddMandante: initialData?.oddMandante !== undefined ? initialData.oddMandante : "",
        oddVisitante: initialData?.oddVisitante !== undefined ? initialData.oddVisitante : "",
        oddEmpate: initialData?.oddEmpate !== undefined ? initialData.oddEmpate : "",
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: any) => {
    const payload = {
      ...data,
      oddMandante: data.oddMandante === "" ? undefined : data.oddMandante,
      oddVisitante: data.oddVisitante === "" ? undefined : data.oddVisitante,
      oddEmpate: data.oddEmpate === "" ? undefined : data.oddEmpate,
    };
    onSubmit(payload);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Editar Partida" : "Nova Partida"}</DialogTitle>
          <DialogDescription>
            {initialData?.id ? "Edite os dados da partida" : "Cadastre uma nova partida"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Linha 1: Data, Hora, Competição */}
            <div className="grid grid-cols-[1fr_1fr_2fr] gap-3">
              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-data" className="h-9" />
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
                    <FormLabel className="text-xs">Hora</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} data-testid="input-hora" className="h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="competicaoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Competição</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-competicao" className="h-9">
                          <SelectValue placeholder="Selecione a competição" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {competicoes.map((comp) => (
                          <SelectItem key={comp.id} value={comp.id.toString()}>
                            {comp.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Linha 2: Mandante vs Visitante + Odds */}
            <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-3">
                <FormField
                  control={form.control}
                  name="mandanteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Mandante</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value ? field.value.toString() : undefined}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-mandante" className="h-9">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {equipes.map((eq) => (
                            <SelectItem key={eq.id} value={eq.id.toString()}>
                              {eq.nome}
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
                  name="visitanteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Visitante</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value ? field.value.toString() : undefined}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-visitante" className="h-9">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {equipes.map((eq) => (
                            <SelectItem key={eq.id} value={eq.id.toString()}>
                              {eq.nome}
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
                  name="oddMandante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Odd Mandante</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="1.50"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-odd-mandante"
                          className="h-9" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="oddEmpate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Odd Empate</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="3.00"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-odd-empate"
                          className="h-9" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="oddVisitante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Odd Visitante</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="2.00"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-odd-visitante"
                          className="h-9" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <div className="flex justify-end gap-2 pt-2">
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
    </Dialog>
  );
}
